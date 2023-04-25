const { Model } = require("sequelize");

//Definicion de la tabla Session del modelo
module.exports = (sequelize, DataTypes) => {
    class Session extends Model {}
  
    //Modelo para la tabla de quizzes: Quizzes
    Session.init(
      {
        sid: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        expires: {type: DataTypes.DATE},
        data: {type: DataTypes.STRING(50000)}
      },
      { sequelize }
    );
    return Session;
  };