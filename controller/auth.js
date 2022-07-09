const Staff = require("../models/staff");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggin);
  res.render("login", {
    pageTitle: "Đăng nhập",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  req.session.isLoggin = true;
  res.redirect("/");
};

exports.getRegister = (req, res, next) => {
  res.render("register", {
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
  const image = req.body.image;

  console.log(email);
  Staff.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/");
      }

      const staff = new Staff({
        email: email,
        password: password,
        name: name,
        doB: doB,
        startDate: startDate,
        department: department,
        salaryScale: salaryScale,
        image: image,
        state: false,
        covidInfo: {
          vaccine: [],
        },
        timesheets: {
          timesheetItem: [
            {
              working: [
                {
                  worksheet: [],
                },
              ],
            },
          ],
        },
      });
      staff.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
