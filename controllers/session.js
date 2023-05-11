const {models} = require("../models");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; //Necesario para manejar los usuarios locales

//Definicion de las credenciales de entorno a partir de las variables de entorno que haya definidas
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

//Definicion de la direccion de la aplicacion
const CALLBACK_BASE_URL = process.env.CALLBACK_BASE_URL || "http://localhost:3000";

//Definicion de las estrategias especificas de cada uno de los portales
const GitHubStrategy = GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && require('passport-github2').Strategy;

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
    //Se renderiza a la nueva vista con el formulario de login, indicando tambien si hay autenticacion con alguno de los portales externos
    res.render('session/new.ejs', {
        loginWithGitHub: !!GitHubStrategy,
    });
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


// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
GitHubStrategy && passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `${CALLBACK_BASE_URL}/auth/github/callback`
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // The returned GitHub profile represent the logged-in user.
        // I must associate the GitHub account with a user record in the database,
        // and return that user.
        const [user, created] = await models.User.findOrCreate({
            where: {
                accountTypeId: models.User.accountTypeId("github"),
                profileId: profile.id
            },
            defaults: {
                profileName: profile.username
            }
        });
        done(null, user);
    } catch(error) {
        done(error, null);
    }
}));


// GET /auth/github
exports.authGitHub = GitHubStrategy && passport.authenticate('github', {scope: ['user']});

// GET /auth/github/callback
exports.authGitHubCB = GitHubStrategy && passport.authenticate(
    'github',
    {
        failureRedirect: '/auth/github',
        successFlash: 'Welcome!',
        failureFlash: 'Authentication has failed. Retry it again.'
    }
);


//MW que verifica que un usuario esta logueado en la pagina
exports.loginRequired = (req, res, next) => {
    //Si esta logueado se podra continuar con el siguiente MW
    if (req.loginUser) {
        next();
    }
    //Sino, se configura un mensaje flash y se redirecciona a la pagina de login
    else {
        req.flash("info", "Login required: log in and retry.");
        res.redirect('/login');
    } 
}


//MW que verifica que el usuario logueado es administrador ó que el usuario logueado es el mismo sobre el cual se lanza la operacion
exports.adminOrMyselfRequired = (req, res, next) => {
    const isAdmin = !!req.loginUser.isAdmin;
    const isMyself = req.load.user.id === req.loginUser.id;
    
    //Si es el administrador o uno mismo se puede continuar
    if (isAdmin || isMyself) {
        next();
    }
    //Sino, en este caso la accion esta prohibida
    else {
        console.log('Prohibited route: it is not the logged user');
        res.send(403);
    } 
}


//MW que verifica que el usuario logueado es administrador
exports.adminRequired = (req, res, next) => {
    const isAdmin = !!req.loginUser.isAdmin;
    
    //Si es el administrador
    if (isAdmin) {
        next();
    }
    //Sino, en este caso la accion esta prohibida
    else {
        console.log('Prohibited route: it is not the logged user');
        res.send(403);
    } 
}