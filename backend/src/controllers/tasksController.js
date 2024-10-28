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

  static async create(req, res) {
    try {
      // Cria uma nova tarefa no banco de dados
      const task = await Task.create(req.body);

      // Retorna a tarefa criada no formato JSON
      res.status(201).json(task);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      res.status(500).json({ error: 'Erro ao criar tarefa.' });
    }
  }
}

module.exports = TaskController;