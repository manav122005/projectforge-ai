const express = require('express');
const {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/milestoneController');
const { validateCreateMilestone, validateUpdateMilestone } = require('../validators/milestoneValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Project milestones list & creation
router.get('/projects/:id/milestones', getMilestones);
router.post('/projects/:id/milestones', validateCreateMilestone, createMilestone);

// Direct milestone update & deletion
router.put('/milestones/:id', validateUpdateMilestone, updateMilestone);
router.delete('/milestones/:id', deleteMilestone);

module.exports = router;
