# Database Schema

**Database:** `student_management` (MongoDB)

## Relationship

```
courses (1) ────────< (many) students
          _id  <──────  course (ObjectId reference)
```

One course has many students; each student belongs to exactly one course.
Integrity rules enforced by the API:
- A student cannot be created/updated with a course that does not exist.
- A course cannot be deleted while students are enrolled in it.

## Collection: `courses`

| Field          | Type     | Rules                                           |
|----------------|----------|-------------------------------------------------|
| `_id`          | ObjectId | Auto-generated primary key                      |
| `code`         | String   | Required, **unique**, uppercase, 2-10 chars (e.g. `CS101`) |
| `name`         | String   | Required, 2-100 chars                           |
| `durationMonths` | Number | Required, 1-60                                  |
| `createdAt` / `updatedAt` | Date | Auto-managed                       |

## Collection: `students`

| Field            | Type     | Rules                                          |
|------------------|----------|------------------------------------------------|
| `_id`            | ObjectId | Auto-generated primary key                     |
| `studentId`      | String   | Required, **unique**, uppercase, 3-15 chars (e.g. `STU001`) |
| `name`           | String   | Required, 2-100 chars                          |
| `email`          | String   | Required, **unique**, valid format, stored lowercase |
| `course`         | ObjectId | Required, **references `courses._id`**         |
| `contact.phone`  | String   | Required, exactly 10 digits                    |
| `contact.address`| String   | Optional, up to 200 chars                      |
| `createdAt` / `updatedAt` | Date | Auto-managed                      |

## Example documents

```json
// courses
{ "_id": "66f1...", "code": "CS101", "name": "Computer Science", "durationMonths": 36 }

// students
{
  "_id": "66f2...",
  "studentId": "STU001",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "course": "66f1...",
  "contact": { "phone": "9876543210", "address": "Hyderabad" }
}
```

## Indexes

- `courses.code` (unique)
- `students.studentId` (unique)
- `students.email` (unique)
