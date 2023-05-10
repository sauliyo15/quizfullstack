//Importacion de modulos standard que se han instalado (npm install) procedentes del package.json

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var favicon = require('serve-favicon'); //Necesario para servir el icono mediante el MW (npm install serve-favicon)
var partials = require('express-partials') //Necesario para introducir el MWs con el marco comun para todas las vistas deseadas (npm install express-partials)
var methodOverride = require('method-override'); //Necesario para poder manejar en HTML transacciones PUT y DELETE
var session = require('express-session'); //Necesario para almacenar sesiones e intercambiar datos entre transacciones http
var flash = require('express-flash'); //Necesario para mostrar mensajes flash almacenados en las sesiones
var SequelizeStore = require('connect-session-sequelize')(session.Store); //Necesario para configurar el almacenamiento de las sesiones en la base de datos
var sequelize = require('./models'); //Necesario para configurar el almacenamiento de las sesiones en la base de datos
var passport = require('passport'); //Necesario para gestionar el login de los usuarios
require('dotenv').config(); //Necesario para gestionar las variables de entorno
var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS; //Necesario para la redireccion a HTTPS


//Importacion de modulos con los ruters (atencion de rutas)

var indexRouter = require('./routes/index');


//Creacion de la aplicacion express

var app = express();


// view engine setup -- define views como directorio que contiene las vistas
app.set('views', path.join(__dirname, 'views'));

//Instalacion de un renderizador de vistas
app.set('view engine', 'ejs');

//Instalacion del MW para el marco de todas las vistas ejs
app.use(partials());


//Instalacion del MW para servir el icono
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/*Truco: actualizar favicon para que se muestre en Google Chrome:
  1.En el navegador escribir la ruta completa donde se encuentra el icono....localhost:3000/favicon.ico
  2.Recargar la pagina con F5 o actualizar
  3.Cerrar completamente el navegador y abrir de nuevo la pagina del proyecto*/


//Instalamos el MWs para manejar las transacciones PUT y DELETE  
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));


//Instalacion de MWs genericos

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Definimos como sera el almacen de las sesiones
var sessionStore = new SequelizeStore({
  db: sequelize, //Base de datos a utilizar la que utilizar sequelize al importar models
  table: "Session", //Tabla a utilizar
  checkExpirationInterval: 15 * 60 * 1000, //Chequear cada 15 minutos (en milisegundos)
  expiration: 4 * 60 * 60 * 1000 //La sesion expira cada 4 horas (en milisegundos)
});

//Instalacion de MW para manejar las sesiones y los mensajes flash. Indicamos que se va a almacenar con sessionStore
app.use(session({secret: "Quiz 2020", store: sessionStore, resave: false, saveUninitialized: true})); //secret: semilla de cifrado de la cookie, resave, saveUnitialized: fuerzan guardar siempre sesiones aunque no esten inicializadas
app.use(flash());


//Instalacion de MW para manejar los login de los usuarios

//Inicializa Passport y define loginUser como la propiedad de req que contiene al usuario autenticado si existe.
app.use(passport.initialize({userProperty: 'loginUser'}));

//Conecta la session de login con la de cliente.
app.use(passport.session());

//req.loginUser se copia a res.locals.loginUser para hacerlo visible en todas vistas (para layout.ejs).
app.use(function(req, res, next) {
  res.locals.loginUser = req.loginUser && {
    id: req.loginUser.id,
    displayName: req.loginUser.displayName,
    isAdmin: req.loginUser.isAdmin
  };
  next();
});


//MW que excluye redirigir cuando el servidor esta instalado en localhost en cualquier puerto
app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));


//Instalacion de MWs de rutas

app.use('/', indexRouter);


// catch 404 and forward to error handler - Instalacion de MWs de Error
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
