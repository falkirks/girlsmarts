var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Fluffy Translink API' });
});
router.get('/:linkId', function(req, res) {
  res.render('index', { title: 'Fluffy Translink API',
                        linkId: req.params.linkId});
});

module.exports = router;
