//Autoload el quiz asociado a :quizId
exports.load = async (req, res, next, quizId) => {
    try {
      const quiz = await models.Quiz.findByPk(quizId);
      if (quiz) {
        req.load = {...req.load, quiz}; //... spread
        next();
      }
      else {
        throw new Error('There is no quiz with id= ' + quizId);
      }
    }
    catch (error) {
      next(error);
    }
  };
  