const express = require("express");
const router = express.Router();

const controller = require("../controller/translate.controller");

router.post("/", controller.translate);
router.post("/getTranslate", controller.getTranslate);
router.delete("/deleteTranslate/:id", controller.delete);


module.exports = router;