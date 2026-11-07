const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Student = require("../models/Student");

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }
  next();
}

const pick = ({ code, name, durationMonths } = {}) => ({ code, name, durationMonths });

// CREATE
router.post("/", wrap(async (req, res) => {
  res.status(201).json(await Course.create(pick(req.body)));
}));

// READ all
router.get("/", wrap(async (req, res) => {
  res.json(await Course.find().sort({ code: 1 }));
}));

// READ one
router.get("/:id", validateId, wrap(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
}));

// UPDATE
router.put("/:id", validateId, wrap(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
}));

// DELETE - blocked while students are enrolled (keeps data consistent)
router.delete("/:id", validateId, wrap(async (req, res) => {
  const enrolled = await Student.countDocuments({ course: req.params.id });
  if (enrolled > 0) {
    return res.status(409).json({
      message: `Cannot delete course: ${enrolled} student(s) are enrolled in it`,
    });
  }
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json({ message: "Course deleted successfully" });
}));

module.exports = router;
