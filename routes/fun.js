module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  var path = require('path');

  router.get('/', function (req, res) {
    res.render('fun', {title: 'Girlsmarts Programming'});
  });
  router.get('/track', function (req, res) {
    res.sendFile(path.resolve('public/t.gif'));
    io.emit('tutorial', {
      index: req.query.index,
      total: req.query.total,
      completed: req.query.completed == "true",
      time: req.query.time,
      anonid: req.query.anonid
    });
  });
  return router;
};
