const express = require("express");
const router = express.Router();

const controller = require("../controller/summarize.controller");

router.post("/", controller.summarize);
router.post("/getSummarize", controller.getSummarize);
router.delete("/deleteSummarize/:id", controller.delete);


module.exports = router;