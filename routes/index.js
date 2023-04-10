var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.locals.title = "Expressito"; //Otra forma de mandar el parametro
  res.render('index', { title: 'Welcome to Quiz', message: 'The Web site where you can create you own games!' });
  
  //res.render('index'); //Se pueden eliminar los parametros e insertar directamente los mensajes en el codigo html de la vista index.
});

module.exports = router;
