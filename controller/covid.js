const mongoose = require("mongoose");
const Covid = require("../models/covid");
const staff = require("../models/staff");
const Staff = require("../models/staff");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.getCovideInfo = (req, res, next) => {
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      if (staff.role === "Admin") {
        Staff.find({ "manager.managerId": staff._id }).then((staffs) => {
          //convert staffs to an Array Object to use reduce
          const staffsArr = [...staffs];

          //get list of staff id
          const idStaffArr = staffsArr.reduce((listId, current) => {
            const idEmployee = current._id.toString();
            return (listId = [...listId, idEmployee]);
          }, []);

          Covid.find()
            .then((covids) => {
              const listCovidInfoOfStaff = covids.filter((covid) => {
                return idStaffArr.includes(covid.staff.staffId.toString());
              });

              res.render("covidInfo/covidInfo", {
                pageTitle: "Đăng ký thông tin Covid",
                path: "/covid",
                covid: listCovidInfoOfStaff,
                role: req.staff.role,
              });
            })
            .catch((err) => console.log(err));
        });
      } else {
        res.render("covidInfo/covidInfo", {
          pageTitle: "Đăng ký thông tin Covid",
          path: "/covid",
          covid: null,
          role: req.staff.role,
        });
      }
    })
    .catch((err) => console.log(err));
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

  Covid.find({ "staff.staffId": staffId })
    .then((covid) => {
      //check covid is not created in database then create new one
      if (covid.length <= 0) {
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
          staff: {
            name: req.staff.name,
            staffId: mongoose.Types.ObjectId(staffId),
          },
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

exports.getCovidPdf = (req, res, next) => {
  const covidId = req.params.covidId;
  Covid.findById(covidId)
    .then((covid) => {
      if (!covid) {
        return next(new Error("Không tìm thấy thông tin Covid."));
      }
      const covidInfoName = "covidInfo-" + covidId + ".pdf";
      const covidPath = path.join("covidPDF", covidInfoName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + covidInfoName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(covidPath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Covid Information", {
        underline: false,
      });
      pdfDoc.text("-----------------------");

      pdfDoc.fontSize(16).text("Name: " + covid.staff.name);
      pdfDoc.fontSize(14).text("Temperature: " + covid.temp + " C");
      pdfDoc.fontSize(14).text("Date: " + covid.date);
      covid.vaccine.forEach((vac, index) => {
        let number = index + 1;
        pdfDoc.fontSize(14).text("Dose " + number + ": " + vac.kindOfVaccine);
        pdfDoc.fontSize(14).text("Date: " + vac.date);
      });
      const checkCovid = covid.isCovid ? "Yes" : "No";
      pdfDoc.fontSize(14).text("Is Covid ? : " + checkCovid);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
