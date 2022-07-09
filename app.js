const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const Staff = require("./models/staff");
const app = express();

const MONGODB_URI =
  "mongodb+srv://vanphu:Conheocon16@cluster0.qmmk4.mongodb.net/work?retryWrites=true&w=majority";

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const timesheetRoute = require("./routes/timesheet");
const profileRoute = require("./routes/profile");
const covidRoute = require("./routes/covid");
const timelistRoute = require("./routes/timelist");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname + "node_modules/jquery/dist")));
app.use(
  session({
    secret: "This is my secret code in asm project for nodejs course",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  Staff.findById("62c3ff6a0d72a92d614647fd")
    .then((staff) => {
      req.staff = staff;
      next();
    })
    .catch((err) => console.log(err));
});

// app.use(staffRoutes);
app.use("/timesheet", timesheetRoute);
app.use("/profile", profileRoute);
app.use("/covid", covidRoute);
app.use("/timelist", timelistRoute);
app.use(authRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    Staff.findOne().then((staff) => {
      if (!staff) {
        const staff = new Staff({
          name: "Mad Max",
          doB: "01/01/1999",
          startDate: "30/04/2022",
          department: "IT",
          image:
            "https://phongvu.vn/cong-nghe/wp-content/uploads/2019/09/tieusucasisullichoifx9137-d231aabb.jpg",
          state: false,
        });
        staff.save();
      }
      app.listen(3000);
    });
  })
  .catch((err) => console.log(err));
