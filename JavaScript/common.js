/* ==========================================================================
   JobPortal - Common JavaScript (common.js)
   Shared functionality across all portal pages:
   - localStorage data initialization & helpers
   - Responsive & Collapsible sidebar (desktop collapse + mobile drawer)
   - Notification dropdown & unread badge
   - Profile dropdown & user header synchronization
   - Logout confirmation modal
   - Reusable toast notifications
   ========================================================================== */

// --- 1. DEFAULT DATA DEFINITIONS ---

// Default sample applications (Initial count: 12 total | 3 Shortlisted | 4 In Review | 5 Rejected)
const DEFAULT_APPLICATIONS = [
  {
    id: 1,
    role: "Frontend Developer Intern",
    company: "Google",
    location: "Bengaluru, India",
    date: "20 May 2025",
    status: "Shortlisted",
    notes: "Completed initial screening interview. Technical round scheduled for next week."
  },
  {
    id: 2,
    role: "Web Developer Intern",
    company: "Microsoft",
    location: "Noida, India",
    date: "18 May 2025",
    status: "In Review",
    notes: "Application submitted and currently undergoing resume review by the hiring team."
  },
  {
    id: 3,
    role: "Software Engineer Intern",
    company: "Swiggy",
    location: "Bengaluru, India",
    date: "15 May 2025",
    status: "Shortlisted",
    notes: "Passed coding assessment on HackerRank. Awaiting interview slot confirmation."
  },
  {
    id: 4,
    role: "Frontend Developer Intern",
    company: "Amazon",
    location: "Hyderabad, India",
    date: "10 May 2025",
    status: "Rejected",
    notes: "Position closed. Thank you for your application."
  },
  {
    id: 5,
    role: "UI Developer Intern",
    company: "Zomato",
    location: "Gurugram, India",
    date: "5 May 2025",
    status: "Rejected",
    notes: "Profile did not meet required frontend project experience."
  },
  {
    id: 6,
    role: "Data Analyst Intern",
    company: "Flipkart",
    location: "Bengaluru, India",
    date: "12 May 2025",
    status: "Shortlisted",
    notes: "Case study assignment received. Due in 3 days."
  },
  {
    id: 7,
    role: "Java Developer Intern",
    company: "Adobe",
    location: "Noida, India",
    date: "8 May 2025",
    status: "In Review",
    notes: "Application forwarded to engineering department manager."
  },
  {
    id: 8,
    role: "Backend Developer Intern",
    company: "Uber",
    location: "Hyderabad, India",
    date: "4 May 2025",
    status: "In Review",
    notes: "Under review by the talent acquisition team."
  },
  {
    id: 9,
    role: "Systems Engineer Intern",
    company: "Infosys",
    location: "Pune, India",
    date: "2 May 2025",
    status: "In Review",
    notes: "Online aptitude assessment scheduled."
  },
  {
    id: 10,
    role: "Graduate Trainee",
    company: "TCS",
    location: "Mumbai, India",
    date: "28 Apr 2025",
    status: "Rejected",
    notes: "Campus recruitment quota filled for this batch."
  },
  {
    id: 11,
    role: "Project Engineer Intern",
    company: "Wipro",
    location: "Chennai, India",
    date: "25 Apr 2025",
    status: "Rejected",
    notes: "Application archived after initial screening."
  },
  {
    id: 12,
    role: "Programmer Analyst Trainee",
    company: "Cognizant",
    location: "Kolkata, India",
    date: "20 Apr 2025",
    status: "Rejected",
    notes: "Selected candidates with domain-specific certifications."
  }
];

// Default sample saved jobs
const DEFAULT_SAVED_JOBS = [
  {
    id: 1,
    role: "React Developer",
    company: "Infosys",
    location: "Pune, India",
    date: "22 May 2025",
    type: "Full-Time",
    salary: "₹25,000 - ₹35,000 / month",
    description: "Looking for an enthusiastic React Developer to build responsive user interfaces."
  },
  {
    id: 2,
    role: "Frontend Developer",
    company: "TCS",
    location: "Chennai, India",
    date: "21 May 2025",
    type: "Internship",
    salary: "₹20,000 - ₹30,000 / month",
    description: "Join our frontend engineering team to develop modern enterprise applications."
  },
  {
    id: 3,
    role: "Web Developer",
    company: "Deloitte",
    location: "Bengaluru, India",
    date: "19 May 2025",
    type: "Internship",
    salary: "₹28,000 - ₹38,000 / month",
    description: "Work with global consulting clients to deliver cutting-edge web platforms."
  },
  {
    id: 4,
    role: "UI/UX Developer",
    company: "Flipkart",
    location: "Bengaluru, India",
    date: "18 May 2025",
    type: "Full-Time",
    salary: "₹30,000 - ₹45,000 / month",
    description: "Bridge design and engineering by building pixel-perfect, accessible web interfaces."
  },
  {
    id: 5,
    role: "Software Engineer Intern",
    company: "Paytm",
    location: "Noida, India",
    date: "15 May 2025",
    type: "Internship",
    salary: "₹22,000 - ₹32,000 / month",
    description: "Contribute to payment gateway workflows, unit tests, and software feature development."
  }
];

// Default user profile
const DEFAULT_PROFILE = {
  name: "Isha Rana",
  initials: "IR",
  email: "isha.rana@example.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  headline: "Aspiring Frontend Developer & Computer Science Student",
  university: "ABC Institute of Technology",
  degree: "B.Tech in Computer Science and Engineering (2022 - 2026)",
  skills: "HTML5, CSS3, JavaScript, React, Git, Problem Solving"
};

// Default notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: "Application Shortlisted!",
    message: "Google has shortlisted your application for Frontend Developer Intern.",
    time: "2 hours ago",
    read: false
  },
  {
    id: 2,
    title: "Status Update: In Review",
    message: "Microsoft updated your Web Developer Intern application status to In Review.",
    time: "1 day ago",
    read: false
  },
  {
    id: 3,
    title: "New Job Recommendation",
    message: "New opening matching your profile: Java Developer Intern at Adobe.",
    time: "2 days ago",
    read: false
  },
  {
    id: 4,
    title: "Application Status Update",
    message: "Your application for UI Developer Intern at Zomato was not selected.",
    time: "3 days ago",
    read: true
  }
];

// Default available jobs catalog (for Browse Jobs page)
const DEFAULT_ALL_JOBS = [
  {
    id: 101,
    role: "Frontend Developer Intern",
    company: "Google",
    location: "Bengaluru, India",
    type: "Internship",
    salary: "₹30,000 - ₹45,000 / month",
    description: "Work with engineering teams on building high-performance, accessible web interfaces with modern JavaScript and HTML5."
  },
  {
    id: 102,
    role: "Java Developer Intern",
    company: "Adobe",
    location: "Noida, India",
    type: "Internship",
    salary: "₹25,000 - ₹35,000 / month",
    description: "Develop robust backend services, REST APIs, and microservices using Java and modern software engineering practices."
  },
  {
    id: 103,
    role: "Data Analyst Intern",
    company: "Flipkart",
    location: "Bengaluru, India",
    type: "Internship",
    salary: "₹22,000 - ₹32,000 / month",
    description: "Analyze customer datasets, track key business metrics, and build data visualization dashboards for product teams."
  },
  {
    id: 104,
    role: "Web Developer Intern",
    company: "Microsoft",
    location: "Noida, India",
    type: "Internship",
    salary: "₹28,000 - ₹40,000 / month",
    description: "Collaborate with cross-functional teams to build and maintain responsive web applications with rich user experiences."
  },
  {
    id: 105,
    role: "Software Engineer Intern",
    company: "Swiggy",
    location: "Bengaluru, India",
    type: "Internship",
    salary: "₹25,000 - ₹35,000 / month",
    description: "Participate in designing, testing, and implementing scalable software features across our logistics platform."
  },
  {
    id: 106,
    role: "Software Engineer Intern",
    company: "Paytm",
    location: "Noida, India",
    type: "Internship",
    salary: "₹20,000 - ₹28,000 / month",
    description: "Contribute to payment gateway workflows, unit tests, code reviews, and software feature development."
  },
  {
    id: 107,
    role: "React Developer",
    company: "Infosys",
    location: "Pune, India",
    type: "Full-Time",
    salary: "₹25,000 - ₹35,000 / month",
    description: "Looking for an enthusiastic React Developer to build responsive user interfaces and integrate client APIs."
  },
  {
    id: 108,
    role: "Frontend Developer",
    company: "TCS",
    location: "Chennai, India",
    type: "Internship",
    salary: "₹20,000 - ₹30,000 / month",
    description: "Join our frontend engineering team to develop modern enterprise applications with clean HTML, CSS and JavaScript."
  },
  {
    id: 109,
    role: "Web Developer",
    company: "Deloitte",
    location: "Bengaluru, India",
    type: "Internship",
    salary: "₹28,000 - ₹38,000 / month",
    description: "Work with global consulting clients to deliver cutting-edge web platforms and digital transformation solutions."
  },
  {
    id: 110,
    role: "UI Developer Intern",
    company: "Zomato",
    location: "Gurugram, India",
    type: "Internship",
    salary: "₹22,000 - ₹30,000 / month",
    description: "Build delightful food-delivery interfaces and mobile-first web pages focusing on animation and performance."
  },
  {
    id: 111,
    role: "Frontend Developer Intern",
    company: "Amazon",
    location: "Hyderabad, India",
    type: "Internship",
    salary: "₹30,000 - ₹45,000 / month",
    description: "Work on customer-facing shopping experiences, performance optimization, and internationalization."
  }
];


// --- 2. LOCALSTORAGE INITIALIZATION & HELPERS ---

function initDefaultData() {
  if (!localStorage.getItem("jobportal_applications")) {
    localStorage.setItem("jobportal_applications", JSON.stringify(DEFAULT_APPLICATIONS));
  }
  if (!localStorage.getItem("jobportal_saved_jobs")) {
    localStorage.setItem("jobportal_saved_jobs", JSON.stringify(DEFAULT_SAVED_JOBS));
  }
  if (!localStorage.getItem("jobportal_profile")) {
    localStorage.setItem("jobportal_profile", JSON.stringify(DEFAULT_PROFILE));
  }
  if (!localStorage.getItem("jobportal_notifications")) {
    localStorage.setItem("jobportal_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  if (!localStorage.getItem("jobportal_all_jobs")) {
    localStorage.setItem("jobportal_all_jobs", JSON.stringify(DEFAULT_ALL_JOBS));
  }
}

// Data Getter & Setter functions
function getApplications() {
  const data = localStorage.getItem("jobportal_applications");
  return data ? JSON.parse(data) : [];
}

function saveApplications(applications) {
  localStorage.setItem("jobportal_applications", JSON.stringify(applications));
}

function getSavedJobs() {
  const data = localStorage.getItem("jobportal_saved_jobs");
  return data ? JSON.parse(data) : [];
}

function saveSavedJobs(savedJobs) {
  localStorage.setItem("jobportal_saved_jobs", JSON.stringify(savedJobs));
}

function getProfile() {
  const data = localStorage.getItem("jobportal_profile");
  return data ? JSON.parse(data) : DEFAULT_PROFILE;
}

function saveProfile(profile) {
  localStorage.setItem("jobportal_profile", JSON.stringify(profile));
}

function getNotifications() {
  const data = localStorage.getItem("jobportal_notifications");
  return data ? JSON.parse(data) : [];
}

function saveNotifications(notifications) {
  localStorage.setItem("jobportal_notifications", JSON.stringify(notifications));
}

function getAllJobs() {
  const data = localStorage.getItem("jobportal_all_jobs");
  return data ? JSON.parse(data) : DEFAULT_ALL_JOBS;
}

// Return company logo path or fallback
function getCompanyLogo(company) {
  if (!company) return "../images/suitcase_logo.png";
  const name = company.toLowerCase().trim();
  if (name.includes("google")) return "../images/google.png";
  if (name.includes("microsoft")) return "../images/microsoft.png";
  if (name.includes("swiggy")) return "../images/swiggy.png";
  if (name.includes("amazon")) return "../images/amazon.png";
  if (name.includes("zomato")) return "../images/zomato.png";
  return "../images/suitcase_logo.png";
}


// --- 3. TOAST NOTIFICATION COMPONENT ---

function showToast(message, type = "info") {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  // Icon based on type
  let iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  if (type === "success") iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  if (type === "error") iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
  if (type === "warning") iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';

  toast.innerHTML = `
    <span class="toast-icon">${iconHtml}</span>
    <span class="toast-text">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);

  // Auto remove after 3.2 seconds
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3200);
}


// --- 4. MODAL DIALOG COMPONENT ---

function openModal(modalHtml) {
  // Remove any existing modal
  closeModal();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop active";
  backdrop.id = "active-modal-backdrop";

  backdrop.innerHTML = modalHtml;

  // Close when clicking outside modal box
  backdrop.addEventListener("click", function(event) {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  document.body.appendChild(backdrop);
}

function closeModal() {
  const existing = document.getElementById("active-modal-backdrop");
  if (existing) {
    existing.classList.remove("active");
    setTimeout(() => {
      if (existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }, 200);
  }
}


// --- 5. LOGOUT CONFIRMATION DIALOG ---

function showLogoutConfirmation() {
  const modalHtml = `
    <div class="modal-box confirmation-box">
      <div class="modal-header">
        <h3><i class="fa-solid fa-arrow-right-from-bracket"></i> Confirm Logout</h3>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to log out of JobPortal?</p>
        <p class="modal-subtitle">Your saved applications, jobs, and settings will remain safely stored on this browser.</p>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-danger" id="confirm-logout-btn">Log Out</button>
      </div>
    </div>
  `;

  openModal(modalHtml);

  const confirmBtn = document.getElementById("confirm-logout-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function() {
      closeModal();
      showToast("You have been logged out. In this front-end demo, your data is preserved.", "info");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    });
  }
}


// --- 6. COMMON UI INITIALIZATION (HEADER, SIDEBAR, DROPDOWNS) ---

document.addEventListener("DOMContentLoaded", function() {
  // Initialize sample data in localStorage
  initDefaultData();

  // Synchronize profile name & initials in the header
  syncHeaderProfile();

  // Setup sidebar collapse & mobile drawer
  setupSidebar();

  // Setup notification bell & dropdown
  setupNotifications();

  // Setup profile dropdown menu
  setupProfileDropdown();

  // Wire up sidebar alerts button
  setupAlertsAction();

  // Wire up logout action
  setupLogoutAction();

  // Highlight active link in sidebar
  highlightActiveNavLink();
});

// Sync profile data to header elements
function syncHeaderProfile() {
  const profile = getProfile();
  const nameEl = document.querySelector(".navbar-actions .profile .name");
  const iconEl = document.querySelector(".navbar-actions .profile .profile-icon");
  const headingWelcome = document.querySelector(".dashboard-heading p");
  const bannerWelcome = document.querySelector(".motivation-content h2");

  if (nameEl && profile.name) {
    nameEl.textContent = profile.name;
  }
  if (iconEl && profile.initials) {
    iconEl.textContent = profile.initials;
  }
  // On dashboard, update personal greetings
  if (headingWelcome && profile.name) {
    const firstName = profile.name.split(" ")[0];
    headingWelcome.textContent = `Welcome back, ${firstName}! Here's your application overview.`;
  }
  if (bannerWelcome && profile.name) {
    const firstName = profile.name.split(" ")[0];
    bannerWelcome.textContent = `Keep Going, ${firstName}!`;
  }
}

// Setup sidebar toggle (desktop collapsed mode & mobile drawer)
function setupSidebar() {
  const menuBtn = document.querySelector(".menu-btn");
  const sidebar = document.querySelector(".sidebar");

  if (!menuBtn || !sidebar) return;

  // Create overlay for mobile drawer if it doesn't exist
  let overlay = document.querySelector(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);
  }

  // Restore desktop collapsed state if previously saved
  const isCollapsed = localStorage.getItem("jobportal_sidebar_collapsed") === "true";
  if (window.innerWidth > 850 && isCollapsed) {
    document.body.classList.add("sidebar-collapsed");
  }

  // Add titles (tooltips) to sidebar action links for collapsed state
  const sidebarLinks = document.querySelectorAll(".sidebar-action");
  sidebarLinks.forEach(link => {
    const nameSpan = link.querySelector(".action-name");
    if (nameSpan && !link.hasAttribute("title")) {
      link.setAttribute("title", nameSpan.textContent.trim());
    }
  });

  // Hamburger button click
  menuBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    if (window.innerWidth > 850) {
      // Desktop: collapse / expand
      const collapsed = document.body.classList.toggle("sidebar-collapsed");
      localStorage.setItem("jobportal_sidebar_collapsed", collapsed);
    } else {
      // Mobile & tablet: open / close drawer
      document.body.classList.toggle("sidebar-open");
    }
  });

  // Clicking overlay closes mobile drawer
  overlay.addEventListener("click", function() {
    document.body.classList.remove("sidebar-open");
  });

  // Close mobile drawer when a nav link is clicked
  sidebarLinks.forEach(link => {
    link.addEventListener("click", function() {
      if (window.innerWidth <= 850) {
        document.body.classList.remove("sidebar-open");
      }
    });
  });

  // Handle window resizing
  window.addEventListener("resize", function() {
    if (window.innerWidth > 850) {
      document.body.classList.remove("sidebar-open");
    }
  });
}

// Setup Notification Dropdown
function setupNotifications() {
  const notifContainer = document.querySelector(".notification");
  if (!notifContainer) return;

  const notifBtn = notifContainer.querySelector(".notification-btn");
  const notifDot = notifContainer.querySelector(".notification-dot");

  // Create notification dropdown element if not present
  let dropdown = notifContainer.querySelector(".notification-dropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.className = "notification-dropdown";
    notifContainer.appendChild(dropdown);
  }

  // Function to render notifications
  function renderNotifications() {
    const notifications = getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    // Show/hide red dot
    if (notifDot) {
      if (unreadCount > 0) {
        notifDot.style.display = "block";
      } else {
        notifDot.style.display = "none";
      }
    }

    let itemsHtml = "";
    if (notifications.length === 0) {
      itemsHtml = `<div class="notification-empty">No notifications yet</div>`;
    } else {
      itemsHtml = notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
          <div class="notif-indicator"></div>
          <div class="notif-content">
            <h4>${notif.title}</h4>
            <p>${notif.message}</p>
            <span class="notif-time">${notif.time}</span>
          </div>
        </div>
      `).join("");
    }

    dropdown.innerHTML = `
      <div class="dropdown-header">
        <h3>Notifications <span class="badge">${unreadCount}</span></h3>
        ${unreadCount > 0 ? '<button type="button" class="mark-all-btn" id="mark-all-read">Mark all as read</button>' : ''}
      </div>
      <div class="notification-list">
        ${itemsHtml}
      </div>
    `;

    // Wire up "Mark all as read"
    const markAllBtn = dropdown.querySelector("#mark-all-read");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        const notifs = getNotifications();
        notifs.forEach(n => n.read = true);
        saveNotifications(notifs);
        renderNotifications();
        showToast("All notifications marked as read", "success");
      });
    }

    // Wire up clicking individual notification
    const itemEls = dropdown.querySelectorAll(".notification-item.unread");
    itemEls.forEach(el => {
      el.addEventListener("click", function() {
        const id = parseInt(this.getAttribute("data-id"));
        const notifs = getNotifications();
        const target = notifs.find(n => n.id === id);
        if (target) {
          target.read = true;
          saveNotifications(notifs);
          renderNotifications();
        }
      });
    });
  }

  // Initial render of notifications
  renderNotifications();

  // Toggle dropdown on bell button click
  if (notifBtn) {
    notifBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      // Close profile dropdown if open
      const profileDropdown = document.querySelector(".profile-dropdown");
      if (profileDropdown) profileDropdown.classList.remove("show");

      dropdown.classList.toggle("show");
    });
  }

  // Close dropdown on outside click
  document.addEventListener("click", function(e) {
    if (!notifContainer.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

// Setup Profile Dropdown
function setupProfileDropdown() {
  const profileContainer = document.querySelector(".navbar-actions .profile");
  if (!profileContainer) return;

  // Make cursor pointer
  profileContainer.style.cursor = "pointer";

  let dropdown = document.querySelector(".profile-dropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.className = "profile-dropdown";
    profileContainer.parentNode.appendChild(dropdown);
  }

  function renderProfileMenu() {
    const profile = getProfile();
    dropdown.innerHTML = `
      <div class="profile-dropdown-header">
        <div class="profile-dropdown-avatar">${profile.initials || 'IR'}</div>
        <div class="profile-dropdown-user">
          <div class="profile-dropdown-name">${profile.name}</div>
          <div class="profile-dropdown-email">${profile.email}</div>
        </div>
      </div>
      <div class="profile-dropdown-links">
        <a href="profile.html" class="profile-dropdown-item">
          <i class="fa-regular fa-user"></i>
          <span>View Profile</span>
        </a>
        <a href="profile.html#edit" class="profile-dropdown-item">
          <i class="fa-solid fa-user-pen"></i>
          <span>Edit Profile</span>
        </a>
        <a href="settings.html" class="profile-dropdown-item">
          <i class="fa-solid fa-gear"></i>
          <span>Settings</span>
        </a>
        <div class="dropdown-divider"></div>
        <button type="button" class="profile-dropdown-item logout-item" id="dropdown-logout-btn">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    `;

    const logoutBtn = dropdown.querySelector("#dropdown-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        dropdown.classList.remove("show");
        showLogoutConfirmation();
      });
    }
  }

  renderProfileMenu();

  profileContainer.addEventListener("click", function(e) {
    e.stopPropagation();
    // Close notification dropdown if open
    const notifDropdown = document.querySelector(".notification-dropdown");
    if (notifDropdown) notifDropdown.classList.remove("show");

    renderProfileMenu();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", function(e) {
    if (!profileContainer.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

// Setup sidebar Alerts action
function setupAlertsAction() {
  const alertsLinks = document.querySelectorAll(".sidebar-action");
  alertsLinks.forEach(link => {
    const text = link.querySelector(".action-name");
    if (text && text.textContent.trim().toLowerCase() === "alerts") {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        const notifBtn = document.querySelector(".notification-btn");
        if (notifBtn) {
          notifBtn.click();
        }
      });
    }
  });
}

// Setup sidebar Logout action
function setupLogoutAction() {
  const links = document.querySelectorAll(".sidebar-action");
  links.forEach(link => {
    const text = link.querySelector(".action-name");
    if (text && text.textContent.trim().toLowerCase() === "logout") {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        showLogoutConfirmation();
      });
    }
  });
}

// Highlight the active navigation link based on current page filename
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.toLowerCase();
  const sidebarLinks = document.querySelectorAll(".sidebar-action");

  sidebarLinks.forEach(link => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (!href) return;

    const lowerHref = href.toLowerCase();
    if (
      (currentPath.endsWith("dashboard.html") || currentPath.endsWith("/") || currentPath === "") &&
      (lowerHref.includes("dashboard.html") || lowerHref === "#")
    ) {
      if (link.querySelector(".action-name") && link.querySelector(".action-name").textContent.trim() === "Dashboard") {
        link.classList.add("active");
      }
    } else if (currentPath.includes("applications.html") && lowerHref.includes("applications.html")) {
      link.classList.add("active");
    } else if (currentPath.includes("saved-jobs.html") && lowerHref.includes("saved-jobs.html")) {
      link.classList.add("active");
    } else if (currentPath.includes("jobs.html") && lowerHref.includes("jobs.html")) {
      link.classList.add("active");
    } else if (currentPath.includes("profile.html") && lowerHref.includes("profile.html")) {
      link.classList.add("active");
    } else if (currentPath.includes("settings.html") && lowerHref.includes("settings.html")) {
      link.classList.add("active");
    }
  });
}

