const Task = require('../models/task'); 
const ToolCategory = require('../models/tool');

class TaskController{
    static async createTask(req, res){
        try {
            const { title, description, local, tools = [] } = req.body;
            const task = await Task.create({
                title: title,
                local: local,
                description: description,
                status: 'A FAZER'
            });

            const toolCategories = await ToolCategory.findAll({
                where: { name: tools } 
            });
            await task.addToolCategories(toolCategories);

            res.status(201).json(task);
        } catch (error) {
            console.error('Erro ao salvar entidade:', error);
            res.status(500).json({ message: 'Erro ao salvar entidade'});
        }
    }
}
module.exports = TaskController;
