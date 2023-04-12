'use strict';

//Este fichero se crea tras ejecutar el comando npx sequelize seed:create --name FillQuizzesTable

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run seed o npm run seed_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Quizzes', [
      {
        question: 'Capital of Spain',
        answer: 'Madrid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Capital of France',
        answer: 'Paris',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Capital of Italy',
        answer: 'Rome',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Capital of Russia',
        answer: 'Moscow',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Quizzes', null, {});
  }
};
