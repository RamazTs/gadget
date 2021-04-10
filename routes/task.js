const express = require('express');
const router = express.Router();
const projectController = require("../controllers/projectController")

router.get('/projects/:userId', projectController.getAllProjects);
router.post("/projects/:userId", projectController.addNewProject);
router.patch('/projects/:userId', projectController.updateProject);
router.delete("/projects/:userId", projectController.removeProject)
router.put("/projects/:userId", projectController.assignProject)
router.get("/projects/intervals/:userId", projectController.getIntervals);
router.post("/projects/intervals/:userId", projectController.createInterval);
router.patch("/projects/intervals/:userId", projectController.stopInterval);

module.exports = router;
