const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const covidSchema = new Schema({
  temp: { type: Number, default: 37 },
  date: { type: String },
  vaccine: [
    {
      number: { type: Number },
      kindOfVaccine: { type: String },
      date: { type: String },
    },
  ],
  isCovid: { type: Boolean, default: false },
  staff: {
    name: { type: String },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      require: true,
    },
  },
});

module.exports = mongoose.model("Covid", covidSchema);
