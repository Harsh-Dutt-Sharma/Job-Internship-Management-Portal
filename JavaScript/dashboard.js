/* ==========================================================================
   JobPortal - Dashboard JavaScript (dashboard.js)
   Handles:
   - Dynamic application counts calculation from JSON Server REST API
   - Interactive Summary Cards filtering & navigation
   - Dynamic Recent Applications rendering & View Details modal from API
   - Dynamic Saved Jobs rendering with API remove bookmark functionality
   - Functional View All links & buttons
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async function() {
  // Update summary numbers from API
  await updateSummaryCounts();

  // Make summary cards interactive
  setupSummaryCards();

  // Render recent applications list from API
  await renderRecentApplications();

  // Render saved jobs list from API
  await renderSavedJobs();

  // Setup View All Applications buttons
  setupViewAllButtons();
});

// Update the 4 summary numbers based on API data
async function updateSummaryCounts() {
  let applications = [];
  try {
    if (window.API && typeof API.getApplications === "function") {
      applications = await API.getApplications();
    } else {
      applications = getApplications();
    }
  } catch (error) {
    console.warn("Could not load applications from API, using fallback:", error);
    applications = getApplications();
  }

  const total = applications.length;
  const shortlisted = applications.filter(app => app.status === "Shortlisted").length;
  const inReview = applications.filter(app => app.status === "In Review").length;
  const rejected = applications.filter(app => app.status === "Rejected").length;

  const totalEl = document.getElementById("total-count");
  const shortlistedEl = document.getElementById("shortlisted-count");
  const reviewEl = document.getElementById("review-count");
  const rejectedEl = document.getElementById("rejected-count");

  if (totalEl) totalEl.textContent = total;
  if (shortlistedEl) shortlistedEl.textContent = shortlisted;
  if (reviewEl) reviewEl.textContent = inReview;
  if (rejectedEl) rejectedEl.textContent = rejected;
}

// Summary cards click: open applications page with filter pre-selected
function setupSummaryCards() {
  const cardTotal = document.getElementById("card-total");
  const cardShortlisted = document.getElementById("card-shortlisted");
  const cardReview = document.getElementById("card-review");
  const cardRejected = document.getElementById("card-rejected");

  if (cardTotal) {
    cardTotal.addEventListener("click", function() {
      window.location.href = "applications.html?status=all";
    });
  }

  if (cardShortlisted) {
    cardShortlisted.addEventListener("click", function() {
      window.location.href = "applications.html?status=Shortlisted";
    });
  }

  if (cardReview) {
    cardReview.addEventListener("click", function() {
      window.location.href = "applications.html?status=In Review";
    });
  }

  if (cardRejected) {
    cardRejected.addEventListener("click", function() {
      window.location.href = "applications.html?status=Rejected";
    });
  }
}

// Render Recent Applications (latest 5) from API
async function renderRecentApplications() {
  const container = document.getElementById("dashboard-recent-apps");
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 24px 0; text-align: center; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading recent applications...
    </div>
  `;

  let applications = [];
  try {
    if (window.API && typeof API.getApplications === "function") {
      applications = await API.getApplications();
    } else {
      applications = getApplications();
    }
  } catch (error) {
    console.error("Error fetching applications:", error);
    applications = getApplications();
  }

  const recentApps = applications.slice(0, 5);

  if (recentApps.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 0; text-align: center; color: #64748b;">
        <p>No recent applications found.</p>
        <a href="jobs.html" class="btn btn-primary" style="margin-top: 10px; font-size: 12px; padding: 6px 14px;">Browse Jobs to Apply</a>
      </div>
    `;
    return;
  }

  container.innerHTML = recentApps.map(app => {
    const logoSrc = getCompanyLogo(app.company);
    let statusClass = "in-review";
    if (app.status === "Shortlisted") statusClass = "shortlisted";
    if (app.status === "Rejected") statusClass = "rejected";

    return `
      <div class="application" data-id="${app.id}" style="cursor: pointer;" title="Click to view details">
        <div class="company-logo">
          <img src="${logoSrc}" alt="${app.company} logo" />
        </div>

        <div class="job-role">
          <h3>${app.role}</h3>
          <p>${app.company} <span>•</span> ${app.location}</p>
        </div>

        <div class="application-date">
          <span>Applied on</span>
          <span>${app.date}</span>
        </div>

        <span class="application-status ${statusClass}">${app.status}</span>
      </div>
    `;
  }).join("");

  // Clicking an application opens details modal
  const appCards = container.querySelectorAll(".application");
  appCards.forEach(card => {
    card.addEventListener("click", function() {
      const id = this.getAttribute("data-id");
      showApplicationDetails(id);
    });
  });
}

// Render Saved Jobs (up to 5) from API
async function renderSavedJobs() {
  const container = document.getElementById("dashboard-saved-jobs");
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 24px 0; text-align: center; color: #64748b;">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading saved jobs...
    </div>
  `;

  let savedJobs = [];
  try {
    if (window.API && typeof API.getSavedJobs === "function") {
      savedJobs = await API.getSavedJobs();
    } else {
      savedJobs = getSavedJobs();
    }
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    savedJobs = getSavedJobs();
  }

  const displayJobs = savedJobs.slice(0, 5);

  if (displayJobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 0; text-align: center; color: #64748b;">
        <p>You have not saved any jobs yet.</p>
        <a href="jobs.html" class="btn btn-primary" style="margin-top: 10px; font-size: 12px; padding: 6px 14px;">Browse Jobs</a>
      </div>
    `;
    return;
  }

  container.innerHTML = displayJobs.map(job => `
    <div class="job-card" data-id="${job.id}">
      <div class="job-info">
        <h3 class="job-role">${job.role}</h3>
        <p class="company-location">${job.company} <span>•</span> ${job.location}</p>
      </div>

      <div class="saved-date">
        <span class="date-label">Saved on</span>
        <span class="date">${job.date || 'Recent'}</span>
      </div>

      <button type="button" class="save-icon remove-saved-btn" data-id="${job.id}" aria-label="Remove saved job" title="Remove from saved jobs">
        <i class="fa-solid fa-bookmark"></i>
      </button>
    </div>
  `).join("");

  // Wire up remove bookmark buttons
  const removeButtons = container.querySelectorAll(".remove-saved-btn");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", async function(e) {
      e.stopPropagation();
      const id = this.getAttribute("data-id");
      await removeSavedJob(id);
    });
  });
}

// Remove saved job from API & refresh dashboard saved jobs list
async function removeSavedJob(jobId) {
  try {
    if (window.API && typeof API.removeSavedJob === "function") {
      await API.removeSavedJob(jobId);
    } else {
      let savedJobs = getSavedJobs();
      savedJobs = savedJobs.filter(job => job.id != jobId);
      saveSavedJobs(savedJobs);
    }
    showToast("Job removed from Saved Jobs", "info");
    await renderSavedJobs();
  } catch (error) {
    console.error("Error removing saved job:", error);
    showToast("Failed to remove saved job.", "error");
  }
}

// Setup View All Applications button and links
function setupViewAllButtons() {
  const viewAllBtn = document.getElementById("view-all-apps-btn");
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", function() {
      window.location.href = "applications.html";
    });
  }
}

// Show Application Details in a modal
async function showApplicationDetails(appId) {
  let app = null;
  try {
    if (window.API && typeof API.getApplicationById === "function") {
      app = await API.getApplicationById(appId);
    }
  } catch (e) {
    console.warn("Could not fetch application by ID from API:", e);
  }

  if (!app) {
    const applications = (window.API ? await API.getApplications() : null) || getApplications();
    app = applications.find(a => a.id == appId);
  }

  if (!app) return;

  const logoSrc = getCompanyLogo(app.company);
  let statusClass = "in-review";
  if (app.status === "Shortlisted") statusClass = "shortlisted";
  if (app.status === "Rejected") statusClass = "rejected";

  const modalHtml = `
    <div class="modal-box">
      <div class="modal-header">
        <h3><i class="fa-regular fa-file-lines"></i> Application Details</h3>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="width: 52px; height: 52px; border: 1px solid #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #fff;">
            <img src="${logoSrc}" alt="${app.company} logo" style="max-width: 40px; max-height: 40px; object-fit: contain;" />
          </div>
          <div>
            <h2 style="font-size: 17px; font-weight: bold; color: #111827; margin-bottom: 4px;">${app.role}</h2>
            <p style="font-size: 13px; color: #475569;">${app.company} • ${app.location}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <label>Application Status</label>
            <p><span class="application-status ${statusClass}">${app.status}</span></p>
          </div>
          <div class="detail-item">
            <label>Applied Date</label>
            <p>${app.date}</p>
          </div>
          <div class="detail-item">
            <label>Application ID</label>
            <p>#JP-${app.id.toString().padStart(4, '0')}</p>
          </div>
          <div class="detail-item">
            <label>Work Location</label>
            <p>${app.location}</p>
          </div>
        </div>

        <div class="detail-item" style="margin-top: 14px;">
          <label>Status Notes / Progress</label>
          <p style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; line-height: 1.5;">
            ${app.notes || 'Your application is currently active. Further communication will be conveyed via email or portal alerts.'}
          </p>
        </div>
      </div>
      <div class="modal-actions">
        <a href="applications.html" class="btn btn-secondary">Manage Applications</a>
        <button type="button" class="btn btn-primary" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;

  openModal(modalHtml);
}
