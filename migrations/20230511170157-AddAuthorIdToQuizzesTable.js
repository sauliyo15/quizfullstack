'use strict';

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name AddAuthorIdToQuizzesTable

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

//Simplemente añade una columna a la tabla de Quizzes (que sera el campo id de la tabla Users)
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Quizzes',
            'authorId',
            {
                type: Sequelize.INTEGER,
                references: {
                    model: "Users",
                    key: "id"
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('Quizzes', 'authorId');
    }
};