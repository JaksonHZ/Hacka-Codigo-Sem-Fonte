const Task = require('../models/task');

class TaskController {
  // Método para buscar e retornar todas as tarefas no formato JSON
  static async getAll(req, res) {
    try {
      // Busca todas as tarefas no banco de dados
      const tasks = await Task.findAll();

      // Retorna as tarefas no formato JSON
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      res.status(500).json({ error: 'Erro ao buscar tarefas.' });
    }
  }
}

module.exports = TaskController;