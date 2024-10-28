const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ToolCategory = sequelize.define('ToolCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Nome da categoria é obrigatório
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // Descrição da categoria
  },
}, {
  tableName: 'tool_categories',
  timestamps: false,
});

module.exports = ToolCategory;
