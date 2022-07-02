const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSheet = new Schema({
  startWork: {
    type: String,
    required: true,
  },
  endWork: {
    type: String,
  },
  staff: {
    name: { type: String, required: true },
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    totalWorkedTime: { type: Number },
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
});

module.exports = mongoose.model("Timesheet", timeSheet);
