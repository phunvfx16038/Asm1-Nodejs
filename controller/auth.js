const Staff = require("../models/staff");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { mongoose } = require("mongoose");

exports.getLogin = (req, res, next) => {
  const errors = validationResult(req);

  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Đăng nhập",
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Đăng nhập",
      errorMessage: errors.array()[0].msg,
    });
  }
  Staff.findOne({ email: email })
    .then((staff) => {
      if (!staff) {
        res.redirect("/");
      }
      bcrypt
        .compare(password, staff.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggin = true;
            req.session.staff = staff;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/timesheet");
            });
          }
          return res.redirect("/");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/");
        });
    })
    .catch((err) => console.log(err));
};

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {
    pageTitle: "Đăng ký",
  });
};

exports.postRegister = (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const doB = req.body.doB;
  const salaryScale = req.body.salaryScale;
  const startDate = req.body.startDate;
  const department = req.body.department;
  const image = req.file;
  const managerEmail = req.body.managerEmail;
  const role = req.body.role;
  Staff.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/");
      }
      return bcrypt.hash(password, 12).then((hashPassword) => {
        Staff.findOne({ email: managerEmail }).then((manager) => {
          const staff = new Staff({
            email: email,
            password: hashPassword,
            name: name,
            doB: doB,
            startDate: startDate,
            department: department,
            salaryScale: salaryScale,
            image: image.path,
            state: false,
            role: role,
            manager: {
              name: manager.name,
              managerId: mongoose.Types.ObjectId(manager._id),
            },
          });
          staff.save();
        });
      });
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
