var express = require('express');
var router = express.Router();

const quizController = require('../controllers/quiz');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Quiz', message: 'The Web site where you can create you own games!' });
  
  //res.locals.title = "Expressito"; //Otra forma de mandar el parametro
  //res.render('index'); //Se pueden eliminar los parametros e insertar directamente los mensajes en el codigo html de la vista index.
});


//Author page
router.get('/author', (req, res, next) => {
  res.render('author');
});


//Autoload para las rutas que usen un parametro :quizId, se benefician de este metodo los controladores cuya ruta contenga el quizId
router.param('quizId', quizController.load);

//Rutas para el CRUD de los quizzes - HTML solo GET y POST  --> Method Override para gestionar PUT y DELETE
router.get('/quizzes', quizController.index);
router.get('/quizzes/:quizId(\\d+)', quizController.show);
router.get('/quizzes/new', quizController.new);
router.post('/quizzes', quizController.create);
//router.get('/quizzes/:quizId(\\d+)/edit', quizController.edit);
//router.put('/quizzes/:quizId(\\d+)', quizController.update);
//router.delete('/quizzes/:quizId(\\d+)', quizController.destroy);

//Rutas para jugar con los quizzes
router.get('/quizzes/:quizId(\\d+)/play', quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);


module.exports = router;
