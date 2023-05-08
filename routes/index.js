var express = require('express');
var router = express.Router();

const quizController = require('../controllers/quiz');
const userController = require('../controllers/user');


//Implementar rutas de restauracion (GO BACK)

//Redireccion a la ruta almacenada (o raiz)
function redirectBack (req, res, next) {
  const url = req.session.backURL || "/";
  delete req.session.backURL; //Se borra para limpiarlo
  res.redirect(url);
}

router.get('/goback', redirectBack);


//Almacenar la ruta
function saveBack(req, res, next) {
  req.session.backURL = req.url;
  next();
}

//'Al volver atras', solo se podra volver atras a una de las siguientes rutas definidas
router.get(['/', '/author', '/quizzes', '/users'], saveBack);


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

//Autoload para las rutas que usen un parametro :userId, se benefician de este metodo los controladores cuya ruta contenga el userId
router.param('userId', userController.load);

//Rutas para el CRUD de los quizzes - HTML solo GET y POST  --> Method Override para gestionar PUT y DELETE
router.get('/quizzes', quizController.index);
router.get('/quizzes/:quizId(\\d+)', quizController.show);
router.get('/quizzes/new', quizController.new);
router.post('/quizzes', quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit', quizController.edit);
router.put('/quizzes/:quizId(\\d+)', quizController.update);
router.delete('/quizzes/:quizId(\\d+)', quizController.destroy);

//Rutas para jugar con los quizzes
router.get('/quizzes/:quizId(\\d+)/play', quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);

//Rutas para jugar de forma aleatoria con los quizzes
router.get('/quizzes/randomplay', quizController.randomPlay);
router.get('/quizzes/randomcheck/:quizId(\\d+)', quizController.randomCheck);

//Rutas para el CRUD de los users - HTML solo GET y POST  --> Method Override para gestionar PUT y DELETE
router.get('/users', userController.index);
router.get('/users/:userId(\\d+)', userController.show);
router.get('/users/new', userController.new);
router.post('/users', userController.create);
router.get('/users/:userId(\\d+)/edit', userController.edit);
router.put('/users/:userId(\\d+)', userController.update);
//router.delete('/users/:userId(\\d+)', userController.destroy);

module.exports = router;
