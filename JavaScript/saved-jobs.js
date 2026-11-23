/* ==========================================================================
   JobPortal - Saved Jobs JavaScript (saved-jobs.js)
   Handles:
   - Dynamic rendering of all saved jobs from localStorage
   - Search saved jobs by role, company, or location
   - Remove bookmark functionality with instant UI update
   - Apply Now flow: opens modal, adds to My Applications, prevents duplicate
   - Dynamic count update
   - Empty state rendering with Browse Jobs link
   ========================================================================== */

let currentSavedSearch = "";

document.addEventListener("DOMContentLoaded", function() {
  // Update badge count
  updateSavedCount();

  // Setup search input
  setupSavedSearch();

  // Render list
  renderSavedJobsGrid();
});

// Update the count badge
function updateSavedCount() {
  const savedJobs = getSavedJobs();
  const badge = document.getElementById("saved-count-badge");
  if (badge) {
    badge.textContent = `${savedJobs.length} saved`;
  }
}

// Setup search bar
function setupSavedSearch() {
  const input = document.getElementById("saved-search-input");
  const clearBtn = document.getElementById("clear-saved-search");

  if (!input) return;

  input.addEventListener("input", function(e) {
    currentSavedSearch = e.target.value.trim().toLowerCase();
    if (clearBtn) {
      clearBtn.style.display = currentSavedSearch.length > 0 ? "block" : "none";
    }
    renderSavedJobsGrid();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      input.value = "";
      currentSavedSearch = "";
      clearBtn.style.display = "none";
      renderSavedJobsGrid();
    });
  }
}

// Render the grid of saved jobs
function renderSavedJobsGrid() {
  const container = document.getElementById("saved-jobs-list");
  if (!container) return;

  let savedJobs = getSavedJobs();
  const applications = getApplications();

  // Filter by search query
  if (currentSavedSearch) {
    savedJobs = savedJobs.filter(job => {
      const roleMatch = job.role.toLowerCase().includes(currentSavedSearch);
      const companyMatch = job.company.toLowerCase().includes(currentSavedSearch);
      const locMatch = job.location && job.location.toLowerCase().includes(currentSavedSearch);
      return roleMatch || companyMatch || locMatch;
    });
  }

  // Empty state
  if (savedJobs.length === 0) {
    container.innerHTML = `
      <div class="app-empty-state" style="grid-column: 1 / -1;">
        <i class="fa-regular fa-bookmark"></i>
        <h3>No Saved Jobs Found</h3>
        <p>${currentSavedSearch ? 'No bookmarked jobs match your search criteria.' : 'You have not saved any jobs yet. Explore available opportunities to save jobs for later.'}</p>
        <a href="jobs.html" class="btn btn-primary">
          <i class="fa-solid fa-magnifying-glass"></i> Browse Jobs Now
        </a>
      </div>
    `;
    return;
  }

  // Render cards
  container.innerHTML = savedJobs.map(job => {
    const logoSrc = getCompanyLogo(job.company);
    
    // Check if already applied
    const alreadyApplied = applications.some(
      app => app.role.toLowerCase() === job.role.toLowerCase() && app.company.toLowerCase() === job.company.toLowerCase()
    );

    return `
      <div class="saved-card" data-id="${job.id}">
        <div class="saved-card-header">
          <div class="saved-card-title-group">
            <div class="saved-company-logo">
              <img src="${logoSrc}" alt="${job.company} logo" />
            </div>
            <div class="saved-job-info">
              <h3>${job.role}</h3>
              <p>${job.company} <span>•</span> ${job.location}</p>
            </div>
          </div>
          <button type="button" class="bookmark-toggle-btn" data-id="${job.id}" title="Remove Bookmark">
            <i class="fa-solid fa-bookmark"></i>
          </button>
        </div>

        <div class="saved-card-meta">
          <span><i class="fa-solid fa-briefcase"></i> ${job.type || 'Internship'}</span>
          <span><i class="fa-solid fa-wallet"></i> ${job.salary || 'Competitive Stipend'}</span>
        </div>

        <p class="saved-card-desc">
          ${job.description || 'Exciting opportunity to work with an industry leader. Build hands-on projects and accelerate your professional career.'}
        </p>

        <div class="saved-card-footer">
          <span class="saved-date-tag">Saved on ${job.date || 'Recent'}</span>
          <div class="saved-card-actions">
            ${alreadyApplied 
              ? '<button type="button" class="btn btn-secondary" disabled style="opacity: 0.7; cursor: not-allowed;"><i class="fa-solid fa-check"></i> Applied</button>'
              : `<button type="button" class="btn btn-primary apply-saved-btn" data-id="${job.id}"><i class="fa-solid fa-paper-plane"></i> Apply Now</button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Wire up remove bookmark buttons
  const removeBtns = container.querySelectorAll(".bookmark-toggle-btn");
  removeBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      removeBookmark(id);
    });
  });

  // Wire up apply buttons
  const applyBtns = container.querySelectorAll(".apply-saved-btn");
  applyBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      openApplyModal(id);
    });
  });
}

// Remove bookmark
function removeBookmark(jobId) {
  let savedJobs = getSavedJobs();
  const job = savedJobs.find(j => j.id === jobId);
  savedJobs = savedJobs.filter(j => j.id !== jobId);
  saveSavedJobs(savedJobs);

  updateSavedCount();
  renderSavedJobsGrid();

  const title = job ? `${job.role} at ${job.company}` : "Job";
  showToast(`${title} removed from Saved Jobs`, "info");
}

// Apply modal
function openApplyModal(jobId) {
  const savedJobs = getSavedJobs();
  const job = savedJobs.find(j => j.id === jobId);
  if (!job) return;

  const profile = getProfile();
  const logoSrc = getCompanyLogo(job.company);

  // Today's formatted date
  const today = new Date();
  const day = today.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${day} ${months[today.getMonth()]} ${today.getFullYear()}`;

  const modalHtml = `
    <div class="modal-box">
      <div class="modal-header">
        <h3><i class="fa-solid fa-paper-plane"></i> Apply for Opportunity</h3>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <form id="apply-job-form">
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
            <label class="form-label" for="applicant-name">Applicant Name</label>
            <input type="text" id="applicant-name" class="form-input" value="${profile.name}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="applicant-email">Email Address</label>
            <input type="email" id="applicant-email" class="form-input" value="${profile.email}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="applicant-phone">Phone Number</label>
            <input type="text" id="applicant-phone" class="form-input" value="${profile.phone}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="application-note">Cover Note (Optional)</label>
            <textarea id="application-note" class="form-textarea" placeholder="Brief note explaining your interest and qualifications for this role..."></textarea>
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

  const form = document.getElementById("apply-job-form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const applications = getApplications();

      // Check duplicate
      const alreadyApplied = applications.some(
        app => app.role.toLowerCase() === job.role.toLowerCase() && app.company.toLowerCase() === job.company.toLowerCase()
      );

      if (alreadyApplied) {
        showToast("You have already submitted an application for this position.", "warning");
        closeModal();
        return;
      }

      const note = document.getElementById("application-note").value.trim();

      // Create new application
      const newApp = {
        id: Date.now(),
        role: job.role,
        company: job.company,
        location: job.location,
        date: formattedToday,
        status: "In Review",
        notes: note || "Application submitted via Saved Jobs. In review by hiring team."
      };

      applications.unshift(newApp);
      saveApplications(applications);

      closeModal();
      renderSavedJobsGrid();

      showToast(`Successfully applied to ${job.role} at ${job.company}!`, "success");
    });
  }
}

