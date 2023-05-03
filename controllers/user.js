const { models } = require("../models");
const paginate = require("../helpers/paginate").paginate;

//Autoload el user asociado a :userId
exports.load = async (req, res, next, userId) => {
  try {
    const user = await models.User.findByPk(userId);
    if (user) {
      req.load = { ...req.load, user }; //Spread (clonacion)
      next();
    } 
    else {
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
        offset : items_per_page * (pageno - 1),
        limit : items_per_page,
        order: ['username']
      };
  
      //Llamamos a la base de datos con las opciones establecidas
      const users = await models.User.findAll(findOptions);
      res.render("users/index", { users });
      
    } catch (error) {
      next(error);
    }
  };
