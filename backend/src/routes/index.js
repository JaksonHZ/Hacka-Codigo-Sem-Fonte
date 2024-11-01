
const express = require('express');
const router = express.Router();

const TranscriptionController = require('../controllers/transcriptionController');
const upload = require('../config/multer');

const firebaseAuthController = require('../controllers/firebase-auth-controller');
const verifyToken = require('../middleware/verifyToken');
const TaskController = require('../controllers/tasksController');

const GeneratePDFController = require('../controllers/generate-pdf');

// Rotas públicas
router.post('/api/register', firebaseAuthController.registerUser);
router.post('/api/login', firebaseAuthController.loginUser);
router.post('/api/logout', firebaseAuthController.logoutUser);
router.post('/api/reset-password', firebaseAuthController.resetPassword);

// Rotas protegidas
router.get('/api/user', verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.get('/api/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Acesso concedido à rota protegida', user: req.user });
});

// Rotas para transcrição que também são protegidas
router.post('/api/transcriptions', verifyToken, upload.single('file'), TranscriptionController.createTranscription);
router.get('/api/transcriptions', verifyToken, TranscriptionController.getTranscriptions);
router.get('/api/transcriptions/:id/download', verifyToken, TranscriptionController.downloadTranscription);
router.get('/transcriptions/daily-limit', verifyToken, TranscriptionController.getDailyLimit);
router.get('/generate-pdf', GeneratePDFController.generatePDF);
router.post('/tasks', TaskController.createTask);



// Rotas para Tasks
router.get('/api/tasks', verifyToken, TaskController.getAll)
router.post('/api/tasks', verifyToken, TaskController.create)

module.exports = router;
