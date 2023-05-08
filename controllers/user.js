const { models } = require("../models");
const paginate = require("../helpers/paginate").paginate;
const Sequelize = require("sequelize");

//Autoload el user asociado a :userId
exports.load = async (req, res, next, userId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (user) {
      req.load = { ...req.load, user }; //Spread (clonacion)
      next();
    } else {
      req.flash("error", "There is no user with id=" + userId + ".");
      throw new Error("No exist userId=" + userId);
    }
  } catch (error) {
    next(error);
  }
};

//GET /users/:userId
exports.show = (req, res, next) => {
  //Obtenemos el objeto cargado en el metodo load que estara guardado en la request de la peticion
  const { user } = req.load;

  //Llamamos al metod render con el objeto
  res.render("users/show", { user });
};

//GET /users
exports.index = async (req, res, next) => {
  try {
    //Obtenemos el numero de items que tiene la tabla de la base de datos
    const count = await models.User.count();

    //Establecemos el numero de items que tendra cada pagina html
    const items_per_page = 5;

    //Extraemos el numero de pagina que llega en el query en el parametro pageno, (si es la primera vez que se entra al modulo sera la pagina 1)
    const pageno = parseInt(req.query.pageno) || 1;

    //Se genera el codigo html guardandolo en la variable paginate_control que se utilizara desde la vista layout.ejs
    res.locals.paginate_control_users = paginate(
      count,
      items_per_page,
      pageno,
      req.url
    );

    //Definimos las opciones para cargar los elementos deseados de la base de datos dependiento del numero de pagina al que navegamos y el numero de items
    const findOptions = {
      offset: items_per_page * (pageno - 1),
      limit: items_per_page,
      order: ["username"],
    };

    //Llamamos a la base de datos con las opciones establecidas
    const users = await models.User.findAll(findOptions);
    res.render("users/index", { users });
  } catch (error) {
    next(error);
  }
};

//GET /users/new
exports.new = (req, res, next) => {
  //Opcional ya que los cajetines del formulario de la vista se pueden configurar tambien con el contenido vacio
  const user = { username: "", password: "" };

  //Renderizacion a la vista new
  res.render("users/new", { user });
};

//POST /users/
exports.create = async (req, res, next) => {
  //Obtenemos los parametros del body de la peticion
  const { username, password } = req.body;

  //Construimos una instancia no persitente con el modelo User
  let user = models.User.build({ username, password });

  //Comprobacion de contraseña vacia
  if (!password) {
    //Configuramos un mensaje flash
    req.flash("error", "Password must not be empty.");

    //Renderizamos a la vista con los datos del usuario que todavia no ha sido creado
    return res.render("users/new", { user });
  }

  try {
    //Ejecutamos la sentencia en la base de datos (solo guardamos los dos campos)
    user = await user.save({ fields: ["username", "password", "salt"] });

    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
    req.flash("success", "User created successfully");

    //Redireccionamos a la vista para ver el usuario recien creado
    res.redirect("/users/" + user.id);
  } catch (error) {
    //Captura de errores
    if (error instanceof Sequelize.UniqueConstraintError) {
      req.flash("error", `User "${username}" already exists.`);
      res.render("users/new", { user });
    } 
    else {
      if (error instanceof Sequelize.ValidationError) {
        req.flash("error", "There are errors in the form:");
        error.errors.forEach(({ message }) => req.flash("error", message));
        res.render("users/new", { user });
      } 
      else {
        next(error);
      }
    }
  }
};

//GET /users/:userId/edit
exports.edit = (req, res, next) => {
  //Cargamos el user ya que esta primitiva contiene el userId y se habra cargado con el metodo load
  const { user } = req.load;

  //Renderizamos la vista con el usuario
  res.render("users/edit.ejs", { user });
};

//PUT /users/:userId
exports.update = async (req, res, next) => {
  //Obtenemos los el body de la peticion
  const { body } = req;

  //Obtenemos el user (del modelo) precargado con el metodo load
  const { user } = req.load;

  //Variable para almacenar los campos que hay que actualizar
  let fields_to_update = [];

  //Si la contraseña ha cambiado
  if (body.password) {
    console.log('Updating password');
    //Guardamos en la instancia del modelo la nueva contraseña
    user.password = body.password;

    //E indicamos que campos de la bbdd hay que actualizar
    fields_to_update.push('salt');
    fields_to_update.push('password');
  }

  try {
    //Ejecutamos la sentencia en la base de datos
    await user.save({ fields: fields_to_update });

    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
    req.flash('success', 'User update successfully');

    //Redireccionamos a la vista para ver el usuario modificado
    res.redirect('/users/' + user.id);
  } catch (error) {
    //Captura de errores
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'There are errors in the form: ');
      error.errors.forEach(({ message }) => req.flash('error', message));
      res.render('users/edit', { user });
    } else {
      next(error);
    }
  }
};
