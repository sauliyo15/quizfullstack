const { Model } = require("sequelize");

//Definicion de la tabla Quiz del modelo
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {}

  //Modelo para la tabla de quizzes: Quizzes
  Quiz.init(
    {
      question: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Question must not be empty" } },
      },
      answer: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Answer must not be empty" } },
      },
    },
    { sequelize }
  );
  return Quiz;
};
