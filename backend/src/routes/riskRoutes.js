const express = require('express');
const {
  getRisks,
  detectRisks,
  createRisk,
  resolveRisk,
  getRecoveryPlan,
  applyRecoveryPlan
} = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/projects/:id/risks', getRisks);
router.post('/projects/:id/risks/detect', detectRisks);
router.post('/projects/:id/risks', createRisk);
router.post('/projects/:id/risks/:riskId/resolve', resolveRisk);
router.post('/projects/:id/recovery-plan', getRecoveryPlan);
router.post('/projects/:id/recovery-plan/apply', applyRecoveryPlan);

module.exports = router;
