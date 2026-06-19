const express = require('express');
const taskController = require('../controllers/task-controller');

const router = express.Router();

router.post('/images/generate', taskController.generateImage);
router.post('/images/tasks/:taskId/regenerate', taskController.reGenerateImage);
router.get('/images/tasks/:taskId', taskController.getTaskStatus);
router.get('/images/gallery', taskController.getGallery);

module.exports = router;
