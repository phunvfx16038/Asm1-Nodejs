const path = require("path");
const express = require("express");
const profileController = require("../controller/profile");
const router = express.Router();

router.get("/info", profileController.getInfo);
router.post("/info", profileController.postInfo);

module.exports = router;
