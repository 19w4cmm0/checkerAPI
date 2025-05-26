const express = require("express");
const router = express.Router();

const controller = require("../controller/img.controller");

router.post("/", controller.image);
router.post("/getImage", controller.getImage);
router.delete("/deleteImage/:id", controller.deleteImage);

module.exports = router;