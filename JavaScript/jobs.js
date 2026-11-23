/* ==========================================================================
   JobPortal - Browse Jobs JavaScript (jobs.js)
   Handles:
   - Dynamic rendering of available job opportunities
   - Search by role, company, location, or keyword
   - Filter by Job Type (Internship vs Full-Time)
   - Save / Unsave bookmark toggle synced with localStorage
   - Apply Now flow with duplicate application protection
   - Instant count badge update
   ========================================================================== */

let currentJobsSearch = "";
let currentTypeFilter = "all";

document.addEventListener("DOMContentLoaded", function() {
  // Setup search input
  setupJobsSearch();

  // Setup type filter
  setupTypeFilter();

  // Render jobs grid
  renderJobsGrid();
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

// Render the grid of available jobs
function renderJobsGrid() {
  const container = document.getElementById("jobs-grid");
  const countBadge = document.getElementById("jobs-count-badge");
  if (!container) return;

  const allJobs = getAllJobs();
  const savedJobs = getSavedJobs();
  const applications = getApplications();

  // Filter jobs
  let filtered = allJobs;

  if (currentTypeFilter && currentTypeFilter !== "all") {
    filtered = filtered.filter(j => j.type === currentTypeFilter);
  }

  if (currentJobsSearch) {
    filtered = filtered.filter(j => {
      const roleMatch = j.role.toLowerCase().includes(currentJobsSearch);
      const companyMatch = j.company.toLowerCase().includes(currentJobsSearch);
      const locMatch = j.location && j.location.toLowerCase().includes(currentJobsSearch);
      const descMatch = j.description && j.description.toLowerCase().includes(currentJobsSearch);
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
    const logoSrc = getCompanyLogo(job.company);

    // Check if bookmarked
    const isBookmarked = savedJobs.some(
      s => s.role.toLowerCase() === job.role.toLowerCase() && s.company.toLowerCase() === job.company.toLowerCase()
    );

    // Check if applied
    const alreadyApplied = applications.some(
      a => a.role.toLowerCase() === job.role.toLowerCase() && a.company.toLowerCase() === job.company.toLowerCase()
    );

    return `
      <div class="job-listing-card" data-id="${job.id}">
        <div class="job-listing-header">
          <div class="job-listing-logo">
            <img src="${logoSrc}" alt="${job.company} logo" />
          </div>
          <div class="job-listing-details">
            <h3>${job.role}</h3>
            <p>${job.company} <span>•</span> ${job.location}</p>
          </div>
        </div>

        <div class="job-listing-meta">
          <span class="badge-job-type"><i class="fa-solid fa-briefcase"></i> ${job.type}</span>
          <span class="badge-salary"><i class="fa-solid fa-indian-rupee-sign"></i> ${job.salary}</span>
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
    btn.addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      toggleJobBookmark(id);
    });
  });

  // Wire up apply buttons
  const applyBtns = container.querySelectorAll(".apply-now-btn");
  applyBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      openJobApplyModal(id);
    });
  });
}

// Toggle Bookmark
function toggleJobBookmark(jobId) {
  const allJobs = getAllJobs();
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  let savedJobs = getSavedJobs();
  const existingIndex = savedJobs.findIndex(
    s => s.role.toLowerCase() === job.role.toLowerCase() && s.company.toLowerCase() === job.company.toLowerCase()
  );

  // Today's formatted date
  const today = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  if (existingIndex !== -1) {
    // Remove bookmark
    savedJobs.splice(existingIndex, 1);
    saveSavedJobs(savedJobs);
    showToast(`Removed ${job.role} at ${job.company} from Saved Jobs`, "info");
  } else {
    // Add bookmark
    const newSaved = {
      id: Date.now(),
      role: job.role,
      company: job.company,
      location: job.location,
      date: formattedToday,
      type: job.type,
      salary: job.salary,
      description: job.description
    };
    savedJobs.unshift(newSaved);
    saveSavedJobs(savedJobs);
    showToast(`Saved ${job.role} at ${job.company} to Bookmarks!`, "success");
  }

  renderJobsGrid();
}

// Open Apply Flow Modal
function openJobApplyModal(jobId) {
  const allJobs = getAllJobs();
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  const profile = getProfile();
  const logoSrc = getCompanyLogo(job.company);

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
              <h4 style="font-size: 15px; font-weight: bold; color: #111827; margin-bottom: 2px;">${job.role}</h4>
              <p style="font-size: 13px; color: #64748b;">${job.company} • ${job.location}</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-name">Full Name *</label>
            <input type="text" id="apply-name" class="form-input" value="${profile.name}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-email">Email Address *</label>
            <input type="email" id="apply-email" class="form-input" value="${profile.email}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-phone">Phone Number *</label>
            <input type="text" id="apply-phone" class="form-input" value="${profile.phone}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="apply-note">Why are you a good fit? (Optional)</label>
            <textarea id="apply-note" class="form-textarea" placeholder="Highlight key skills or relevant projects..."></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Submit Application</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml);

  const form = document.getElementById("browse-apply-form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const applications = getApplications();

      // Check duplicate
      const alreadyApplied = applications.some(
        app => app.role.toLowerCase() === job.role.toLowerCase() && app.company.toLowerCase() === job.company.toLowerCase()
      );

      if (alreadyApplied) {
        showToast("You have already applied for this job.", "warning");
        closeModal();
        return;
      }

      const note = document.getElementById("apply-note").value.trim();

      // Create new application
      const newApp = {
        id: Date.now(),
        role: job.role,
        company: job.company,
        location: job.location,
        date: formattedToday,
        status: "In Review",
        notes: note || "Application submitted via Browse Jobs. In review by hiring team."
      };

      applications.unshift(newApp);
      saveApplications(applications);

      closeModal();
      renderJobsGrid();

      showToast(`Application for ${job.role} at ${job.company} submitted successfully!`, "success");
    });
  }
}

