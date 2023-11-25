const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  participants: {
    type: Number,
    required: true,
  },
  answers: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = GroupSet = mongoose.model("groupset", GroupSetSchema);
