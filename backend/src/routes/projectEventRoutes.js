const express = require('express');
const { getEvents } = require('../controllers/projectEventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/projects/:id/events', getEvents);

module.exports = router;
