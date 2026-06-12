# Exam API Documentation

Base URL: `http://localhost:3000/exam`

All endpoints return JSON with the following error shape on failure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "error description",
  "timestamp": "2026-06-12T12:00:00.000Z"
}
```

All endpoints except `upload-audio` require a valid JWT access token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

---

## Create Exam

Creates a new exam.

**Endpoint:** `POST /exam`

**Request Body:**

```json
{
  "name": "IELTS Listening Test 1",
  "description": "Full IELTS listening practice test",
  "durationMinutes": 30,
  "totalScore": 40,
  "visibility": "public",
  "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
  "examTypeId": "uuid-of-exam-type",
  "isPublished": false
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "name": "IELTS Listening Test 1",
    "description": "Full IELTS listening practice test",
    "durationMinutes": 30,
    "totalScore": 40,
    "visibility": "public",
    "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
    "examTypeId": "uuid-of-exam-type",
    "isPublished": false,
    "createdAt": "2026-06-12T12:00:00.000Z"
  },
  "message": "Exam created successfully",
  "status": 201
}
```

---

## Create Part

Creates a new part within an exam.

**Endpoint:** `POST /exam/:examId/part`

**Request Body:**

```json
{
  "name": "Section 1",
  "type": "listening",
  "partOrder": 1,
  "instruction": "Listen to the conversation and answer questions 1-5",
  "score": 10
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "examId": "uuid",
    "name": "Section 1",
    "type": "listening",
    "partOrder": 1,
    "instruction": "Listen to the conversation and answer questions 1-5",
    "score": 10
  },
  "message": "Part created successfully",
  "status": 201
}
```

---

## Create Question Group

Creates a question group (e.g., a shared passage or audio segment) within a part.

**Endpoint:** `POST /exam/part/:partId/question-group`

**Request Body:**

```json
{
  "groupOrder": 1,
  "content": "Listen to the following conversation between two students...",
  "transcript": "Full transcript text here...",
  "type": "single"
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "partId": "uuid",
    "groupOrder": 1,
    "content": "Listen to the following conversation...",
    "transcript": "Full transcript text here...",
    "type": "single",
    "audioUrl": null
  },
  "message": "Question group created successfully",
  "status": 201
}
```

---

## Upload Question Group Audio

Uploads an audio file for a question group. This endpoint uses `multipart/form-data` (no JSON).

**Endpoint:** `PATCH /exam/question-group/:questionGroupId/upload-audio`

**Headers:** No `Authorization` header needed. The user ID is passed via `x-user-id` header.

| Header       | Value     |
|-------------|-----------|
| `x-user-id`  | `uuid`    |

**Request Body:** `multipart/form-data`

| Field  | Type | Description       |
|--------|------|-------------------|
| `file` | File | Audio file (MP3, etc.) |

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "audioUrl": "https://cdn.example.com/audio/uuid.mp3"
  },
  "message": "Question group audio uploaded successfully",
  "status": 200
}
```

---

## Create Question in Group

Creates a question that belongs to a question group.

**Endpoint:** `POST /exam/question-group/:questionGroupId/question`

**Request Body:**

```json
{
  "content": "What is the speakers main concern?",
  "explanation": "The speaker mentions that...",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctOption": {
    "key": "B"
  },
  "score": 1,
  "questionOrder": 1
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "questionGroupId": "uuid",
    "type": "group",
    "content": "What is the speakers main concern?",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "score": 1,
    "questionOrder": 1
  },
  "message": "Question created successfully",
  "status": 201
}
```

---

## Create Separate Question in Part

Creates a standalone question directly in a part (not inside a group).

**Endpoint:** `POST /exam/part/:partId/question`

**Request Body:**

```json
{
  "content": "What is the sum of 2 and 3?",
  "explanation": "2 + 3 = 5",
  "options": {
    "A": "4",
    "B": "5",
    "C": "6",
    "D": "7"
  },
  "correctOption": {
    "key": "B"
  },
  "score": 1,
  "questionOrder": 1
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "partId": "uuid",
    "type": "separate",
    "content": "What is the sum of 2 and 3?",
    "options": { "A": "4", "B": "5", "C": "6", "D": "7" },
    "score": 1,
    "questionOrder": 1
  },
  "message": "Question created successfully",
  "status": 201
}
```

---

## Create Session

Starts a new exam session (attempt).

**Endpoint:** `POST /exam/create-session/:examId`

**Request Body:**

```json
{
  "timeLimit": 1800
}
```

`timeLimit` is optional (seconds). Defaults to the exam's `durationMinutes` if omitted.

**Response `201`:**

```json
{
  "data": {
    "sessionId": "uuid",
    "startedAt": "2026-06-12T12:00:00.000Z",
    "timeLimitSeconds": 1800
  },
  "message": "Session created successfully",
  "status": 201
}
```

---

## Submit Answers

Saves (or updates) answers for an in-progress session. Can be called multiple times — previously saved answers for the same question are overwritten.

**Endpoint:** `POST /exam/submit-answers/:sessionId`

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": "uuid",
      "selectedOption": { "key": "B" }
    },
    {
      "questionId": "uuid",
      "answerContent": "Written response text"
    }
  ]
}
```

Each answer should include the `questionId` and one of: `selectedOption`, `answerContent`, or `audioUrl`.

**Response `200`:**

```json
{
  "data": {
    "sessionId": "uuid",
    "answered": 2,
    "answers": [
      { "questionId": "uuid", "answerId": "uuid" },
      { "questionId": "uuid", "answerId": "uuid" }
    ]
  },
  "message": "Answers submitted successfully",
  "status": 200
}
```

---

## Finish Session

Finalizes an in-progress session: calculates scores, marks it completed, and returns the results.

**Endpoint:** `POST /exam/finish-session/:sessionId`

**Request Body:** (empty JSON)

```json
{}
```

**Response `200`:**

```json
{
  "data": {
    "sessionId": "uuid",
    "status": "completed",
    "totalScore": 7,
    "totalCorrect": 7,
    "totalQuestions": 10,
    "correctRatio": 0.7,
    "durationSeconds": 1245
  },
  "message": "Session finished successfully",
  "status": 200
}
```

---

## Summary

| Endpoint                                              | Method | Auth Required | Notes                    |
|-------------------------------------------------------|--------|---------------|--------------------------|
| `/exam`                                               | POST   | Yes           | —                        |
| `/exam/:examId/part`                                  | POST   | Yes           | —                        |
| `/exam/part/:partId/question-group`                   | POST   | Yes           | —                        |
| `/exam/question-group/:questionGroupId/upload-audio`  | PATCH  | `x-user-id` header | `multipart/form-data` |
| `/exam/question-group/:questionGroupId/question`       | POST   | Yes           | —                        |
| `/exam/part/:partId/question`                         | POST   | Yes           | —                        |
| `/exam/create-session/:examId`                        | POST   | Yes           | —                        |
| `/exam/submit-answers/:sessionId`                     | POST   | Yes           | —                        |
| `/exam/finish-session/:sessionId`                     | POST   | Yes           | —                        |
