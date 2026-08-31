const express = require('express');
const {
  previewAnalysis,
  analyzeProject,
  generateArchitecture,
  generatePlan,
  copilotChat,
  seedDemo
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Preview analysis endpoint (unauthenticated or authenticated preview)
router.post('/analyze', previewAnalysis);

// Demo project seed endpoint
router.post('/demo/seed', protect, seedDemo);

// Authenticated project-specific AI endpoints
router.post('/:id/analyze', protect, analyzeProject);
router.post('/:id/generate-architecture', protect, generateArchitecture);
router.post('/:id/generate-plan', protect, generatePlan);
router.post('/:id/copilot', protect, copilotChat);

module.exports = router;

