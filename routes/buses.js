module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  var rest = require('restler');
  var cache = {};

 /* router.get('/', function(req, res) {
    rest.get(API_ENDPOINT + 'buses?apikey=' + process.env.TRANSLINK_KEY).on('complete', function(data) {
      if(data.Buses == null){
        res.json({"error": "An error occured."});
        io.emit('error', {
          type: 'allbuses'
        });
        return;
      }
      data = data.Buses.Bus;
      for(var i = 0; i < data.length; i++){
        data[i] = {
          'bus': trimBus(data[i].RouteNo[0]),
          'direction': data[i].Direction[0],
          'destination': data[i].Destination[0],
          'lat': data[i].Latitude[0],
          'long': data[i].Longitude[0]
        };
      }
      res.json(data);
      io.emit('api', {type: "allbuses"});

    });
  });*/

  router.get('/', function(req, res) {
    if(cache[req.query.stopId] !== undefined && cache[req.query.stopId].time+(1000*60*15) > Date.now()){
      io.emit('api', {'type': "buses", "stop": req.query.stopId, "cached": true});
      res.json(cache[req.query.stopId].data);
    }
    else {
      rest.get(API_ENDPOINT + 'buses?apikey=' + process.env.TRANSLINK_KEY + '&stopNo=' + req.query.stopNo, {headers: {'Accept': 'Application/json'}}).on('complete', function (data) {
        cache[req.query.stopId] = {data: data, time: Date.now()};
        res.json(data);
        io.emit('api', {type: "buses", stop: req.query.stopId});
      });
    }
  });
  return router;
};
