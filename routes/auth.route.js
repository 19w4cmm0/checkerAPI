const express = require("express");
const router = express.Router();

const controller = require("../controller/authController");

router.post("/login", controller.login);
router.post("/register", controller.register);

module.exports = router;