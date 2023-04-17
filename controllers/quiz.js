const { models } = require("../models");

//Autoload el quiz asociado a :quizId
exports.load = async (req, res, next, quizId) => {
  try {
    const quiz = await models.Quiz.findByPk(quizId);
    if (quiz) {
      req.load = {...req.load, quiz}; //Spread (clonacion)
      next();
    }
    else {
      throw new Error('There is no quiez with id=' + quizId);
    }
  } catch (error) {
    next(error);
  }
};


//GET /quizzes/:quizId
exports.show = (req, res, next) => {
  //Obtenemos el objeto cargado en el metodo load que estara guardado en la request de la peticion
  const { quiz } = req.load;

  //Llamamos al metod render con el objeto
  res.render("quizzes/show", { quiz });
};


//GET /quizzes
exports.index = async (req, res, next) => {
  try {
    const quizzes = await models.Quiz.findAll();
    res.render('quizzes/index.ejs', {quizzes});
  } catch (error) {
    next(error);
  }
}
