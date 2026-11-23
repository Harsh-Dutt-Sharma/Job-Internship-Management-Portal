/* ==========================================================================
   JobPortal - Applications JavaScript (applications.js)
   Handles:
   - Search by job title or company
   - Filter by status (All, Shortlisted, In Review, Rejected)
   - Dynamic application counts update
   - Add new application with validation & instant display
   - Edit application modal & update
   - Delete application with confirmation modal
   - View application details modal
   - Empty state rendering
   - Pre-selection from URL query parameter (e.g. ?status=Shortlisted)
   ========================================================================== */

let currentSearchQuery = "";
let currentStatusFilter = "all";

document.addEventListener("DOMContentLoaded", function() {
  // Check URL query parameters for filter
  readUrlQueryParams();

  // Update counts
  updateCounts();

  // Setup search input listeners
  setupSearch();

  // Setup status filter dropdown listeners
  setupStatusFilter();

  // Setup metric cards click listeners
  setupMetricCardsFilter();

  // Setup Add Application button
  setupAddApplicationButton();

  // Render initial list
  renderApplicationsList();
});

// Check if ?status=... is passed in the URL
function readUrlQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const statusParam = urlParams.get("status");

  if (statusParam) {
    currentStatusFilter = statusParam;
    const filterSelect = document.getElementById("status-filter");
    if (filterSelect) {
      filterSelect.value = statusParam;
    }
    highlightActiveMetricCard(statusParam);
  }
}

// Update top metric counts from localStorage data
function updateCounts() {
  const applications = getApplications();

  const total = applications.length;
  const shortlisted = applications.filter(a => a.status === "Shortlisted").length;
  const inReview = applications.filter(a => a.status === "In Review").length;
  const rejected = applications.filter(a => a.status === "Rejected").length;

  document.getElementById("metric-total-count").textContent = total;
  document.getElementById("metric-shortlisted-count").textContent = shortlisted;
  document.getElementById("metric-review-count").textContent = inReview;
  document.getElementById("metric-rejected-count").textContent = rejected;
}

// Setup search bar
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search");

  if (!searchInput) return;

  searchInput.addEventListener("input", function(e) {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    if (clearBtn) {
      clearBtn.style.display = currentSearchQuery.length > 0 ? "block" : "none";
    }
    renderApplicationsList();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      searchInput.value = "";
      currentSearchQuery = "";
      clearBtn.style.display = "none";
      renderApplicationsList();
    });
  }
}

// Setup status filter dropdown
function setupStatusFilter() {
  const filterSelect = document.getElementById("status-filter");
  if (!filterSelect) return;

  filterSelect.addEventListener("change", function(e) {
    currentStatusFilter = e.target.value;
    highlightActiveMetricCard(currentStatusFilter);
    renderApplicationsList();
  });
}

// Metric cards can also be clicked to filter the list
function setupMetricCardsFilter() {
  const metricCards = document.querySelectorAll(".metric-card");
  metricCards.forEach(card => {
    card.addEventListener("click", function() {
      const filter = this.getAttribute("data-filter");
      currentStatusFilter = filter;

      const filterSelect = document.getElementById("status-filter");
      if (filterSelect) {
        filterSelect.value = filter;
      }

      highlightActiveMetricCard(filter);
      renderApplicationsList();
    });
  });
}

function highlightActiveMetricCard(filter) {
  const metricCards = document.querySelectorAll(".metric-card");
  metricCards.forEach(card => {
    if (card.getAttribute("data-filter") === filter) {
      card.classList.add("active-metric");
    } else {
      card.classList.remove("active-metric");
    }
  });
}

// Render the application list based on search and status filters
function renderApplicationsList() {
  const container = document.getElementById("applications-list");
  if (!container) return;

  const applications = getApplications();

  // Filter by status
  let filtered = applications;
  if (currentStatusFilter && currentStatusFilter !== "all") {
    filtered = filtered.filter(app => app.status === currentStatusFilter);
  }

  // Filter by search query
  if (currentSearchQuery) {
    filtered = filtered.filter(app => {
      const roleMatch = app.role.toLowerCase().includes(currentSearchQuery);
      const companyMatch = app.company.toLowerCase().includes(currentSearchQuery);
      const locationMatch = app.location && app.location.toLowerCase().includes(currentSearchQuery);
      return roleMatch || companyMatch || locationMatch;
    });
  }

  // Empty state check
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="app-empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <h3>No Applications Found</h3>
        <p>No job applications match your current search or status filter.</p>
        <button type="button" class="btn btn-secondary" id="reset-filters-btn">
          Reset Filters
        </button>
      </div>
    `;

    const resetBtn = container.querySelector("#reset-filters-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function() {
        const searchInput = document.getElementById("search-input");
        const clearBtn = document.getElementById("clear-search");
        const filterSelect = document.getElementById("status-filter");

        if (searchInput) searchInput.value = "";
        if (clearBtn) clearBtn.style.display = "none";
        if (filterSelect) filterSelect.value = "all";

        currentSearchQuery = "";
        currentStatusFilter = "all";
        highlightActiveMetricCard("all");
        renderApplicationsList();
      });
    }
    return;
  }

  // Render list of applications
  container.innerHTML = filtered.map(app => {
    const logoSrc = getCompanyLogo(app.company);
    let statusClass = "in-review";
    if (app.status === "Shortlisted") statusClass = "shortlisted";
    if (app.status === "Rejected") statusClass = "rejected";

    return `
      <div class="app-row-item" data-id="${app.id}">
        <div class="app-logo">
          <img src="${logoSrc}" alt="${app.company} logo" />
        </div>

        <div class="app-info">
          <h3>${app.role}</h3>
          <p>${app.company} <span>•</span> ${app.location}</p>
        </div>

        <div class="app-date-col">
          <span>Applied on</span>
          <span>${app.date}</span>
        </div>

        <div>
          <span class="application-status ${statusClass}">${app.status}</span>
        </div>

        <div class="app-actions">
          <button type="button" class="btn-action btn-view" data-id="${app.id}" title="View Details">
            <i class="fa-regular fa-eye"></i> Details
          </button>
          <button type="button" class="btn-action btn-edit" data-id="${app.id}" title="Edit Application">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button type="button" class="btn-action btn-delete" data-id="${app.id}" title="Delete Application">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Wire up action buttons
  attachRowActionListeners(container);
}

// Wire up View, Edit, and Delete buttons
function attachRowActionListeners(container) {
  // View Details
  const viewBtns = container.querySelectorAll(".btn-view");
  viewBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      openViewDetailsModal(id);
    });
  });

  // Edit Application
  const editBtns = container.querySelectorAll(".btn-edit");
  editBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      openEditModal(id);
    });
  });

  // Delete Application
  const deleteBtns = container.querySelectorAll(".btn-delete");
  deleteBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      openDeleteConfirmationModal(id);
    });
  });
}

// --- ADD APPLICATION MODAL & SUBMISSION ---

function setupAddApplicationButton() {
  const addBtn = document.getElementById("open-add-modal-btn");
  if (!addBtn) return;

  addBtn.addEventListener("click", function() {
    openAddApplicationModal();
  });
}

function openAddApplicationModal() {
  // Today's formatted date as default
  const today = new Date();
  const day = today.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${day} ${months[today.getMonth()]} ${today.getFullYear()}`;

  const modalHtml = `
    <div class="modal-box">
      <div class="modal-header">
        <h3><i class="fa-solid fa-plus-circle"></i> Add New Application</h3>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <form id="add-application-form">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="new-role">Job Role / Title *</label>
            <input type="text" id="new-role" class="form-input" placeholder="e.g. Frontend Developer Intern" required />
            <div class="form-error" id="error-role">Please enter a job role.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-company">Company Name *</label>
            <input type="text" id="new-company" class="form-input" placeholder="e.g. Google, Microsoft, Swiggy" required />
            <div class="form-error" id="error-company">Please enter a company name.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-location">Location *</label>
            <input type="text" id="new-location" class="form-input" placeholder="e.g. Bengaluru, India or Remote" required />
            <div class="form-error" id="error-location">Please enter a location.</div>
          </div>

          <div class="details-grid">
            <div class="form-group">
              <label class="form-label" for="new-date">Application Date *</label>
              <input type="text" id="new-date" class="form-input" value="${formattedToday}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="new-status">Application Status *</label>
              <select id="new-status" class="form-select" required>
                <option value="In Review">In Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-notes">Status Notes (Optional)</label>
            <textarea id="new-notes" class="form-textarea" placeholder="Add any details about next steps, interview date, or assessment link..."></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Application</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml);

  // Handle form submission
  const form = document.getElementById("add-application-form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const role = document.getElementById("new-role").value.trim();
      const company = document.getElementById("new-company").value.trim();
      const location = document.getElementById("new-location").value.trim();
      const date = document.getElementById("new-date").value.trim();
      const status = document.getElementById("new-status").value;
      const notes = document.getElementById("new-notes").value.trim();

      // Basic validation
      if (!role || !company || !location || !date) {
        showToast("Please fill in all required fields.", "error");
        return;
      }

      const applications = getApplications();

      // Create new application object
      const newApp = {
        id: Date.now(),
        role: role,
        company: company,
        location: location,
        date: date,
        status: status,
        notes: notes || "Application submitted. Awaiting employer review."
      };

      // Add to beginning of array
      applications.unshift(newApp);
      saveApplications(applications);

      // Close modal
      closeModal();

      // Update counts & refresh listing
      updateCounts();
      renderApplicationsList();

      showToast(`Application for ${role} at ${company} added successfully!`, "success");
    });
  }
}

// --- EDIT APPLICATION MODAL ---

function openEditModal(appId) {
  const applications = getApplications();
  const app = applications.find(a => a.id === appId);
  if (!app) return;

  const modalHtml = `
    <div class="modal-box">
      <div class="modal-header">
        <h3><i class="fa-solid fa-pen"></i> Edit Application</h3>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <form id="edit-application-form">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="edit-role">Job Role / Title *</label>
            <input type="text" id="edit-role" class="form-input" value="${app.role}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-company">Company Name *</label>
            <input type="text" id="edit-company" class="form-input" value="${app.company}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-location">Location *</label>
            <input type="text" id="edit-location" class="form-input" value="${app.location}" required />
          </div>

          <div class="details-grid">
            <div class="form-group">
              <label class="form-label" for="edit-date">Application Date *</label>
              <input type="text" id="edit-date" class="form-input" value="${app.date}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-status">Application Status *</label>
              <select id="edit-status" class="form-select" required>
                <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                <option value="In Review" ${app.status === 'In Review' ? 'selected' : ''}>In Review</option>
                <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-notes">Status Notes</label>
            <textarea id="edit-notes" class="form-textarea">${app.notes || ''}</textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml);

  const form = document.getElementById("edit-application-form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const role = document.getElementById("edit-role").value.trim();
      const company = document.getElementById("edit-company").value.trim();
      const location = document.getElementById("edit-location").value.trim();
      const date = document.getElementById("edit-date").value.trim();
      const status = document.getElementById("edit-status").value;
      const notes = document.getElementById("edit-notes").value.trim();

      if (!role || !company || !location || !date) {
        showToast("Please fill in all required fields.", "error");
        return;
      }

      // Update item in array
      const allApps = getApplications();
      const targetIndex = allApps.findIndex(a => a.id === appId);
      if (targetIndex !== -1) {
        allApps[targetIndex].role = role;
        allApps[targetIndex].company = company;
        allApps[targetIndex].location = location;
        allApps[targetIndex].date = date;
        allApps[targetIndex].status = status;
        allApps[targetIndex].notes = notes;

        saveApplications(allApps);
      }

      closeModal();
      updateCounts();
      renderApplicationsList();
      showToast("Application updated successfully!", "success");
    });
  }
}

// --- DELETE APPLICATION CONFIRMATION ---

function openDeleteConfirmationModal(appId) {
  const applications = getApplications();
  const app = applications.find(a => a.id === appId);
  if (!app) return;

  const modalHtml = `
    <div class="modal-box confirmation-box">
      <div class="modal-header">
        <h3><i class="fa-solid fa-triangle-exclamation" style="color: #dc2626;"></i> Delete Application</h3>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete your application for <strong>${app.role}</strong> at <strong>${app.company}</strong>?</p>
        <p class="modal-subtitle">This action cannot be undone. The entry will be removed from your applications list.</p>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete</button>
      </div>
    </div>
  `;

  openModal(modalHtml);

  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function() {
      let allApps = getApplications();
      allApps = allApps.filter(a => a.id !== appId);
      saveApplications(allApps);

      closeModal();
      updateCounts();
      renderApplicationsList();
      showToast("Application deleted.", "info");
    });
  }
}

// --- VIEW DETAILS MODAL ---

function openViewDetailsModal(appId) {
  const applications = getApplications();
  const app = applications.find(a => a.id === appId);
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
        <button type="button" class="btn btn-secondary" onclick="openEditModal(${app.id})"><i class="fa-solid fa-pen"></i> Edit</button>
        <button type="button" class="btn btn-primary" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

