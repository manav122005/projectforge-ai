const express = require('express');
const {
  getMembers,
  addMember,
  updateMember,
  removeMember,
  getSkillGap
} = require('../controllers/teamController');
const { validateAddMember } = require('../validators/teamValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Team members list & addition
router.get('/projects/:id/members', getMembers);
router.post('/projects/:id/members', validateAddMember, addMember);

// Direct member update & removal
router.put('/projects/:id/members/:memberId', updateMember);
router.delete('/projects/:id/members/:memberId', removeMember);

// Skill Gap analysis
router.get('/projects/:id/skill-gap', getSkillGap);

module.exports = router;
