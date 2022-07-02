const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Staff = require("./models/staff");
const app = express();
const staffRoutes = require("./routes/staff");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname + "node_modules/jquery/dist")));

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  Staff.findById("62bc28e95757b52aa50405d3")
    .then((staff) => {
      req.staff = staff;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(staffRoutes);

mongoose
  .connect(
    "mongodb+srv://vanphu:Conheocon16@cluster0.qmmk4.mongodb.net/work?retryWrites=true&w=majority"
  )
  .then(() => {
    Staff.findOne().then((staff) => {
      if (!staff) {
        const staff = new Staff({
          name: "Mad Max",
          doB: "1999-01-01",
          startDate: "2019-04-30",
          department: "IT",
          image:
            "https://phongvu.vn/cong-nghe/wp-content/uploads/2019/09/tieusucasisullichoifx9137-d231aabb.jpg",
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
      }
      app.listen(3000);
    });
  })
  .catch((err) => console.log(err));
