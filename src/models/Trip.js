const { DataTypes } = require('sequelize');
const sequelize = require('../config/dataBase');

const Trip = sequelize.define('trip', {
    id: {  // Alterado para minúsculo para corresponder ao banco
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    userId: {  // Note que aqui está userId (camelCase)
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    createdAt: {  // Adicionado para ser explícito
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {  // Adicionado para ser explícito
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: 'trips',  // Note minúsculo para corresponder ao banco
    timestamps: true,
});


module.exports = Trip;