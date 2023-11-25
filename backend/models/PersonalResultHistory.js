const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PersonalResultHistorySchema = new Schema({
  surveyID: {
    type: String,
  },
  customID: {
    type: String,
  },
  surveyResult: {
    type: Object,
  },
  surveyResultText: {
    type: String,
  },
  surveyTime: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = PersonalResultHistory = mongoose.model("personalresulthistory", PersonalResultHistorySchema);
