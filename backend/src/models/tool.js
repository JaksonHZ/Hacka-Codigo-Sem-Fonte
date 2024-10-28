const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const ToolCategory = require('./toolCategory');

const Tool = sequelize.define('Tool', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Nome da ferramenta é obrigatório
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: ToolCategory,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'tools',
  timestamps: false,
});

ToolCategory.hasMany(Tool, { foreignKey: 'categoryId' });
Tool.belongsTo(ToolCategory, { foreignKey: 'categoryId' });

module.exports = Tool;
