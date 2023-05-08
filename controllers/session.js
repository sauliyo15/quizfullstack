const {models} = require("../models");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; //Necesario para manejar los usuarios locales

//5 minutos en milisegundos
const maxIdleTime = 5*60*1000;

//Chequear el tiempo de inactividad, si excede la sesion se destruye sino se actualiza el tiempo de sesion
exports.checkLoginExpires = (req, res, next) => {

    //Si existe una sesion de usuario iniciada...
    if (req.session.loginExpires) { 

        //Si ha expirado la sesion
        if (req.session.loginExpires < Date.now()) {

            //Se borra la propiedad
            delete req.session.loginExpires;

            req.logout(); // Passport logout

            //Se borra la propiedad
            delete res.locals.loginUser;

            //Se programa un mensaje flash
            req.flash('info', 'User session has expired.');
        } 
        //La sesion todavia no ha expirado, se reprograma el tiempo de expiracion
        else { 
            req.session.loginExpires = Date.now() + maxIdleTime;
        }
    }
    //Se continua con la peticion
    next();
};

// GET /login --Login form
exports.new = async (req, res, next) => {
    //Se renderiza a la nueva vista con el formulario de login
    res.render('session/new.ejs');
}

// POST /login
exports.create = passport.authenticate(
    'local',
    {
        failureRedirect:'/login', //Redireccion en caso de fallo
        successFlash: 'Welcome!', //Mensaje de exito, login correcto
        failureFlash: 'Authentication has failed. Retry it again.' //Mensaje de fallo, login incorrecto
    }
);

// POST /login
exports.createLoginExpires = async (req, res, next) => {
    //Guarda el instante de tiempo en el que expira la sesion momento actual + 5 minutos
    req.session.loginExpires = Date.now() + maxIdleTime;

    //Redirecciona a la ruta que contenga goback
    res.redirect("/goback");
}

// DELETE /login
exports.destroy = async (req, res, next) => {
    //Borramos la propiedad
    delete req.session.loginExpires;

    //Llamamos al metodo
    //req.logout(); //OJO desde la version 0.6 de passport se necesita un callback
    req.logout(function(err) {
        if (err) { return next(err); }
      });

    //Redirecciona a la ruta que contenga goback
    res.redirect("/goback"); 
}


//serializeUser(..) guarda en la sesión el id del usuario logueado para recuperarlo en la próxima petición HTTP.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//deserializeUser(..) recupera el registro del usuario logueado a partir del id de la sesión.
passport.deserializeUser(async (id, done) => {

    try {
        const user = await models.User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

/**La configuración de la estrategia de autenticación se
instala en passport con este MW, que recibe las credenciales
del usuario (username, password) y el callback done(..)
que indica a passport el usuario autenticado.La estrategia
consiste en:
1. Obtener el registro del usuario indicado
2. Verificar si el password coincide con el guardado.
3. Notificar a passport el resultado de la autenticación */
passport.use(new LocalStrategy(
    async (username, password, done) => {

        try {
            const user = await models.User.findOne({where: {username}});
            //Verificacion del login
            if (user && user.verifyPassword(password)) {
                done(null, user);
            }
            //Login incorrecto
            else {
                done(null, false);
            }
        } catch (error) {
            done(error);
        }
    }
));