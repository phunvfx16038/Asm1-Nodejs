const mongoose = require("mongoose");
const Covid = require("../models/covid");

exports.getCovideInfo = (req, res, next) => {
  res.render("covidInfo/covidInfo", {
    pageTitle: "Đăng ký thông tin Covid",
    path: "/covid",
  });
};

exports.postCovideInfo = (req, res, next) => {
  const staffId = req.staff._id;
  const temp = req.body.temp;
  const date = req.body.covidDateTime;
  let isCovid = req.body.checkCovid;
  const vaccine1 = req.body.vaccine1;
  const vaccine2 = req.body.vaccine2;
  const vaccine3 = req.body.vaccine3;
  const vaccineType1 = req.body.vaccineType1;
  const vaccineType2 = req.body.vaccineType2;
  const vaccineType3 = req.body.vaccineType3;

  const objVaccine1 = { num: 1, date: vaccine1, kindOfVaccine: vaccineType1 };
  const objVaccine2 = { num: 2, date: vaccine2, kindOfVaccine: vaccineType2 };
  const objVaccine3 = { num: 3, date: vaccine3, kindOfVaccine: vaccineType3 };
  isCovid = isCovid === undefined ? false : true;
  console.log(isCovid);
  Covid.find({ staffId: staffId })
    .then((covid) => {
      //check covid is not created in database then create new one
      if (!covid[0]) {
        //pass item vaccine to vaccine array
        const vaccine = [
          { ...objVaccine1 },
          { ...objVaccine2 },
          { ...objVaccine3 },
        ];

        const covid = new Covid({
          temp: temp,
          date: date,
          isCovid: isCovid,
          vaccine: vaccine,
          staffId: mongoose.Types.ObjectId(staffId),
        });
        return covid.save();
      } else {
        //covid has already exist then update new data
        const currentVaccine = [...covid[0].vaccine];
        const vaccine = [
          ...currentVaccine,
          { ...objVaccine1 },
          { ...objVaccine2 },
          { ...objVaccine3 },
        ];
        covid[0].temp = temp;
        (covid[0].date = date),
          (covid[0].isCovid = isCovid),
          (covid[0].vaccine = vaccine);

        return covid[0].save();
      }
    })
    .then((covid) => {
      res.redirect("/timesheet");
    })
    .catch((err) => console.log(err));
};
