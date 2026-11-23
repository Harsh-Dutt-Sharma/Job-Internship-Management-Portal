# JobPortal – Job & Internship Management Portal

A responsive, interactive frontend web application built using **HTML5, CSS3, and beginner-to-intermediate Vanilla JavaScript**.

Designed as a college project to simulate a modern career portal for students and job seekers to discover opportunities, track applications, bookmark listings, and manage profile information with real-time UI synchronization and browser-based `localStorage` persistence.

---

## 📁 Project Structure

```text
Job-Internship-Management-Portal/
│
├── CSS/
│   ├── dashboard.css       # Core layout, sidebar, header, modals, toasts, responsive styles
│   ├── applications.css    # Styles for My Applications page & metrics
│   ├── saved-jobs.css      # Styles for Saved Jobs grid & bookmark cards
│   ├── jobs.css            # Styles for Browse Jobs listings & search controls
│   ├── profile.css         # Styles for User Profile overview & edit form
│   ├── settings.css        # Styles for Notification & Display preferences
│   └── help.css            # Styles for FAQ accordion & Support inquiry form
│
├── HTML/
│   ├── dashboard.html      # Main dashboard with summary metrics & recent items
│   ├── applications.html   # Full applications tracker with CRUD operations & filters
│   ├── saved-jobs.html     # Bookmarked opportunities page with Quick Apply
│   ├── jobs.html           # Browse jobs catalog with search, filter & apply flow
│   ├── profile.html        # Student profile page with editable fields
│   ├── settings.html       # Portal & notification settings page
│   └── help.html           # FAQ accordion & contact support page
│
├── JavaScript/
│   ├── common.js           # Shared utilities: localStorage, sidebar, notifications, profile sync, toasts, modals
│   ├── dashboard.js        # Dashboard counts, interactive summary cards, recent listings
│   ├── applications.js     # Search, status filter, Add/Edit/Delete modals, count calculations
│   ├── saved-jobs.js       # Bookmarks display, removal, search, and apply flow
│   ├── jobs.js             # Job catalog search, job type filter, bookmark toggle, quick apply
│   ├── profile.js          # Profile view and edit form handling with name sync
│   ├── settings.js         # Settings & notification preference toggles
│   └── help.js             # FAQ accordion expansion & support form validation
│
├── images/                 # Project icons and company logos
└── README.md               # Complete project documentation
```

---

## ✨ Features Implemented

### 1. Responsive & Collapsible Sidebar
- **Desktop Mode**: Clicking the hamburger icon collapses the sidebar into icon-only mode (75px width). Navigation labels hide, and tooltips appear on hover. Clicking again smoothly restores the full sidebar.
- **Mobile & Tablet Drawer**: On screens ≤ 850px, the sidebar turns into a slide-in navigation drawer. Tapping outside the drawer on the backdrop overlay closes it automatically.

### 2. My Applications Management (CRUD)
- **Live Metric Counts**: Dynamic counters for Total Applications, Shortlisted, In Review, and Rejected. Clicking any metric card instantly filters the list.
- **Instant Search**: Search applications in real-time by role, company name, or location.
- **Status Filter**: Filter by All, Shortlisted, In Review, or Rejected.
- **Add Application**: Modal form with input validation (Role, Company, Location, Date, Status, Notes). Newly added applications immediately appear at the top and update counts.
- **Edit Application**: Pre-filled modal to update role, company, location, date, status, or progress notes.
- **Delete Application**: Confirmation dialog to safely delete applications with instant list update.
- **View Details**: Modal displaying full application metadata, ID (#JP-0001), and notes.

### 3. Saved Jobs & Bookmarks
- **Bookmark Synchronization**: Saved jobs update across Dashboard, Browse Jobs, and Saved Jobs.
- **Remove Bookmark**: One-click bookmark removal with instant feedback toast.
- **Quick Apply**: Apply directly to saved positions; automatically transfers the role to My Applications under "In Review".
- **Duplicate Prevention**: Prevents applying more than once to the same job opening.
- **Empty State**: Friendly illustration and direct link to "Browse Jobs" when no jobs are saved.

### 4. Interactive Dashboard Summary Cards
- All four summary cards (**Total Applications**, **Shortlisted**, **In Review**, **Rejected**) reflect live localStorage counts.
- Clicking any card redirects to `applications.html` with that status filter pre-selected via URL parameter (e.g. `applications.html?status=Shortlisted`).

### 5. Browse Jobs & Internships
- Catalog of tech internships and full-time roles (Google, Microsoft, Swiggy, Amazon, Adobe, Flipkart, etc.).
- Search by keywords, company, or location.
- Filter by Job Type (Internship vs Full-Time).
- Toggle Bookmark to save/unsave from any page.
- Apply Now modal with pre-filled candidate details and custom cover note.

### 6. Notifications & Alerts
- Notification bell dropdown in the header with unread count indicator.
- Red notification dot appears when there are unread alerts.
- Individual notification click marks as read; "Mark all as read" button updates all alerts.
- Clicking "Alerts" in the sidebar opens the notification panel.

### 7. Profile & Header Synchronization
- View and update Full Name, Email, Phone, Location, Headline, and Skills.
- Updating your profile immediately synchronizes the header greeting ("Welcome back, Isha!") and header profile avatar initials ("IR") across all pages.

### 8. Settings & Help Center
- **Settings**: Toggle notification preferences (status updates, recommendations, email digest) and configure display layout.
- **Help Center**: Interactive FAQ accordion with expand/collapse animation, guide cards, and a contact form with input validation and simulated submission confirmation.

### 9. Logout Confirmation
- Clicking Logout in the sidebar or profile menu opens a confirmation dialog.

---

## 💡 Important JavaScript Concepts Used

The code has been crafted in **clean, human-readable, beginner-to-intermediate JavaScript**:

1. **DOM Selection**: `document.getElementById()`, `document.querySelector()`, `document.querySelectorAll()`
2. **DOM Manipulation**: `element.innerHTML`, `element.textContent`, `element.appendChild()`, `element.closest()`
3. **Class Manipulation**: `classList.add()`, `classList.remove()`, `classList.toggle()`, `classList.contains()`
4. **Event Handling**: `addEventListener("click")`, `addEventListener("input")`, `addEventListener("submit")`, `addEventListener("change")`
5. **Array Methods**:
   - `push()` and `unshift()` for adding new applications and bookmarks
   - `filter()` for search matching, status filtering, and deletions
   - `find()` and `findIndex()` for locating specific items by ID
   - `splice()` for removing items
   - `map()` for dynamically generating HTML templates
   - `slice()` for showing top 5 recent entries on the dashboard
6. **Data Storage with `localStorage`**:
   - `JSON.stringify()` to serialize arrays and objects
   - `JSON.parse()` to deserialize saved data
   - Initialized with default sample data only on first visit (never overwrites existing user edits)
7. **Form Handling & Validation**:
   - `event.preventDefault()` to prevent default page reloads
   - Input trimming (`.trim()`) and required field checks
   - Regular expression validation for email addresses (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
8. **URL Parameters**:
   - `new URLSearchParams(window.location.search)` to pass selected filter state from Dashboard to My Applications

---

## 🚀 How to Run the Project

### Option A: Using VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Open the project folder: `Job-Internship-Management-Portal`.
3. If not already installed, install the **Live Server** extension by Ritwick Dey from the VS Code Extensions tab (`Ctrl+Shift+X`).
4. In the Explorer pane, expand `HTML/` and right-click `dashboard.html`.
5. Select **"Open with Live Server"** (or click "Go Live" in the bottom-right status bar).
6. Your browser will open the portal at `http://127.0.0.1:5500/HTML/dashboard.html`.

### Option B: Using Any Local Web Server
You can also run using Python or Node.js from the project root:

**Using Python 3:**
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000/HTML/dashboard.html`

**Using Node.js (`npx serve`):**
```bash
npx serve .
```

---

## 📋 Testing & Verification Summary

All test suites passed with **0 errors**:
- ✅ JS Syntax validation passed on all 8 script files (`common.js`, `dashboard.js`, `applications.js`, `saved-jobs.js`, `jobs.js`, `profile.js`, `settings.js`, `help.js`).
- ✅ Asset & link checks passed on all 7 HTML pages (no broken images, stylesheets, scripts, or internal links).
- ✅ Desktop sidebar collapse and mobile drawer toggle verified.
- ✅ LocalStorage data persistence verified across all CRUD operations.
- ✅ Application counts strictly match initial dashboard figures (12 Total: 3 Shortlisted, 4 In Review, 5 Rejected).
