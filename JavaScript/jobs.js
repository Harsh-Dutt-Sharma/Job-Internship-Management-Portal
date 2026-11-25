/* ==========================================================================
   JobPortal - Browse Jobs JavaScript (jobs.js)
   Handles:
   - Dynamic rendering of available job opportunities from JSON Server API
   - Search by role, company, location, or keyword
   - Filter by Job Type (Internship vs Full-Time)
   - Save / Unsave bookmark toggle synced with REST API (http://localhost:3000/savedJobs)
   - Apply Now flow with duplicate application protection synced with API
   - Instant count badge update
   ========================================================================== */

let currentJobsSearch = "";
let currentTypeFilter = "all";

document.addEventListener("DOMContentLoaded", async function() {
  // Setup search input
  setupJobsSearch();

  // Setup type filter
  setupTypeFilter();

  // Render jobs grid from API
  await renderJobsGrid();
});

// Setup search bar
function setupJobsSearch() {
  const searchInput = document.getElementById("jobs-search-input");
  const clearBtn = document.getElementById("clear-jobs-search");

  if (!searchInput) return;

  searchInput.addEventListener("input", function(e) {
    currentJobsSearch = e.target.value.trim().toLowerCase();
    if (clearBtn) {
      clearBtn.style.display = currentJobsSearch.length > 0 ? "block" : "none";
    }
    renderJobsGrid();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      searchInput.value = "";
      currentJobsSearch = "";
      clearBtn.style.display = "none";
      renderJobsGrid();
    });
  }
}

// Setup type filter dropdown
function setupTypeFilter() {
  const select = document.getElementById("type-filter");
  if (!select) return;

  select.addEventListener("change", function(e) {
    currentTypeFilter = e.target.value;
    renderJobsGrid();
  });
}

// Render the grid of available jobs from API
async function renderJobsGrid() {
  const container = document.getElementById("jobs-grid");
  const countBadge = document.getElementById("jobs-count-badge");
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
      <p style="margin-top: 10px;">Loading opportunities from server...</p>
    </div>
  `;

  let allJobs = [];
  let savedJobs = [];
  let applications = [];

  try {
    if (window.API) {
      [allJobs, savedJobs, applications] = await Promise.all([
        API.getJobs(),
        API.getSavedJobs(),
        API.getApplications()
      ]);
    } else {
      allJobs = getAllJobs();
      savedJobs = getSavedJobs();
      applications = getApplications();
    }
  } catch (err) {
    console.error("Error loading jobs data:", err);
    allJobs = getAllJobs();
    savedJobs = getSavedJobs();
    applications = getApplications();
  }

  // Filter jobs
  let filtered = allJobs;

  if (currentTypeFilter && currentTypeFilter !== "all") {
    filtered = filtered.filter(j => j.type === currentTypeFilter);
  }

  if (currentJobsSearch) {
    filtered = filtered.filter(j => {
      const roleMatch = (j.role || j.title || "").toLowerCase().includes(currentJobsSearch);
      const companyMatch = (j.company || "").toLowerCase().includes(currentJobsSearch);
      const locMatch = (j.location || "").toLowerCase().includes(currentJobsSearch);
      const descMatch = (j.description || "").toLowerCase().includes(currentJobsSearch);
      return roleMatch || companyMatch || locMatch || descMatch;
    });
  }

  // Update badge count
  if (countBadge) {
    countBadge.textContent = `${filtered.length} Opportunities Available`;
  }

  // Empty state check
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="app-empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-magnifying-glass"></i>
        <h3>No Matching Jobs Found</h3>
        <p>No job listings match your current keywords or filters.</p>
        <button type="button" class="btn btn-secondary" id="reset-jobs-filters">
          Reset Search
        </button>
      </div>
    `;

    const resetBtn = container.querySelector("#reset-jobs-filters");
    if (resetBtn) {
      resetBtn.addEventListener("click", function() {
        const input = document.getElementById("jobs-search-input");
        const clearBtn = document.getElementById("clear-jobs-search");
        const select = document.getElementById("type-filter");
        if (input) input.value = "";
        if (clearBtn) clearBtn.style.display = "none";
        if (select) select.value = "all";
        currentJobsSearch = "";
        currentTypeFilter = "all";
        renderJobsGrid();
      });
    }
    return;
  }

  // Render cards
  container.innerHTML = filtered.map(job => {
    const roleTitle = job.role || job.title;
    const logoSrc = job.logo || getCompanyLogo(job.company);

    // Check if bookmarked
    const isBookmarked = savedJobs.some(
      s => (s.jobId == job.id) || (s.role && s.role.toLowerCase() === roleTitle.toLowerCase() && s.company.toLowerCase() === job.company.toLowerCase())
    );

    // Check if applied
    const alreadyApplied = applications.some(
      a => (a.jobId == job.id) || (a.role && a.role.toLowerCase() === roleTitle.toLowerCase() && a.company.toLowerCase() === job.company.toLowerCase())
    );

    return `
      <div class="job-listing-card" data-id="${job.id}">
        <div class="job-listing-header">
          <div class="job-listing-logo">
            <img src="${logoSrc}" alt="${job.company} logo" />
          </div>
          <div class="job-listing-details">
            <h3>${roleTitle}</h3>
            <p>${job.company} <span>•</span> ${job.location}</p>
          </div>
        </div>

        <div class="job-listing-meta">
          <span class="badge-job-type"><i class="fa-solid fa-briefcase"></i> ${job.type}</span>
          <span class="badge-salary"><i class="fa-solid fa-indian-rupee-sign"></i> ${job.salary || job.stipend || 'Competitive'}</span>
        </div>

        <p class="job-listing-desc">${job.description}</p>

        <div class="job-listing-footer">
          <button type="button" class="btn-bookmark-action ${isBookmarked ? 'saved' : ''}" data-id="${job.id}">
            <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
            <span>${isBookmarked ? 'Saved' : 'Save Job'}</span>
          </button>

          ${alreadyApplied
            ? '<button type="button" class="btn btn-secondary" disabled style="opacity: 0.75; cursor: not-allowed;"><i class="fa-solid fa-check"></i> Applied</button>'
            : `<button type="button" class="btn btn-primary apply-now-btn" data-id="${job.id}"><i class="fa-solid fa-paper-plane"></i> Apply Now</button>`
          }
        </div>
      </div>
    `;
  }).join("");

  // Wire up bookmark buttons
  const bookmarkBtns = container.querySelectorAll(".btn-bookmark-action");
  bookmarkBtns.forEach(btn => {
    btn.addEventListener("click", async function() {
      const id = this.getAttribute("data-id");
      await toggleJobBookmark(id);
    });
  });

  // Wire up apply buttons
  const applyBtns = container.querySelectorAll(".apply-now-btn");
  applyBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const id = this.getAttribute("data-id");
      openJobApplyModal(id);
    });
  });
}

// Toggle Bookmark via API
async function toggleJobBookmark(jobId) {
  let allJobs = [];
  let savedJobs = [];

  try {
    if (window.API) {
      allJobs = await API.getJobs();
      savedJobs = await API.getSavedJobs();
    } else {
      allJobs = getAllJobs();
      savedJobs = getSavedJobs();
    }
  } catch (err) {
    console.error(err);
    return;
  }

  const job = allJobs.find(j => j.id == jobId);
  if (!job) return;

  const roleTitle = job.role || job.title;
  const existingSaved = savedJobs.find(
    s => (s.jobId == job.id) || (s.role && s.role.toLowerCase() === roleTitle.toLowerCase() && s.company.toLowerCase() === job.company.toLowerCase())
  );

  const today = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  if (existingSaved) {
    // Remove bookmark
    try {
      if (window.API && typeof API.removeSavedJob === "function") {
        await API.removeSavedJob(existingSaved.id);
      } else {
        savedJobs = savedJobs.filter(s => s.id !== existingSaved.id);
        saveSavedJobs(savedJobs);
      }
      showToast(`Removed ${roleTitle} at ${job.company} from Saved Jobs`, "info");
    } catch (err) {
      console.error("Error removing bookmark:", err);
      showToast("Could not remove bookmark.", "error");
    }
  } else {
    // Add bookmark
    const newSaved = {
      jobId: job.id,
      userId: 1,
      role: roleTitle,
      company: job.company,
      location: job.location,
      date: formattedToday,
      type: job.type,
      salary: job.salary || job.stipend,
      description: job.description
    };

    try {
      if (window.API && typeof API.saveJob === "function") {
        await API.saveJob(newSaved);
      } else {
        newSaved.id = Date.now();
        savedJobs.unshift(newSaved);
        saveSavedJobs(savedJobs);
      }
      showToast(`Saved ${roleTitle} at ${job.company} to Bookmarks!`, "success");
    } catch (err) {
      console.error("Error saving bookmark:", err);
      showToast("Could not save bookmark.", "error");
    }
  }

  await renderJobsGrid();
}

// Open Apply Flow Modal with API POST
async function openJobApplyModal(jobId) {
  let allJobs = [];
  try {
    allJobs = window.API ? await API.getJobs() : getAllJobs();
  } catch (err) {
    allJobs = getAllJobs();
  }

  const job = allJobs.find(j => j.id == jobId);
  if (!job) return;

  const roleTitle = job.role || job.title;
  let profile = { name: "Isha Rana", email: "isha.rana@example.com", phone: "+91 98765 43210" };
  try {
    if (window.API) {
      const p = await API.getProfile();
      if (p && p.name) profile = p;
    } else {
      profile = getProfile();
    }
  } catch (err) {
    console.warn(err);
  }

  const logoSrc = job.logo || getCompanyLogo(job.company);

  const today = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  const modalHtml = `
    <div class="modal-box">
      <div class="modal-header">
        <h3><i class="fa-solid fa-paper-plane"></i> Quick Apply</h3>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <form id="browse-apply-form">
        <div class="modal-body">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #e5e7eb;">
            <div style="width: 48px; height: 48px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <img src="${logoSrc}" alt="${job.company} logo" style="max-width: 38px; max-height: 38px; object-fit: contain;" />
            </div>
            <div>
              <h4 style="font-size: 15px; font-weight: bold; color: #111827; margin-bottom: 2px;">${roleTitle}</h4>
              <p style="font-size: 13px; color: #64748b;">${job.company} • ${job.location}</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-name">Full Name *</label>
            <input type="text" id="apply-name" class="form-input" value="${profile.name || ''}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-email">Email Address *</label>
            <input type="email" id="apply-email" class="form-input" value="${profile.email || ''}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-phone">Phone Number *</label>
            <input type="text" id="apply-phone" class="form-input" value="${profile.phone || ''}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-note">Cover Note (Optional)</label>
            <textarea id="apply-note" class="form-textarea" placeholder="Highlight key skills or relevant projects..."></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-quick-apply"><i class="fa-solid fa-paper-plane"></i> Submit Application</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml);

  const form = document.getElementById("browse-apply-form");
  if (form) {
    form.addEventListener("submit", async function(e) {
      e.preventDefault();

      let applications = [];
      try {
        applications = window.API ? await API.getApplications() : getApplications();
      } catch (err) {
        applications = getApplications();
      }

      // Check duplicate
      const alreadyApplied = applications.some(
        app => (app.jobId == job.id) || (app.role && app.role.toLowerCase() === roleTitle.toLowerCase() && app.company.toLowerCase() === job.company.toLowerCase())
      );

      if (alreadyApplied) {
        showToast("You have already applied for this job.", "warning");
        closeModal();
        return;
      }

      const note = document.getElementById("apply-note").value.trim();
      const submitBtn = document.getElementById("btn-submit-quick-apply");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
      }

      // Create new application
      const newApp = {
        jobId: job.id,
        userId: 1,
        role: roleTitle,
        company: job.company,
        location: job.location,
        date: formattedToday,
        status: "In Review",
        notes: note || "Application submitted via Browse Jobs. In review by hiring team."
      };

      try {
        if (window.API && typeof API.addApplication === "function") {
          await API.addApplication(newApp);
        } else {
          newApp.id = Date.now();
          applications.unshift(newApp);
          saveApplications(applications);
        }

        closeModal();
        showToast(`Application for ${roleTitle} at ${job.company} submitted successfully!`, "success");
        await renderJobsGrid();
      } catch (error) {
        console.error("Error submitting application:", error);
        showToast("Failed to submit application. Please try again.", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Application';
        }
      }
    });
  }
}
