const { models } = require("../models");

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
