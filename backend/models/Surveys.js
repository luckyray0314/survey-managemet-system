const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SurveySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  json: {
    type: Object,
  },
  text: {
    type: String,
  },
  intro: {
    type: String,
  },
  groupSet: {
    type: Object,
  },
  lang: {
    type: String,
  },
  custom:{
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Survey = mongoose.model("survey", SurveySchema);
