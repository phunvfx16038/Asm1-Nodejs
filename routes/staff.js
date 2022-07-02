const path = require("path");
const express = require("express");
const staffController = require("../controller/staff");
const router = express.Router();

router.get("/", staffController.getHomePage);
router.post("/", staffController.postCheckInAndOut);
router.get("/absent", staffController.getAbsent);
router.post("/absent", staffController.postAbsent);
router.get("/info", staffController.getInfo);
router.post("/info", staffController.postInfo);
router.get("/timelist", staffController.getTimeList);
router.get("/covidInfo", staffController.getCovideInfo);
router.post("/covidInfo", staffController.postCovideInfo);

module.exports = router;
