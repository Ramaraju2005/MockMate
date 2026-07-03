const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    interviewerName: {
      type: String,
      default: "",
    },
    intervieweeName: {
      type: String,
      default: "",
    },
    interviewDate: {
      type: Date,
      required: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    editorText: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);
