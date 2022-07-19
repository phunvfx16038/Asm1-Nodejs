const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
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
    default: 15,
  },
  role: {
    type: String,
    enum: ["Admin", "Basic"],
    required: true,
  },
  manager: {
    name: { type: String },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
  },
});

module.exports = mongoose.model("Staff", staffSchema);
