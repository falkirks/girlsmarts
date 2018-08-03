module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  var path = require('path');

  router.get('/', function (req, res) {
    res.render('fun', {title: 'CPSC 210'});
  });
  return router;
};
