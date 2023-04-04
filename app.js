//Importacion de modulos standard que se han instalado (npm install) procedentes del package.json

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


//Importacion de modulos con los ruters (atencion de rutas)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


//Creacion de la aplicacion express

var app = express();


// view engine setup -- define views como directorio que contiene las vistas
app.set('views', path.join(__dirname, 'views'));

//Instalacion de un renderizador de vistas
app.set('view engine', 'ejs');


//Instalacion de MWs genericos

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Instalacion de MWs de rutas

app.use('/', indexRouter);
app.use('/users', usersRouter);


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
