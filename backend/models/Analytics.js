const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnalyticsSchema = new Schema({
  surveyID: {
    type: String,
  },
  noticedQuestion: {
    type: Object,
  },
  groupSet: {
    type: Object,
  },
  weightingResult: {
    type: Object,
  },
  weights: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Analytics = mongoose.model("analytics", AnalyticsSchema);
