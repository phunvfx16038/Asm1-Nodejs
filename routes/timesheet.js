const path = require("path");
const express = require("express");
const timesheetController = require("../controller/timesheet");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

router.get("/", isAuth, timesheetController.getHomePage);

router.get("/checkin", isAuth, timesheetController.getCheckin);
router.post("/checkin", isAuth, timesheetController.postCheckin);

router.get("/checkout", isAuth, timesheetController.getCheckout);
router.post("/checkout", isAuth, timesheetController.postCheckout);

router.get("/absent", isAuth, timesheetController.getAbsent);
router.post("/absent", isAuth, timesheetController.postAbsent);

module.exports = router;
