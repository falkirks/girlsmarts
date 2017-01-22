module.exports = function (io) {
  var express = require('express');
  var router = express.Router();

  router.get('/', function (req, res) {
    res.render('fun', {title: 'Girlsmarts Programming'});
  });
  return router;
};
