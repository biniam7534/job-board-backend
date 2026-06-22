# Job Board Platform — Backend API

Node.js + Express + MongoDB (Mongoose) backend for a job board: employers post jobs,
candidates upload resumes and apply, and both sides track application status.
Includes an admin layer for stats and user management.

## Setup

```bash
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a real JWT_SECRET
npm run dev          # starts with nodemon on http://localhost:5000
npm run seed         # optional: creates one sample employer, candidate, and job
```

Requires a running MongoDB instance (local `mongod`, or a connection string from
MongoDB Atlas).

## Project structure

```
config/db.js              MongoDB connection
models/                    Employer, Candidate, Job, Resume, Application, Notification, Admin
middleware/auth.js         JWT verification + role-based access (protect('employer'|'candidate'|'admin'))
middleware/upload.js       Multer config for resume uploads (PDF/DOC, 5MB limit)
middleware/errorHandler.js Centralized error responses
controllers/               Business logic per resource
routes/                    Express routers per resource
utils/generateToken.js     JWT signing helper
utils/seed.js              Sample data script
server.js                  App entry point
```

## Authentication

JWT-based. Register or log in to get a token, then send it as:
```
Authorization: Bearer <token>
```
Each token is scoped to a role (`employer`, `candidate`, or `admin`) — routes check
both the token's validity and whether that role is allowed to hit the endpoint.

## API reference

### Employers
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/employers/register` | — | Create employer account |
| POST | `/api/employers/login` | — | Log in, returns token |
| GET | `/api/employers/me` | employer | Get own profile |
| PATCH | `/api/employers/me` | employer | Update profile |
| GET | `/api/employers/me/jobs` | employer | List own job postings |

### Candidates
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/candidates/register` | — | Create candidate account |
| POST | `/api/candidates/login` | — | Log in, returns token |
| GET | `/api/candidates/me` | candidate | Get own profile + resumes |
| PATCH | `/api/candidates/me` | candidate | Update profile |
| GET | `/api/candidates/me/applications` | candidate | List own applications |

### Jobs
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/jobs` | — | Search/filter jobs (see query params below) |
| POST | `/api/jobs` | employer | Create a job posting |
| GET | `/api/jobs/:id` | — | Get one job |
| PATCH | `/api/jobs/:id` | employer (owner) | Update a job |
| DELETE | `/api/jobs/:id` | employer (owner) | Delete a job + its applications |
| GET | `/api/jobs/:jobId/applications` | employer (owner) | List applicants for a job |

**Search query params** (`GET /api/jobs?...`):
- `q` — full-text search across title/description/skills
- `location` — partial match
- `jobType` — `full-time` \| `part-time` \| `remote` \| `contract` \| `internship`
- `skills` — comma-separated list
- `minSalary`, `maxSalary` — numeric
- `page`, `limit` — pagination (default page=1, limit=10, max limit=50)

### Resumes
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/resumes/upload` | candidate | Upload resume (multipart field name: `resume`) |
| GET | `/api/resumes/mine` | candidate | List own resumes |
| DELETE | `/api/resumes/:id` | candidate (owner) | Delete a resume |

### Applications
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/applications` | candidate | Apply with `{ jobId, resumeId, note }` |
| PATCH | `/api/applications/:id/status` | employer (owner) | Update status: `applied`\|`reviewed`\|`shortlisted`\|`rejected`\|`hired` |

(List endpoints for applications live under `/api/candidates/me/applications` and
`/api/jobs/:jobId/applications` above.)

### Notifications
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | employer or candidate | List own notifications |
| PATCH | `/api/notifications/:id/read` | employer or candidate | Mark as read |

Notifications are created automatically: employers get one on every new application,
candidates get one on every status change.

### Admin
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/register` | — | Create admin (lock this down in production) |
| POST | `/api/admin/login` | — | Log in |
| GET | `/api/admin/stats` | admin | Job/user/application counts + status breakdown |
| GET | `/api/admin/employers` | admin | List all employers |
| GET | `/api/admin/candidates` | admin | List all candidates |
| GET | `/api/admin/jobs` | admin | List all jobs |
| PATCH | `/api/admin/employers/:id/deactivate` | admin | `{ isActive: false }` |
| PATCH | `/api/admin/candidates/:id/deactivate` | admin | `{ isActive: false }` |

## Example requests

**Register a candidate:**
```bash
curl -X POST http://localhost:5000/api/candidates/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Yonas Tesfaye","email":"yonas@example.test","password":"password123"}'
```

**Search jobs:**
```bash
curl "http://localhost:5000/api/jobs?q=backend&location=Addis&jobType=full-time&minSalary=80000"
```

**Upload a resume:**
```bash
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer <candidate_token>" \
  -F "resume=@/path/to/resume.pdf"
```

**Apply for a job:**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer <candidate_token>" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"<job_id>","resumeId":"<resume_id>","note":"Excited about this role"}'
```

**Update application status:**
```bash
curl -X PATCH http://localhost:5000/api/applications/<application_id>/status \
  -H "Authorization: Bearer <employer_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"shortlisted"}'
```

## Notes on production hardening

- Swap the static `/uploads` file serving for a private object store (S3, GCS) with
  signed URLs — serving resumes directly from disk is fine for development only.
  Replace this with a private object store and signed URLs before production.
- Lock down `/api/admin/register` (remove it, or require an existing admin token to
  create new ones) so it isn't a public signup route.
- Add rate limiting (e.g. `express-rate-limit`) on auth routes to slow down credential
  stuffing.
- Add `express-validator` checks on every route that takes a request body (the
  package is already in `package.json` — wiring it in is the next step).
