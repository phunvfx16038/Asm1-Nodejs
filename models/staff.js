const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  doB: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    default:
      "https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1656063407~exp=1656064007~hmac=a695bfe6c2be61d56620d6a792daec2874752fb915f1916feb1f8ad5b4fed317",
  },
  state: {
    type: Boolean,
    required: true,
  },
  salaryScale: {
    type: Number,
    default: 1.5,
  },
  timesheets: {
    timesheetItem: [
      {
        month: { type: String, default: null },
        totalWorkTimeInMonth: { type: String, default: 0 },
        overTimeInMonth: { type: String, default: 0 },
        working: [
          {
            day: { type: String, default: null },
            totalWorkTimeInDay: { type: String, default: 0 },
            overTimeInDay: { type: String, default: 0 },
            worksheet: [
              {
                startWork: {
                  type: String,
                  required: true,
                },
                endWork: {
                  type: String,
                },
                workPlace: {
                  type: String,
                  required: true,
                },
                workTime: {
                  type: String,
                },
                date: {
                  type: String,
                  required: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  annualLeave: {
    type: Number,
    default: 120,
  },
  dayOff: {
    type: Array,
  },
  covidInfo: {
    temp: { type: Number, default: 37 },
    date: { type: String },
    vaccine: [],
    isCovid: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Staff", staffSchema);
