const express = require("express");
const router = express.Router();
const auth = require("../controller/auth");
const { check, body } = require("express-validator");

router.get("/", auth.getLogin);
router.post(
  "/",
  [
    body("email").isEmail().withMessage("Địa chỉ Email không đúng"),
    body("password", "Mật khẩu không đúng")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  auth.postLogin
);

router.get("/register", auth.getRegister);
router.post(
  "/register",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email đã tồn tại, Vui lòng chọn Email khác."
            );
          }
        });
      })
      .normalizeEmail(),
    body("password", "Mật khẩu phải là số hoặc chữ và có ít nhất 5 kí tự.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  auth.postRegister
);

module.exports = router;
