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
  const {quiz} = req.load;

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
};


//GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

  //Obtenemos la información del query
  const {query} = req;

  //Si hay algun contenido obtenemos el parametro oculto answer que genera el boton Try Again
  const answer = query.answer || '';

  //Cargamos el quiz ya que esta primitiva contiene el quizId y se habra cargado con el metodo load
  const {quiz} = req.load;

  //Renderizamos la vista con el quiz y con answer
  res.render('quizzes/play.ejs', {quiz, answer});
};


//GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

  //Obtenemos la información del query
  const {query} = req;

  //Si hay algun contenido obtenemos el parametro oculto answer que genera el boton Try Again
  const answer = query.answer || '';

  //Cargamos el quiz ya que esta primitiva contiene el quizId y se habra cargado con el metodo load
  const {quiz} = req.load;

  //Se comprueba si la respuesta es correcta
  const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

  //Renderizamos la vista con el quiz, con answer y con el resultado
  res.render('quizzes/result.ejs', {quiz, result, answer});
};


//GET /quizzes/new
exports.new = (req, res, next) => {
  
  //Opcional ya que los cajetines del formulario de la vista se pueden configurar tambien con el contenido vacio
  const quiz = {question: "", answer: ""};

  //Renderizacion a la vista new
  res.render('quizzes/new', {quiz});
};


//POST /quizzes/
exports.create = async (req, res, next) => {

  //Obtenemos los parametros del body de la peticion
  const {question, answer} = req.body;

  //Construimos una instancia no persitente con el modelo Quiz
  let quiz = models.Quiz.build({question, answer});

  try {
    //Ejecutamos la sentencia en la base de datos (solo guardamos los dos campos)
    quiz = await quiz.save({fields: ["question", "answer"]});

    //Redireccionamos a la vista para crear el quiz recien creado
    res.redirect('/quizzes/' + quiz.id);
  
  } catch (error) {
    //Captura de errores
    if (error instanceof Sequelize.ValidationError) {
      console.log('There are errors in the form:');
      error.errors.forEach(({message}) => console.log(message));
      res.render('quizzes/new', {quiz});
    }
    else {
      next(error);
    }
  }
};


//GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

  //Cargamos el quiz ya que esta primitiva contiene el quizId y se habra cargado con el metodo load
  const {quiz} = req.load;

  //Renderizamos la vista con el quiz
  res.render('quizzes/edit.ejs', {quiz});
};


//PUT /quizzes/:quizId
exports.update = async (req, res, next) => {

  //Obtenemos los el body de la peticion
  const {body} = req;

  //Obtenemos el quiz (del modelo) precargado con el metodo load
  const {quiz} = req.load;

  //Actualizamos lo valores de la instancia del modelo quiz con los valores obtenidos del body
  quiz.question = body.question;
  quiz.answer = body.answer;

  try {
    //Ejecutamos la sentencia en la base de datos (solo guardamos los dos campos)
    await quiz.save({fields: ["question", "answer"]});

    //Redireccionamos a la vista para crear el quiz recien creado
    res.redirect('/quizzes/' + quiz.id);
  
  } catch (error) {
    //Captura de errores
    if (error instanceof Sequelize.ValidationError) {
      console.log('There are errors in the form:');
      error.errors.forEach(({message}) => console.log(message));
      res.render('quizzes/edit', {quiz});
    }
    else {
      next(error);
    }
  }




};
