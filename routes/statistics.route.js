const express = require("express");
const router = express.Router();

const controller = require("../controller/statistics.controller");


router.post("/", controller.getStatistics);

module.exports = router;