const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const absentSchema = new Schema({
  reason: { type: String },
  date: [],
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    require: true,
  },
});

module.exports = mongoose.model("Absent", absentSchema);
