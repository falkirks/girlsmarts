module.exports = function (io) {
  var express = require('express');
  var router = express.Router();
  const scrapeIt = require("scrape-it");

  var names = {};


  /* GET home page. */

  var getName = function (linkId, cb) {
    if (names[linkId] !== undefined) {
      cb(names[linkId]);
    }
    else {
      scrapeIt("https://www.touchdevelop.com/" + linkId, {
        title: ".row h2"
      }).then(function (page) {
        if(page.title === "Sorry, the page you were looking for doesn’t exist"){
          cb(null);
          names[linkId] = null; //NOTE! CACHING NEGATIVES IS NOT GOOD PRACTICE! but we are scraping...
        }
        else {
          names[linkId] = page.title.replace("girlsmarts2017", "").trim();
          cb(names[linkId]);
        }
      });
    }
  };

  router.get('/', function (req, res) {
    res.render('index', {title: 'Girlsmarts Programming'});
  });
  router.get('/:linkId', function (req, res) {
    getName(req.params.linkId, function (name) {
      if(name !== null) {
        res.render('index', {
          title: 'Girlsmarts Programming',
          linkId: req.params.linkId,
          name: name
        });
      }
      else{
        res.render('index', {title: 'Girlsmarts Programming'});
      }
    });

  });
  return router;
};
