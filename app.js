const express = require("express");

const app = express();
app.use(express.json());

app.use("/api/courses", require("./routes/courses"));
app.use("/api/students", require("./routes/students"));

app.get("/", (req, res) => {
  res.json({ message: "Student Management API", endpoints: ["/api/students", "/api/courses"] });
});

app.use("/api", (req, res) => res.status(404).json({ message: "API route not found" }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors[0], errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    return res.status(409).json({ message: `Duplicate ${field}: it already exists` });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID or value" });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
