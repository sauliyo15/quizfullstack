const { models } = require("../models");
const paginate = require("../helpers/paginate").paginate;
const Sequelize = require("sequelize");


//Autoload el group asociado a ::groupId
exports.load = async (req, res, next, groupId) => {
    try {
      const group = await models.Group.findByPk(groupId);
      if (group) {
        req.load = { ...req.load, group }; //Spread (clonacion)
        next();
      } else {
        req.flash('error', 'There is no group with id=' + groupId + '.');
        throw new Error("There is no group with id=" + groupId);
      }
    } catch (error) {
      next(error);
    }
  };


//GET /groups
exports.index = async (req, res, next) => {
    
    try {
      //Llamamos a la base de datos con las opciones establecidas
      const groups = await models.Group.findAll();
      res.render("groups/index.ejs", { groups});
      
    } catch (error) {
      next(error);
    }
  };


//GET /groups/new
exports.new = (req, res, next) => {
    //Opcional ya que los cajetines del formulario de la vista se pueden configurar tambien con el contenido vacio
    const group = { name: ""};
  
    //Renderizacion a la vista new
    res.render("groups/new", { group });
  };


//POST /groups/
exports.create = async (req, res, next) => {
    //Obtenemos los parametros del body de la peticion
    const { name } = req.body;
  
    //Construimos una instancia no persitente con el modelo Group
    let group = models.Group.build({ name });
  
    try {
      //Ejecutamos la sentencia en la base de datos
      group = await group.save();
  
      //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
      req.flash('success', 'Group created successfully');
  
      //Redireccionamos a la vista para crear el quiz recien creado
      res.redirect("/groups/");
    } catch (error) {
      //Captura de errores
      if (error instanceof Sequelize.ValidationError) {
        req.flash('error', 'There are errors in the form: ');
        error.errors.forEach(({ message }) => req.flash('error', message));
        res.render("groups/new", { group });
      } else {
        req.flash('error', 'Error creating a new Group: ' +error.message);
        next(error);
      }
    }
  };
  
  
//GET /groups/:groupId/edit
exports.edit = async (req, res, next) => {
    //Cargamos el group ya que esta primitiva contiene el groupId y se habra cargado con el metodo load
    const { group } = req.load;

    const allQuizzes = await models.Quiz.findAll();
    const groupQuizzesIds = await group.getQuizzes().map(quiz => quiz.id);
  
    //Renderizamos la vista con el grupo
    res.render("groups/edit.ejs", { group, allQuizzes, groupQuizzesIds});
};


//PUT /groups/:groupId
exports.update = async (req, res, next) => {
      
    //Obtenemos el group (del modelo) precargado con el metodo load
    const {group} = req.load;

    //Obtenemos los objetos del body de la peticion (si quizzesIds no se ha enviado no existira, en ese caso se crea vacio)
    const {name, quizzesIds = []} = req.body;
  
    //Quitamos los espacios en blanco del nombre del grupo
    group.name = name.trim();
  
    try {
      //Ejecutamos las sentencia en la base de datos
      await group.save({fields: ["name"]});//Guardamos el group
      await group.setQuizzes(quizzesIds);//Guardamos los quizzes del grupo (Tabla intermedia Relacion N-N)

      //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
      req.flash('success', 'Group edited successfully');
  
      //Redireccionamos a la vista index
      res.redirect("/groups/");
    } catch (error) {
      //Captura de errores
      if (error instanceof Sequelize.ValidationError) {
        req.flash('error', 'There are errors in the form: ');
        error.errors.forEach(({ message }) => req.flash('error', message));

        const allQuizzes = await models.Quiz.findAll();

        res.render("groups/edit", { group, allQuizzes, groupQuizzesIds : quizzesIds });
      } else {
        req.flash('error', 'Error editing the Group: ' +error.message);
        next(error);
      }
    }
  };


  //DELETE /groups/:groupId
exports.destroy = async (req, res, next) => {
    try {
      //Obtenemos la instancia del group cargado con el load y llamamos a su metodo destroy para eliminarlo de la BBDD
      await req.load.group.destroy();
  
      //Configuramos un mensaje flash para mostrarlo en la vista con el resultado exitoso de la operacion
      req.flash('success', 'Group deleted successfully');
  
      //Redireccionamos a la pantalla anterior
      res.redirect("/goback");
    } catch (error) {
      //Configuramos un mensaje flash para mostrarlo en la vista con el resultado fracasado de la operacion
      req.flash('error', 'Error deleting the Group:' + error.message);
      next(error);
    }
  };


//RANDOMPLAY GET /groups/:groupId/randomplay
exports.randomPlay = async (req, res, next) => {

  //Obtenemos el group (del modelo) precargado con el metodo load
  const group = req.load.group;

  try {
    //Obtenemos el parametro de la sesion de grupos (si es la primera vez no existira y sera un objeto vacio, en el que cada propiedad que se creee correspondera a cada grupo accedido)
    req.session.randomGroupPlay = req.session.randomGroupPlay || {};

    //Dentro del parametro de la session obtenemos la propiedad que corresponde al grupo accedido (sino existe, se creara con un array vacio (de resueltos) y el ultimo quiz jugado a 0)
    req.session.randomGroupPlay[group.id] = req.session.randomGroupPlay[group.id] || {lastQuizId: 0, resolved: []};

    //Obtenemos el numero de quizzes que tenemos de ese grupo
    const total = await group.countQuizzes();

    //Con el total y la longitud del array obtenido, sabremos cuantos quizzes hay pendientes de ese grupo
    const quedan = total - req.session.randomGroupPlay[group.id].resolved.length;

    //Score sera la longitud del array de resueltos de ese grupo
    score = req.session.randomGroupPlay[group.id].resolved.length;

    //Si todavía quedan quizzes por resolver...
    if (!quedan == 0) {

      let quiz = null;

      //Comprobamos si existe la propiedad (ultimoquiz) para ese grupo
      if (req.session.randomGroupPlay[group.id].lastQuizId) {
        //Si existe cargamos ese Quiz
        quiz = await models.Quiz.findOne({
          where: {'id': req.session.randomGroupPlay[group.id].lastQuizId}
        });
      }
      //Sino...cargamos un quiz totalmente aleatorio de ese grupo
      else {
        quiz = await models.Quiz.findOne({
          where: {'id': {[Sequelize.Op.notIn]: req.session.randomGroupPlay[group.id].resolved}},
          include: [
            {
              model: models.Group,
              as: "groups",
              where: {id: group.id}
            }
          ],
          offset: Math.floor(Math.random() * quedan) 
        });
      }

      //Asignamos a la propiedad last quiz, el id del quiz cargado del grupo
      req.session.randomGroupPlay[group.id].lastQuizId = quiz.id;
      
      //Renderizamos la vista con el quiz
      res.render("groups/random_play.ejs", {group, quiz, score});
    }
    //Sino quedan Quizzes por resolver...
    else {
      //Se borra la propiedad-grupo del objeto de la sesion
      delete req.session.randomGroupPlay[group.id];

      //Se renderiza la vista correspondiente
      res.render("groups/random_nomore.ejs", {group, score});
    }

  } catch (error) {
    //Configuramos un mensaje flash para mostrarlo en la vista con el resultado fracasado de la operacion
    req.flash('error', 'Accediendo a Randomplay Groups: ' + error.message);
    next(error);
  }
}


//RANDOMCHECK GET /groups/:groupId/randomcheck/:quizId
exports.randomCheck = async (req, res, next) => {

  //Obtenemos el group (del modelo) precargado con el metodo load
  const group = req.load.group;

  //Borramos la propiedad lastquizId de ese grupo, ya que cuando el usuario comprueba un quiz, deja de tener sentido
  delete req.session.randomGroupPlay[group.id].lastQuizId

  //Obtenemos la información del query
  const { query } = req;

  //Si hay algun contenido obtenemos el parametro oculto answer que genera el boton Try Again
  const answer = query.answer || "";

  //Cargamos el quiz ya que esta primitiva contiene el quizId y se habra cargado con el metodo load
  const { quiz } = req.load;

  //Se comprueba si la respuesta es correcta
  const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

  //Obtenemos la puntuacion a partir de la longitud del array de resueltos de ese grupo
  let score = req.session.randomGroupPlay[group.id].resolved.length;

  //Si la respuesta es correcta...
  if (result) {

    //Se añade el id del quiz al array de resueltos de ese grupo
    req.session.randomGroupPlay[group.id].resolved.push(quiz.id);

    //Incrementamos la puntuacion
    score++;
  }
  //Si la respuesta es incorrecta...
  else {
  
    //Se borra la propiedad del objeto que pertenece al grupo, para que a proxima vez que se entre en el se cree de nuevo
    delete req.session.randomGroupPlay[group.id];
  }

  //Renderizamoa a la vista correspondiente con los parametros requeridos
  res.render("groups/random_result.ejs", { group, score, result, answer });
}



