var express = require('express');
var router = express.Router();
var rest = require('restler');

var cache = {};

/* GET users listing. */
router.get('/:stopId', function(req, res) {
  if(cache[req.params.stopId] !== undefined){
    addEstimates(cache[req.params.stopId], function(data){
      res.json(data);
    });
  }
  else {
    rest.get(API_ENDPOINT + 'stops/' + req.params.stopId + '?apikey=' + process.env.TRANSLINK_KEY).on('complete', function (data) {
      if (data.Stop == null) {
        res.json({"error": "An error occured. Maybe the stop doesn't exist?"});
      }

      // GENERATE OUR STATIC DATA
      data = {
        'stop': data.Stop.StopNo[0],
        'name': data.Stop.Name[0],
        'accessible': data.Stop.WheelchairAccess[0] === 1,
        'street': data.Stop.OnStreet[0],
        'lat': data.Stop.Latitude[0],
        'long': data.Stop.Longitude[0],
        'buses': data.Stop.Routes[0].split(',').map(function (bus) {
          return bus.trim();
        }).map(trimBus)
      };

      cache[data.number] = data;

      addEstimates(data, function(data){
        res.json(data);
      });

    });
  }

});
router.get('/:stopId/times', function(req, res) {
  addEstimates({'number': req.params.stopId}, function(data){
    res.json(data.times);
  })
});

function addEstimates(old, cb){
  rest.get(API_ENDPOINT + 'stops/' + old.stop + '/estimates?apikey=' + process.env.TRANSLINK_KEY).on('complete', function (data) {
    data = data.NextBuses.NextBus;
    var out = [];
    for(var i = 0; i < data.length; i++){
      var route = {
        'bus': trimBus(data[i].RouteNo[0]),
        'direction': data[i].Direction[0]
      };
      var next = data[i].Schedules[0].Schedule;
      for(var j = 0; j < next.length; j++){
          out.push({
            'bus': route.number,
            'direction': route.direction,
            'destination': next[j].Destination[0],
            'minutes': Number(next[j].ExpectedCountdown[0])
          });
      }
    }

    out.sort(function(a, b){
      return a.minutes - b.minutes;
    });
    old.times = out;
    cb(old);
  });
}

module.exports = router;
