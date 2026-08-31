const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask
} = require('../controllers/taskController');
const { validateCreateTask, validateUpdateTask } = require('../validators/taskValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Project tasks list & creation
router.get('/projects/:id/tasks', getTasks);
router.post('/projects/:id/tasks', validateCreateTask, createTask);

// Direct task operations
router.put('/tasks/:id', validateUpdateTask, updateTask);
router.delete('/tasks/:id', deleteTask);
router.post('/tasks/:id/assign', assignTask);

module.exports = router;
