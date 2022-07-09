const express = require("express");
const router = express.Router();
const auth = require("../controller/auth");

router.get("/login", auth.getLogin);
router.post("/login", auth.postLogin);
router.get("/register", auth.getRegister);
router.post("/register", auth.postRegister);

module.exports = router;
