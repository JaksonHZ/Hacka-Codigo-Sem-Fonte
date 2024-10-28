const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const ToolCategory = require('./toolCategory');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  local: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('BACKLOG', 'A FAZER', 'EM PROGRESSO', 'FEITO'),
    allowNull: false,
    defaultValue: 'A FAZER',
  },
}, {
  tableName: 'tasks',
  timestamps: true, // Inclui createdAt e updatedAt
});

// Relacionamento N:M entre Task e ToolCategory
Task.belongsToMany(ToolCategory, { through: 'TaskCategories' });
ToolCategory.belongsToMany(Task, { through: 'TaskCategories' });

module.exports = Task;
