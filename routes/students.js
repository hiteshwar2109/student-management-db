const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Course = require("../models/Course");

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }
  next();
}

const pick = ({ studentId, name, email, course, contact } = {}) => ({
  studentId,
  name,
  email,
  course,
  contact: contact ? { phone: contact.phone, address: contact.address } : undefined,
});

// Make sure the referenced course really exists (referential integrity)
async function courseExists(courseId) {
  if (!mongoose.isValidObjectId(courseId)) return false;
  return Boolean(await Course.exists({ _id: courseId }));
}

// CREATE
router.post("/", wrap(async (req, res) => {
  const data = pick(req.body);
  if (!(await courseExists(data.course))) {
    return res.status(400).json({ message: "Course does not exist" });
  }
  const student = await Student.create(data);
  res.status(201).json(await student.populate("course"));
}));

// READ all (course details included); optional ?course=<courseId> filter
router.get("/", wrap(async (req, res) => {
  const filter = {};
  if (req.query.course) {
    if (!mongoose.isValidObjectId(req.query.course)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    filter.course = req.query.course;
  }
  res.json(await Student.find(filter).populate("course").sort({ studentId: 1 }));
}));

// READ one
router.get("/:id", validateId, wrap(async (req, res) => {
  const student = await Student.findById(req.params.id).populate("course");
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
}));

// UPDATE
router.put("/:id", validateId, wrap(async (req, res) => {
  const data = pick(req.body);
  if (data.course !== undefined && !(await courseExists(data.course))) {
    return res.status(400).json({ message: "Course does not exist" });
  }
  const student = await Student.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).populate("course");
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
}));

// DELETE
router.delete("/:id", validateId, wrap(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json({ message: "Student deleted successfully" });
}));

module.exports = router;
