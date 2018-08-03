module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  var rest = require('restler');

  var cache = {};

  var estimatesOnlyCache = {};

  /* GET users listing. */
  router.get('/:stopId', function(req, res) {
    if(cache[req.params.stopId] !== undefined){
      addEstimates(cache[req.params.stopId], function(data){
        res.json(data);
      });
      var payload = cache[req.params.stopId];
      payload.type = 'stops';
      io.emit('api', payload);
    }
    else {
      rest.get(API_ENDPOINT + 'stops/' + req.params.stopId + '?apikey=' + process.env.TRANSLINK_KEY).on('complete', function (data) {
        if (data.Stop == null) {
          res.json({"error": "An error occured. Maybe the stop doesn't exist?"});

          io.emit('error', {
            type: 'stops',
            ref: req.params.stopId
          });

          return;
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

        var payload = cache[data.number];
        payload.type = 'stops';
        io.emit('api', payload);

      });
    }

  });
  router.get('/:stopId/estimates', function(req, res) {
    if(estimatesOnlyCache[req.params.stopId] !== undefined && estimatesOnlyCache[req.params.stopId].time+(1000*60*15) > Date.now()){
      io.emit('api', {'type': "stops", "stop": req.params.stopId, "cached": true});
      res.json(estimatesOnlyCache[req.params.stopId].data);
    }
    else {
      addEstimates({stop: req.params.stopId}, function(data){
        estimatesOnlyCache[req.params.stopId] = {data: data, time: Date.now()};
        res.json(data);
        io.emit('api', {'type': "stops", "stop": req.params.stopId, "cached": false});
      })
    }
  });

  function addEstimates(old, cb){
    rest.get(API_ENDPOINT + 'stops/' + old.stop + '/estimates?apikey=' + process.env.TRANSLINK_KEY, {headers: { 'Accept': 'Application/json' }}).on('complete', function (data) {
      cb(data);
    });
  }

  return router;
};
