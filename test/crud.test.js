// Runs every database operation through the real API against a SEPARATE test
// database (student_management_test), so your real data is never touched.
// Usage: npm test   (MongoDB must be running)
require("dotenv").config();
const assert = require("assert");
const mongoose = require("mongoose");
const app = require("../app");
const Student = require("../models/Student");
const Course = require("../models/Course");

const BASE_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_management";
const TEST_URI = BASE_URI.replace(/\/[^/?]+(\?|$)/, "/student_management_test$1");

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    console.error(`  FAIL  ${name}\n        ${err.message}`);
    process.exitCode = 1;
  }
}

(async () => {
  await mongoose.connect(TEST_URI);
  await Promise.all([Student.deleteMany({}), Course.deleteMany({})]);
  await Promise.all([Student.init(), Course.init()]); // make sure unique indexes exist

  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const call = async (method, url, body) => {
    const res = await fetch(base + url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json() };
  };

  console.log(`\nTesting against ${TEST_URI}\n`);

  let course;
  let student;
  const validStudent = () => ({
    studentId: "stu001",
    name: "Priya Sharma",
    email: "Priya@Example.com",
    course: course._id,
    contact: { phone: "9876543210", address: "Hyderabad" },
  });

  await test("Create course", async () => {
    const r = await call("POST", "/courses", { code: "cs101", name: "Computer Science", durationMonths: 36 });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.code, "CS101"); // normalised to uppercase
    course = r.body;
  });

  await test("Create student (id/email normalised, course linked)", async () => {
    const r = await call("POST", "/students", validStudent());
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.studentId, "STU001");
    assert.strictEqual(r.body.email, "priya@example.com");
    assert.strictEqual(r.body.course.code, "CS101");
    student = r.body;
  });

  await test("Read all students (course populated)", async () => {
    const r = await call("GET", "/students");
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.length, 1);
    assert.strictEqual(r.body[0].course.name, "Computer Science");
  });

  await test("Read one student", async () => {
    const r = await call("GET", `/students/${student._id}`);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.name, "Priya Sharma");
  });

  await test("Filter students by course", async () => {
    const r = await call("GET", `/students?course=${course._id}`);
    assert.strictEqual(r.body.length, 1);
  });

  await test("Update student", async () => {
    const r = await call("PUT", `/students/${student._id}`, {
      ...validStudent(),
      name: "Priya S. Sharma",
      contact: { phone: "9123456780", address: "Pune" },
    });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.name, "Priya S. Sharma");
    assert.strictEqual(r.body.contact.phone, "9123456780");
  });

  await test("Reject duplicate email (409)", async () => {
    const r = await call("POST", "/students", { ...validStudent(), studentId: "STU002" });
    assert.strictEqual(r.status, 409);
  });

  await test("Reject duplicate student ID (409)", async () => {
    const r = await call("POST", "/students", { ...validStudent(), email: "other@example.com" });
    assert.strictEqual(r.status, 409);
  });

  await test("Reject invalid email (400)", async () => {
    const r = await call("POST", "/students", { ...validStudent(), studentId: "STU003", email: "not-an-email" });
    assert.strictEqual(r.status, 400);
  });

  await test("Reject invalid phone (400)", async () => {
    const v = validStudent();
    v.studentId = "STU004";
    v.email = "a@example.com";
    v.contact.phone = "123";
    const r = await call("POST", "/students", v);
    assert.strictEqual(r.status, 400);
  });

  await test("Reject missing required fields (400)", async () => {
    const r = await call("POST", "/students", { studentId: "STU005" });
    assert.strictEqual(r.status, 400);
  });

  await test("Reject non-existent course (400)", async () => {
    const v = validStudent();
    v.studentId = "STU006";
    v.email = "b@example.com";
    v.course = new mongoose.Types.ObjectId();
    const r = await call("POST", "/students", v);
    assert.strictEqual(r.status, 400);
  });

  await test("Reject invalid ID format (400)", async () => {
    const r = await call("GET", "/students/abc");
    assert.strictEqual(r.status, 400);
  });

  await test("Unknown student returns 404", async () => {
    const r = await call("GET", `/students/${new mongoose.Types.ObjectId()}`);
    assert.strictEqual(r.status, 404);
  });

  await test("Cannot delete course while students are enrolled (409)", async () => {
    const r = await call("DELETE", `/courses/${course._id}`);
    assert.strictEqual(r.status, 409);
  });

  await test("Delete student", async () => {
    const r = await call("DELETE", `/students/${student._id}`);
    assert.strictEqual(r.status, 200);
    assert.strictEqual((await call("GET", `/students/${student._id}`)).status, 404);
  });

  await test("Delete course once no students remain", async () => {
    const r = await call("DELETE", `/courses/${course._id}`);
    assert.strictEqual(r.status, 200);
  });

  console.log(`\n${passed} test(s) passed${process.exitCode ? ", some FAILED" : ""}\n`);

  await Promise.all([Student.deleteMany({}), Course.deleteMany({})]);
  server.close();
  await mongoose.disconnect();
})().catch((err) => {
  console.error("Test run failed:", err.message);
  process.exit(1);
});
