const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
      uppercase: true,
      unique: true,
      match: [/^[A-Z0-9-]{2,10}$/, "Course code must be 2-10 letters/numbers (e.g. CS101)"],
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      minlength: [2, "Course name must be at least 2 characters"],
      maxlength: [100, "Course name must be at most 100 characters"],
    },
    durationMonths: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 month"],
      max: [60, "Duration must be at most 60 months"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
