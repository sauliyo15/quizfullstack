const path = require('path');
const Sequelize = require('sequelize');

//Direccion (o fichero) de la base de datos
const url = process.env.DATABASE_URL || "sqlite:quiz.sqlite";

const sequelize = new Sequelize(url);

//Importar el modelo Quiz
sequelize.import(path.join(__dirname, 'quiz'));

module.exports = sequelize;

