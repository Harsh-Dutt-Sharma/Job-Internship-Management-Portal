# JobPortal – Job & Internship Management Portal

A full-featured, responsive, and interactive frontend web application integrated with **JSON Server** as a unified REST API backend, built using **HTML5, CSS3, and beginner-to-intermediate Vanilla JavaScript**.

Designed as a collaborative college team project to simulate a modern career portal for students and job seekers. The portal allows users to discover job and internship opportunities, submit applications, manage application statuses (CRUD), bookmark listings, personalize student profiles, toggle portal settings, and review notifications—with data saved directly into a common REST API backend.

---

## 📁 Project Structure

```text
Job-Internship-Management-Portal/
│
├── CSS/
│   ├── applications.css        # My Applications page styling & status badges
│   ├── apply-card.css          # Job Application form styling & job banner
│   ├── dashboard.css           # Core dashboard layout, sidebar, header, modals, toasts
│   ├── discovery_jobs.css      # Discover Jobs layout, filters, and cards
│   ├── help.css                # Help center accordion & contact inquiry form
│   ├── home.css                # Landing page hero, search bar & featured sections
│   ├── jobs.css                # Browse Jobs catalog styling & filter controls
│   ├── opportunity-details.css # Company details & opportunity banner styles
│   ├── profile.css             # Student profile overview & editable fields
│   ├── saved-jobs.css          # Bookmarks grid, cards & badge counts
│   └── settings.css            # Account settings & notification switches
│
├── HTML/
│   ├── Amazon.html             # Amazon SDE Intern opportunity spotlight
│   ├── applications.html       # Full application tracking system with CRUD modals
│   ├── apply.html              # Multi-field job application form with pre-filling
│   ├── dashboard.html          # Main portal dashboard with live REST metrics & counters
│   ├── discovery_jobs.html     # Alternative discovery view with filters & bookmarking
│   ├── Google.html             # Google Frontend Developer Intern spotlight
│   ├── help.html               # FAQ accordion & contact support form
│   ├── home.html               # Portal home landing page with search & categories
│   ├── jobs.html               # Primary Browse Jobs catalog with quick apply & bookmarking
│   ├── microsoft.html          # Microsoft Web Developer Intern spotlight
│   ├── profile.html            # Student profile with editable personal & academic info
│   ├── saved-jobs.html         # Saved jobs page with live removal & application flow
│   ├── settings.html           # User preferences, email alerts, & UI settings
│   ├── swiggy.html             # Swiggy Software Engineer Intern spotlight
│   └── zomato.html             # Zomato UI Developer Intern spotlight
│
├── JavaScript/
│   ├── api.js                  # Central REST API communication module (window.API)
│   ├── applications.js         # Applications CRUD: GET, POST, PATCH, DELETE operations
│   ├── applyjs.js              # Application form validation, job info fetching & submission
│   ├── common.js               # Shared logic: REST profile/notifications sync, sidebar, toast, modal
│   ├── dashboard.js            # Summary card counts, recent applications, saved jobs via API
│   ├── discover_ jobs.js       # Dynamic discovery jobs rendering, filters & bookmarking
│   ├── help.js                 # FAQ accordion & support inquiry submission
│   ├── jobs.js                 # Job catalog rendering, type filters, bookmarking & quick apply
│   ├── profile.js              # Profile data fetching, form editing & PATCH updates
│   ├── saved-jobs.js           # Bookmarks rendering, DELETE requests, and application routing
│   └── settings.js             # Preferences fetching & PATCH updates via API
│
├── images/                     # Company logos, illustration icons, and assets
├── db.json                     # JSON Server mock database (7 collections)
├── package.json                # Project dependencies & start scripts
├── package-lock.json           # Locked dependency versions
├── .gitignore                  # Git ignore rules for node_modules and OS files
└── README.md                   # Comprehensive project documentation
```

---

## ⚙️ Backend Architecture (JSON Server REST API)

The portal utilizes [JSON Server](https://github.com/typicode/json-server) to provide a full fake REST API server backed by the `db.json` file. All pages communicate asynchronously using standard HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`).

### Common API Client (`JavaScript/api.js`)
All HTTP requests are centralized in `JavaScript/api.js` and exposed globally as `window.API` for clean, beginner-to-intermediate JavaScript code:

| Method | Function | Description |
|---|---|---|
| `GET` | `API.getJobs()` | Fetch all job listings |
| `GET` | `API.getJobById(id)` | Fetch single job listing by ID |
| `GET` | `API.getApplications()` | Fetch all student job applications |
| `GET` | `API.getApplicationById(id)` | Fetch single application details |
| `POST` | `API.addApplication(data)` | Submit a new job application |
| `PATCH` | `API.updateApplication(id, data)` | Update an existing application (e.g. status) |
| `DELETE` | `API.deleteApplication(id)` | Delete an application |
| `GET` | `API.getSavedJobs()` | Fetch all saved/bookmarked jobs |
| `POST` | `API.saveJob(data)` | Save a job to bookmarks |
| `DELETE` | `API.removeSavedJob(id)` | Remove a job from bookmarks |
| `GET` | `API.getProfile()` | Fetch student profile information |
| `PATCH` | `API.updateProfile(data)` | Update student profile information |
| `GET` | `API.getNotifications()` | Fetch all notification alerts |
| `PATCH` | `API.markNotificationAsRead(id)` | Mark a single notification as read |
| `GET` | `API.getSettings()` | Fetch portal and notification preferences |
| `PATCH` | `API.updateSettings(data)` | Update portal settings |

### Database Collections in `db.json`
1. **`jobs`**: 17 realistic tech listings across major companies (Google, Microsoft, Amazon, Swiggy, Zomato, Adobe, Flipkart, Uber, TCS, Infosys, etc.).
2. **`applications`**: 12 initial applications strictly matching dashboard counters (3 Shortlisted, 4 In Review, 5 Rejected).
3. **`savedJobs`**: Initial bookmarked jobs with full job details.
4. **`profile`**: Student profile for "Isha Rana" (B.Tech CSE student).
5. **`notifications`**: 4 user notifications with status indicators and timestamps.
6. **`settings`**: User notification toggles, theme options, and privacy preferences.
7. **`users`**: User account credentials and session info.

---

## 🚀 How to Setup and Run

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or newer recommended)
- Modern web browser (Chrome, Edge, Firefox, etc.)
- VS Code (with the Live Server extension recommended)

---

### Step 1: Install Dependencies
Open your terminal in the root directory `Job-Internship-Management-Portal/` and run:

```bash
npm install
```

This installs `json-server` (version `^0.17.4`).

---

### Step 2: Start the Backend REST API Server
Start JSON Server with the watch flag:

```bash
npm run server
```

The server will start on port 3000:
```text
  \{^_^}/ hi!

  Loading db.json
  Done

  Resources
  http://localhost:3000/users
  http://localhost:3000/profile
  http://localhost:3000/jobs
  http://localhost:3000/applications
  http://localhost:3000/savedJobs
  http://localhost:3000/notifications
  http://localhost:3000/settings

  Home
  http://localhost:3000
```

> **Note**: Keep this terminal open while using the application so API requests can be served. Any changes made through the web pages will automatically persist to `db.json`.

---

### Step 3: Open the Frontend

#### Option A: Using VS Code Live Server (Recommended)
1. Open VS Code and open the `Job-Internship-Management-Portal` folder.
2. In the file explorer, navigate to `HTML/dashboard.html` or `HTML/home.html`.
3. Right-click and choose **"Open with Live Server"**.
4. The application will open in your browser at `http://127.0.0.1:5500/HTML/dashboard.html`.

#### Option B: Using Node.js or Python Static Server
In a separate terminal window:
```bash
# Using Node.js
npx serve .

# OR using Python
python -m http.server 8080
```
Then visit: `http://localhost:8080/HTML/dashboard.html`

---

## ✨ Key Features & Page Integrations

### 1. Dashboard (`dashboard.html`)
- **Dynamic Application Counters**: Fetches `/applications` from the REST API to compute Total (12), Shortlisted (3), In Review (4), and Rejected (5).
- **Recent Applications**: Dynamically displays the latest submitted applications with live status badges.
- **Recent Saved Jobs**: Displays saved jobs fetched from `/savedJobs` with instant one-click removal.
- **Header Profile Sync**: Syncs user name and avatar initials directly from `GET /profile`.
- **Status Filter Links**: Clicking any summary card navigates to `applications.html?status=...` with that status pre-filtered.

### 2. My Applications Tracker (`applications.html`)
- **Complete CRUD Functionality**:
  - **Create (`POST`)**: "Add Application" modal sends a new application object to `/applications`.
  - **Read (`GET`)**: Loads applications from `/applications` on startup.
  - **Update (`PATCH`)**: "Edit Application" modal updates role, company, location, date, status, and notes.
  - **Delete (`DELETE`)**: Safely deletes an application with confirmation modal.
- **Live Search & Filter**: Instant search by role or company name, plus status dropdown filter.

### 3. Browse Jobs (`jobs.html`) & Discover Jobs (`discovery_jobs.html`)
- **Catalog Loading**: Fetches live listings from `/jobs`.
- **Bookmark Toggle**: Clicking the bookmark icon checks `/savedJobs`; creates a bookmark (`POST`) if not saved, or removes it (`DELETE`) if already saved.
- **Quick Apply**: Submits an application directly to `/applications` with duplicate check (prevents applying to the same job twice).
- **View Details**: Redirects to company spotlight pages (`Google.html`, `Amazon.html`, etc.) or `apply.html?jobId=...`.

### 4. Job Application Form (`apply.html`)
- **URL Parameter Binding**: Detects `?jobId=...` in the query string and loads job details dynamically via `API.getJobById(id)`.
- **Pre-filled Profile Details**: Pre-fills the applicant's name, email, phone, and university from `API.getProfile()`.
- **Form Submission (`POST`)**: Validates required fields, checks for duplicate applications via `API.getApplications()`, and creates the new application in `db.json`.

### 5. Company Spotlight Pages
- `Google.html`, `Amazon.html`, `microsoft.html`, `swiggy.html`, `zomato.html`.
- Loads `api.js` to dynamically verify job details and stipend information.
- "Apply Now" buttons carry the corresponding `jobId` parameter directly to `apply.html`.

### 6. Student Profile (`profile.html`)
- **Live Data**: Pre-fills full name, email, phone, location, headline, university, degree, and skills from `GET /profile`.
- **Edit & Save (`PATCH`)**: Form updates the profile on the server; changes immediately update the header avatar initials and welcome greetings.

### 7. Settings (`settings.html`)
- Reads and updates student communication preferences (email alerts, job recommendation digests, profile visibility) via `GET /settings` and `PATCH /settings`.

### 8. Notifications & Alerts
- Global notification bell dropdown on the header.
- Fetches notifications from `GET /notifications`.
- Clicking an individual notification or "Mark all as read" sends a `PATCH` request to update `read: true`.

---

## 💡 JavaScript Concepts & Style

All code has been written following a **beginner-to-intermediate, readable style**:

- **Modern Asynchronous Syntax**: `async/await`, `try/catch`, and `fetch()`.
- **RESTful HTTP Methods**:
  - `GET` to retrieve resources
  - `POST` with `headers: { 'Content-Type': 'application/json' }` and `JSON.stringify(body)`
  - `PATCH` for partial resource updates
  - `DELETE` for removing records
- **Standard DOM APIs**: `getElementById()`, `querySelector()`, `addEventListener()`, `innerHTML`, `textContent`.
- **Array Methods**: `filter()`, `find()`, `map()`, `some()`, `forEach()`.
- **Defensive Fallback Mechanism**: If JSON Server is temporarily unreachable, all pages fall back gracefully to `localStorage` or default data so the user interface remains responsive.

---

## 🧪 Automated Testing & Verification

The project includes an end-to-end API test suite verifying all endpoints:

```bash
# Run API integration tests
node scratch/test-api.js
```

### Verification Results:
```text
========================================================
JobPortal JSON Server - Comprehensive Integration Tests
========================================================

✅ PASS: GET /jobs returned 17 jobs
✅ PASS: GET /jobs/1 returns Google job listing
✅ PASS: GET /applications returned 12 applications
✅ PASS: POST /applications successfully created record with id #13
✅ PASS: GET /applications/13 retrieved the newly created application
✅ PASS: PATCH /applications/13 updated status to Shortlisted
✅ PASS: DELETE /applications/13 deleted the test application
✅ PASS: GET /savedJobs returned 5 saved jobs
✅ PASS: POST /savedJobs created saved job with id #6
✅ PASS: DELETE /savedJobs/6 removed the test saved job
✅ PASS: GET /profile returned student profile
✅ PASS: PATCH /profile updated profile headline successfully
✅ PASS: GET /notifications returned 4 notifications
✅ PASS: PATCH /notifications/1 successfully marked notification #1 as read
✅ PASS: GET /settings returned settings configuration
✅ PASS: PATCH /settings updated notification preferences

--------------------------------------------------------
RESULTS: 16 Passed, 0 Failed
--------------------------------------------------------
```

---

## 👥 Team Collaboration Guidelines

1. **Keep `npm run server` running**: The backend listens on port `3000`. All teammate pages interact with this same port.
2. **Use `window.API`**: Always use functions from `JavaScript/api.js` (`API.getJobs()`, `API.addApplication()`, etc.) to keep API calls clean and consistent.
3. **Preserve UI and Class Names**: Do not change existing HTML IDs or CSS classes.
4. **Inspect `db.json`**: You can view and edit `db.json` directly if you ever need to reset or customize sample data.
