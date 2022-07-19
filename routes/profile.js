const path = require("path");
const express = require("express");
const profileController = require("../controller/profile");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

router.get("/info", isAuth, profileController.getInfo);
router.post("/info", isAuth, profileController.postInfo);

module.exports = router;
