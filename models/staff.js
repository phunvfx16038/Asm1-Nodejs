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
  },
  state: {
    type: Boolean,
    required: true,
  },
  salaryScale: {
    type: Number,
    default: 1.5,
  },
  annualLeave: {
    type: Number,
    default: 120,
  },
});

module.exports = mongoose.model("Staff", staffSchema);
