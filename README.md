# Student Management Database

A student management database built with **MongoDB (Mongoose)**, with a **Node.js/Express** REST API for CRUD operations and an automated test script.

- Two collections: `students` and `courses`, linked by a reference (one course : many students)
- Student fields: student ID, name, email, course, contact details (phone, address)
- Validation, unique constraints and referential-integrity checks keep data accurate
- Full schema description: see [SCHEMA.md](SCHEMA.md)

## Project Structure

```
├── models/
│   ├── Course.js        # courses schema
│   └── Student.js       # students schema (references Course)
├── routes/
│   ├── courses.js       # course CRUD
│   └── students.js      # student CRUD
├── test/crud.test.js    # tests all database operations
├── app.js               # Express app + error handling
├── server.js            # DB connection + server start
├── SCHEMA.md            # database schema
└── screenshots/
```

## Setup

Requires Node.js 18+ and MongoDB running locally.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm start
```

The server runs at http://localhost:5000 and creates the `student_management` database on first insert.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST / GET | `/api/courses` | Create / list courses |
| GET / PUT / DELETE | `/api/courses/:id` | Read / update / delete a course |
| POST / GET | `/api/students` | Create / list students (`?course=<id>` filters) |
| GET / PUT / DELETE | `/api/students/:id` | Read / update / delete a student |

Create a course first, then use its `_id` when creating students:

```json
POST /api/courses
{ "code": "CS101", "name": "Computer Science", "durationMonths": 36 }

POST /api/students
{
  "studentId": "STU001",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "course": "<course _id>",
  "contact": { "phone": "9876543210", "address": "Hyderabad" }
}
```

Errors return `{ "message": "..." }` with status 400 (validation / bad ID), 404 (not found) or 409 (duplicate, or course still has students).

## Testing

```bash
npm test
```

Runs 17 checks (create, read, update, delete, duplicate email/ID, invalid email/phone, missing fields, non-existent course, course-delete protection) against a separate `student_management_test` database, so real data is never touched.

## Viewing the data

Open MongoDB Compass at `mongodb://127.0.0.1:27017` and browse `student_management`, or use mongosh:

```
use student_management
db.students.find().pretty()
db.courses.find().pretty()
```

## Screenshots

### Tests
![npm test](screenshots/1-npm-test.png)

### Create (courses and students)
![Course 1](screenshots/2-course-1.png)
![Student 1](screenshots/3-student-1.png)
![Student 2](screenshots/4-student-2.png)
![Student 3](screenshots/5-student-3.png)
![Student 4](screenshots/6-student-4.png)
![Course 2](screenshots/7-course-2.png)

### Read
![GET](screenshots/11-get.png)

### Update
![PUT](screenshots/9-put.png)

### Delete
![DELETE](screenshots/10-delete.png)

### Validation and relationships
![Duplicate ID](screenshots/8-duplicate-id.png)
![Non-existent course](screenshots/12-non-existent-course.png)
![Course deletion blocked](screenshots/13-course-deletion-blocked.png)

### Database (MongoDB Compass)
![Students collection](screenshots/14-students-mongodb.png)
![Courses collection](screenshots/15-courses-mongodb.png)
