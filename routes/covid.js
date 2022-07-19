const express = require("express");
const router = express.Router();
const covidController = require("../controller/covid");
const isAuth = require("../middleware/is-auth");

router.get("/", isAuth, covidController.getCovideInfo);
router.post("/", isAuth, covidController.postCovideInfo);
router.get("/:covidId", isAuth, covidController.getCovidPdf);

module.exports = router;
