const express = require("express");
const router = express.Router();
const confirmTimesheet = require("../controller/confirmTimesheet");

router.get("/", confirmTimesheet.getTimesheetConfirm);
router.get("/:staffId", confirmTimesheet.getTimesheetConfirmOfStaff);
router.post("/:staffId", confirmTimesheet.postConfirmStaffTimesheet);

module.exports = router;
