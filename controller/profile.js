const Staff = require("../models/staff");

exports.getInfo = (req, res, next) => {
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      res.render("profile/info", {
        pageTitle: "Thông tin nhân viên",
        staff: staff,
        path: "/info",
        role: req.staff.role,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postInfo = (req, res, next) => {
  const image = req.file;
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      staff.image = image.path;
      return staff.save();
    })
    .then((staff) => {
      res.render("profile/info", {
        pageTitle: "Thông tin nhân viên",
        staff: staff,
        path: "/info",
        role: req.staff.role,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
