const express = require("express");
const router = express.Router();

const controller = require("../controller/grammar.controller");

router.post("/", controller.grammar);
router.post("/getGrammar", controller.getGrammar);
router.delete("/deleteGrammar/:id", controller.delete);


module.exports = router;