module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  var rest = require('restler');

  router.get('/', function(req, res) {
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
  });

  router.get('/:stopId', function(req, res) {
    rest.get(API_ENDPOINT + 'buses?apikey=' + process.env.TRANSLINK_KEY + '&stopNo=' + req.params.stopId).on('complete', function(data) {
      if(data.Buses == null){
        res.json({"error": "An error occured. Maybe the stop doesn't exist?"});
        io.emit('error', {
          type: 'buses',
          ref: req.params.stopId
        });
        return;
      }
      data = data.Buses.Bus;
      for(var i = 0; i < data.length; i++){
        data[i] = {
          'number': trimBus(data[i].RouteNo[0]),
          'direction': data[i].Direction[0],
          'destination': data[i].Destination[0],
          'lat': data[i].Latitude[0],
          'long': data[i].Longitude[0]
        };
      }
      res.json(data);
      io.emit('api', {type: "buses", stop: req.params.stopId});
    });
  });
  return router;
};
