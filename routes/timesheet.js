const path = require("path");
const express = require("express");
const timesheetController = require("../controller/timesheet");
const router = express.Router();

router.get("/", timesheetController.getHomePage);

router.get("/checkin", timesheetController.getCheckin);
router.post("/checkin", timesheetController.postCheckin);

router.get("/checkout", timesheetController.getCheckout);
router.post("/checkout", timesheetController.postCheckout);

router.get("/absent", timesheetController.getAbsent);
router.post("/absent", timesheetController.postAbsent);

module.exports = router;
