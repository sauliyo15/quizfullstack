const { Model } = require("sequelize");

//Definicion de la tabla Group del modelo
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {}

  //Modelo para la tabla de groups: Groups
  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Group name must not be empty" } },
        unique: true,
      }
    },
    { sequelize }
  );
  return Group;
};