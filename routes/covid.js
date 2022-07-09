const express = require("express");
const router = express.Router();
const covidController = require("../controller/covid");

router.get("/", covidController.getCovideInfo);
router.post("/", covidController.postCovideInfo);

module.exports = router;
