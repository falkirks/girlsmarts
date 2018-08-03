module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  var rest = require('restler');

  var cache = {};

  var estimatesOnlyCache = {};

  router.get('/:stopId/estimates', function(req, res) {
    if(estimatesOnlyCache[req.params.stopId] !== undefined && estimatesOnlyCache[req.params.stopId].time+(1000*60*30) > Date.now()){
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
