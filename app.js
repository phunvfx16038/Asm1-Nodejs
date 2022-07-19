const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const multer = require("multer");
const Staff = require("./models/staff");
const app = express();
const flash = require("connect-flash");

const MONGODB_URI =
  "mongodb+srv://vanphu:Conheocon16@cluster0.qmmk4.mongodb.net/work?retryWrites=true&w=majority";

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const timesheetRoute = require("./routes/timesheet");
const profileRoute = require("./routes/profile");
const covidRoute = require("./routes/covid");
const timelistRoute = require("./routes/timelist");
const authRoutes = require("./routes/auth");
const confirmTimesheetRouter = require("./routes/confirmTimesheet");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("imageFile")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "This is my secret code in asm project for nodejs course",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  if (!req.session.staff) {
    return next();
  }

  Staff.findById(req.session.staff._id)
    .then((staff) => {
      req.staff = staff;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggin;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// app.use(staffRoutes);
app.use("/timesheet", timesheetRoute);
app.use("/profile", profileRoute);
app.use("/covid", covidRoute);
app.use("/timelist", timelistRoute);
app.use("/", authRoutes);
app.use("/confirmTimesheet", confirmTimesheetRouter);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
