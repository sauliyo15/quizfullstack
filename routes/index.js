var express = require('express');
var router = express.Router();

const quizController = require('../controllers/quiz');
const userController = require('../controllers/user');
const sessionController = require('../controllers/session');
const groupController = require('../controllers/group');

//MWs para manejar la gestión de Login y logout

router.all('*', sessionController.checkLoginExpires);
router.get('/login', sessionController.new);
router.post('/login', sessionController.create, sessionController.createLoginExpires);//MWs en serie para crear la sesion en dos pasos
router.delete('/login', sessionController.destroy);

//Condicionales para crear los MWs de login de cada uno de los portales (si sus variables de entorno estan definidas)

// Authenticate with OAuth 2.0 at Github
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/auth/github',sessionController.authGitHub);
  router.get('/auth/github/callback', sessionController.authGitHubCB, sessionController.createLoginExpires);
}


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
router.get(['/', '/author', '/quizzes', '/users', '/users/:id(\\d+)/quizzes', '/groups'], saveBack);


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

//Autoload para las rutas que usen un parametro :groupId, se benefician de este metodo los controladores cuya ruta contenga el groupId
router.param('groupId', groupController.load);


//Rutas para el CRUD de los quizzes 
//HTML solo GET y POST  --> Method Override para gestionar PUT y DELETE
//Aplicamos los permisos con MWs en serie (verificacion de login, etc Ver tabla de permisos)
router.get('/quizzes', quizController.index);

router.get('/quizzes/:quizId(\\d+)',
  sessionController.loginRequired,
  quizController.adminOrAuthorRequired, 
  quizController.show);

router.get('/quizzes/new',
  sessionController.loginRequired,
   quizController.new);

router.post('/quizzes',
  sessionController.loginRequired,
  quizController.create);

router.get('/quizzes/:quizId(\\d+)/edit',
  sessionController.loginRequired,
  quizController.adminOrAuthorRequired,  
  quizController.edit);

router.put('/quizzes/:quizId(\\d+)', 
  sessionController.loginRequired,
  quizController.adminOrAuthorRequired,  
  quizController.update);

router.delete('/quizzes/:quizId(\\d+)', 
  sessionController.loginRequired,
  quizController.adminOrAuthorRequired, 
  quizController.destroy);

//Rutas para jugar con los quizzes
router.get('/quizzes/:quizId(\\d+)/play', quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);

//Rutas para jugar de forma aleatoria con los quizzes
router.get('/quizzes/randomplay', quizController.randomPlay);
router.get('/quizzes/randomcheck/:quizId(\\d+)', quizController.randomCheck);


//Rutas para el CRUD de los users 
//HTML solo GET y POST  --> Method Override para gestionar PUT y DELETE
//Aplicamos los permisos con MWs en serie (verificacion de login, usuario adminstrador, etc Ver tabla de permisos)
router.get('/users', 
  sessionController.loginRequired, 
  userController.index);

router.get('/users/:userId(\\d+)', 
  sessionController.loginRequired, 
  userController.show);

//Incorporacion del registro libre de usuarios o no. Sino existe la variable, registro abierto  
if (!process.env.QUIZ_OPEN_REGISTER) {
  router.get('/users/new', userController.new);
  router.post('/users', userController.create);
} 
//Si existe...restringimos el registro de usuarios a un usuario logueado y que sea administrador
else {
  router.get('/users/new', 
    sessionController.loginRequired,
    sessionController.adminRequired,
    userController.new);
  router.post('/users',
    sessionController.loginRequired,
    sessionController.adminRequired,
    userController.create);
} 

router.get('/users/:userId(\\d+)/edit', 
  sessionController.loginRequired, 
  userController.isLocalRequired,
  sessionController.adminOrMyselfRequired, 
  userController.edit);

router.put('/users/:userId(\\d+)', 
  sessionController.loginRequired,
  userController.isLocalRequired,
  sessionController.adminOrMyselfRequired, 
  userController.update);

router.delete('/users/:userId(\\d+)', 
  sessionController.loginRequired, 
  sessionController.adminOrMyselfRequired, 
  userController.destroy);
  
router.get('/users/:userId(\\d+)/quizzes', 
  sessionController.loginRequired, 
  quizController.index);

//Rutas para el CRUD de los grupos 
//HTML solo GET y POST  --> Method Override para gestionar PUT y DELETE
//Aplicamos los permisos con MWs en serie (verificacion de login, usuario adminstrador, etc Ver tabla de permisos)
router.get('/groups', groupController.index);

router.get('/groups/new',
  sessionController.loginRequired,
  sessionController.adminRequired,
  groupController.new);

router.post('/groups',
  sessionController.loginRequired,
  sessionController.adminRequired,
  groupController.create);

router.get('/groups/:groupId(\\d+)/edit', 
  sessionController.loginRequired,
  sessionController.adminRequired,
  groupController.edit);

router.put('/groups/:groupId(\\d+)', 
  sessionController.loginRequired,
  sessionController.adminRequired,
  groupController.update);

router.delete('/groups/:groupId(\\d+)', 
  sessionController.loginRequired,
  sessionController.adminRequired,
  groupController.destroy);

//Rutas para jugar de forma aleatoria con los grupos
router.get('/groups/:groupId(\\d+)/randomplay',  groupController.randomPlay);
router.get('/groups/:groupId(\\d+)/randomcheck/:quizId(\\d+)', groupController.randomCheck);

module.exports = router;
