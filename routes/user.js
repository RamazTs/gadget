const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")

router.post("/public/register", userController.register)
router.post("/public/login", userController.login)
router.get("/:userId", userController.getProfile)

module.exports = router;
