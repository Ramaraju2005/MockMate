const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: false,
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
    interviewType: {
      type: String,
      default: "general",
    },
    questions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    report: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);
