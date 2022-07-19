const express = require("express");
const router = express.Router();
const timelistController = require("../controller/timelist");
const isAuth = require("../middleware/is-auth");

router.get("/", isAuth, timelistController.getTimeList);
router.post("/", isAuth, timelistController.postTimeList);

module.exports = router;
