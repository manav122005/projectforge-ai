const express = require('express');
const {
  create,
  getProjects,
  getProject,
  update,
  remove,
  duplicate,
  archive
} = require('../controllers/projectController');
const { validateCreateProject, validateUpdateProject } = require('../validators/projectValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all project routes
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(validateCreateProject, create);

router.route('/:id')
  .get(getProject)
  .put(validateUpdateProject, update)
  .delete(remove);

router.post('/:id/duplicate', duplicate);
router.post('/:id/archive', archive);

module.exports = router;
