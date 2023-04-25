const path = require('path');
const Sequelize = require('sequelize');

//Direccion (o fichero) de la base de datos
const url = process.env.DATABASE_URL || "sqlite:db.sqlite";

const sequelize = new Sequelize(url);

//Importar el modelo Quiz y Session - OJO! IMPORTANTE este metodo no funciona a partir de la version 6 de sequelize/sequelize-cli
sequelize.import(path.join(__dirname, 'quiz'));
sequelize.import(path.join(__dirname, 'session'));


module.exports = sequelize;