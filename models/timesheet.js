const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSheet = new Schema({
  month: { type: Number },
  day: { type: Number },
  totalWorkTimeInDay: { type: Number, default: 0 },
  overTimeInDay: { type: Number, default: 0 },
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
        type: Number,
      },
      confirmState: {
        type: Boolean,
        default: false,
      },
    },
  ],
  staff: {
    name: { type: String },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
  },
});

module.exports = mongoose.model("Timesheet", timeSheet);
