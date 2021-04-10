const express = require('express');
const router = express.Router();
const  analyticsController = require("../controllers/analyticsController")

router.get('/analytics/weekly-report/:userId', analyticsController.getWeeklyReport);
router.get('/analytics/overall-report/:userId', analyticsController.getOverallStats);
router.get('/analytics/assigned-projects-report/:userId', analyticsController.getAssignedProjectAverages);

module.exports = router;
