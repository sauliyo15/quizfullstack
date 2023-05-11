const path = require('path');
const Sequelize = require('sequelize');

//Direccion (o fichero) de la base de datos
const url = process.env.DATABASE_URL || "sqlite:db.sqlite";

const sequelize = new Sequelize(url);

//Importar el modelo Quiz y Session - OJO! IMPORTANTE este metodo no funciona a partir de la version 6 de sequelize/sequelize-cli

//Quiz model
const Quiz = sequelize.import(path.join(__dirname, 'quiz'));

//Session model
sequelize.import(path.join(__dirname, 'session'));

//User model
const User = sequelize.import(path.join(__dirname,'user'));


// Relation 1-to-N between User and Quiz:
User.hasMany(Quiz, {as: 'quizzes', foreignKey: 'authorId'});
Quiz.belongsTo(User, {as: 'author', foreignKey: 'authorId'});

module.exports = sequelize;