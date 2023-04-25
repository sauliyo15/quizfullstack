const { models } = require("../models");
const paginate = require("../helpers/paginate").paginate;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//Autoload el quiz asociado a :quizId
exports.load = async (req, res, next, quizId) => {
  try {
    const quiz = await models.Quiz.findByPk(quizId);
    if (quiz) {
      req.load = { ...req.load, quiz }; //Spread (clonacion)
      next();
    } else {
      throw new Error("There is no quiez with id=" + quizId);
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
  
  //Definir opciones de busqueda si llegan en la query en el parametro search
  let countOptions = {};
  let findOptions = {};

  // Search:
  const search = req.query.search || "";
  if (search) {
    const search_like = "%" + search.replace(/ +/g, "%") + "%";

    countOptions.where = { question: { [Op.like]: search_like } };
    findOptions.where = { question: { [Op.like]: search_like } };
  }

  try {
    //Obtenemos el numero de items que tiene la tabla de la base de datos
    const count = await models.Quiz.count(countOptions);

    //Establecemos el numero de items que tendra cada pagina html
    const items_per_page = 5;

    //Extraemos el numero de pagina que llega en el query en el parametro pageno, (si es la primera vez que se entra al modulo sera la pagina 1)
    const pageno = parseInt(req.query.pageno) || 1;

    //Se genera el codigo html guardandolo en la variable paginate_control que se utilizara desde la vista layout.ejs
    res.locals.paginate_control = paginate(
      count,
      items_per_page,
      pageno,
      req.url
    );

    //Definimos las opciones para cargar los elementos deseados de la base de datos dependiento del numero de pagina al que navegamos y el numero de items
    findOptions.offset = items_per_page * (pageno - 1);
    findOptions.limit = items_per_page;

    //Llamamos a la base de datos con las opciones establecidas
    const quizzes = await models.Quiz.findAll(findOptions);
    res.render("quizzes/index.ejs", { quizzes, search });
    
  } catch (error) {
    next(error);
  }
};

//GET /quizzes/:quizId/play
exports.play = (req, res, next) => {
  //Obtenemos la información del query
  const { query } = req;

  //Si hay algun contenido obtenemos el parametro oculto answer que genera el boton Try Again
  const answer = query.answer || "";

  //Cargamos el quiz ya que esta primitiva contiene el quizId y se habra cargado con el metodo load
  const { quiz } = req.load;

  //Renderizamos la vista con el quiz y con answer
  res.render("quizzes/play.ejs", { quiz, answer });
};

//GET /quizzes/:quizId/check
exports.check = (req, res, next) => {
  //Obtenemos la información del query
  const { query } = req;

  //Si hay algun contenido obtenemos el parametro oculto answer que genera el boton Try Again
  const answer = query.answer || "";

  //Cargamos el quiz ya que esta primitiva contiene el quizId y se habra cargado con el metodo load
  const { quiz } = req.load;

  //Se comprueba si la respuesta es correcta
  const result =
    answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

  //Renderizamos la vista con el quiz, con answer y con el resultado
  res.render("quizzes/result.ejs", { quiz, result, answer });
};

//GET /quizzes/new
exports.new = (req, res, next) => {
  //Opcional ya que los cajetines del formulario de la vista se pueden configurar tambien con el contenido vacio
  const quiz = { question: "", answer: "" };

  //Renderizacion a la vista new
  res.render("quizzes/new", { quiz });
};

//POST /quizzes/
exports.create = async (req, res, next) => {
  //Obtenemos los parametros del body de la peticion
  const { question, answer } = req.body;

  //Construimos una instancia no persitente con el modelo Quiz
  let quiz = models.Quiz.build({ question, answer });

  try {
    //Ejecutamos la sentencia en la base de datos (solo guardamos los dos campos)
    quiz = await quiz.save({ fields: ["question", "answer"] });

    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
    req.flash('success', 'Quiz created successfully');

    //Redireccionamos a la vista para crear el quiz recien creado
    res.redirect("/quizzes/" + quiz.id);
  } catch (error) {
    //Captura de errores
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'There are errors in the form: ');
      error.errors.forEach(({ message }) => req.flash('error', message));
      res.render("quizzes/new", { quiz });
    } else {
      req.flash('error', 'Error creating a new Quiz: ' +error.message);
      next(error);
    }
  }
};

//GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {
  //Cargamos el quiz ya que esta primitiva contiene el quizId y se habra cargado con el metodo load
  const { quiz } = req.load;

  //Renderizamos la vista con el quiz
  res.render("quizzes/edit.ejs", { quiz });
};

//PUT /quizzes/:quizId
exports.update = async (req, res, next) => {
  //Obtenemos los el body de la peticion
  const { body } = req;

  //Obtenemos el quiz (del modelo) precargado con el metodo load
  const { quiz } = req.load;

  //Actualizamos lo valores de la instancia del modelo quiz con los valores obtenidos del body
  quiz.question = body.question;
  quiz.answer = body.answer;

  try {
    //Ejecutamos la sentencia en la base de datos (solo guardamos los dos campos)
    await quiz.save({ fields: ["question", "answer"] });

    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
    req.flash('success', 'Quiz edited successfully');

    //Redireccionamos a la vista para crear el quiz recien creado
    res.redirect("/quizzes/" + quiz.id);
  } catch (error) {
    //Captura de errores
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'There are errors in the form: ');
      error.errors.forEach(({ message }) => req.flash('error', message));
      res.render("quizzes/edit", { quiz });
    } else {
      req.flash('error', 'Error editing the Quiz: ' +error.message);
      next(error);
    }
  }
};

//DELETE /quizzes/:quizId
exports.destroy = async (req, res, next) => {
  try {
    //Obtenemos la instancia del quiz cargado con el load y llamamos a su metodo destroy para eliminarlo de la BBDD
    await req.load.quiz.destroy();

    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
    req.flash('success', 'Quiz deleted successfully');

    //Redireccionamos a la pantalla anterior
    res.redirect("/goback");
  } catch (error) {
    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado fracasado de la operacion
    req.flash('error', 'Error deleting the Quiz:' + error.message);
    next(error);
  }
};
