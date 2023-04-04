var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.locals.title = "Expressito"; //Otra forma de mandar el parametro
  res.render('index', { title: 'Express' });
});

module.exports = router;
