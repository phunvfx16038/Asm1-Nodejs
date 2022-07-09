const Staff = require("../models/staff");

exports.getInfo = (req, res, next) => {
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      res.render("profile/info", {
        pageTitle: "Thông tin nhân viên",
        staff: staff,
        path: "/info",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postInfo = (req, res, next) => {
  const image = req.body.imageFile;
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      staff.image = image;
      return staff.save();
    })
    .then((staff) => {
      res.render("profile/info", {
        pageTitle: "Thông tin nhân viên",
        staff: staff,
        path: "/info",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
