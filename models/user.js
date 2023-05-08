const { Model } = require("sequelize");

//Importamos el modulo para el cifrado de la contraseña
const crypt = require("../helpers/crypt");

module.exports = function (sequelize, DataTypes) {
  
  //Tipos de cuenta: locales o con autorizacion delegada de otros portales  
  let accountTypes = ["local", "github", "twitter", "google", "facebook", "linkedin"];

  //Definicion de la tabla User del modelo
  class User extends Model {
    

    static accountTypeId(name) {
      return accountTypes.indexOf(name);
    }

    get displayName() {
      if (!this.accountTypeId) {
        return `${this.username} (${accountTypes[0]})`;
      } 
      else {
        return `${this.profileName} (${accountTypes[this.accountTypeId]})`;
      }
    }

    verifyPassword(password) {
      return crypt.encryptPassword(password, this.salt) === this.password;
  }
  }

  //Modelo para la tabla de usuers: Users
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: { msg: "Username must not be empty." } },
      },
      password: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Password must not be empty." } },
        set(password) {
          // Random String used as salt.
          this.salt = Math.round(new Date().valueOf() * Math.random()) + "";
          this.setDataValue("password", crypt.encryptPassword(password, this.salt));
        },
      },
      salt: {
        type: DataTypes.STRING,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      accountTypeId: {
        type: DataTypes.INTEGER,
        unique: "profileUniqueValue",
        default: 0,
        validate: {
          min: {
            args: [0],
            msg: "ProfileId must be positive.",
          },
        },
      },
      profileId: {
        type: DataTypes.INTEGER,
        unique: "profileUniqueValue",
        validate: { notEmpty: { msg: "accountTypeId must not be empty." } },
      },
      profileName: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "ProfileName must not be empty." } },
      },
    },
    {
      sequelize,
    }
  );

  return User;
};
