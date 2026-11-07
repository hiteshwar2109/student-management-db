const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      trim: true,
      uppercase: true,
      unique: true,
      match: [/^[A-Z0-9-]{3,15}$/, "Student ID must be 3-15 letters/numbers (e.g. STU001)"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    // Relationship: each student belongs to one course (many students : one course)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    contact: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
      },
      address: {
        type: String,
        trim: true,
        maxlength: [200, "Address must be at most 200 characters"],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
