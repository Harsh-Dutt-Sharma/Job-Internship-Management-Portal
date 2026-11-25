/* =========================================================
   discover_ jobs.js - JavaScript for discovery_jobs.html
   Connected to JSON Server REST API (http://localhost:3000/jobs)
   1) Dynamic rendering of jobs from API
   2) Search + location + experience filters
   3) View Details & Bookmark buttons
   4) Top bar: sidebar slider (☰), bell, user menu
   ========================================================= */

let allJobsList = [];
let savedJobsList = [];

// Elements
const searchInput = document.getElementById('searchInput');
const locationSelect = document.getElementById('locationSelect');
const experienceSelect = document.getElementById('experienceSelect');
const searchBtn = document.getElementById('searchBtn');
const jobList = document.getElementById('jobList');
const resultsCount = document.getElementById('resultsCount');

document.addEventListener("DOMContentLoaded", async function() {
  await loadDiscoveryJobs();
  setupFilters();
  setupTopBar();
});

// Fetch and render jobs from API
async function loadDiscoveryJobs() {
  if (!jobList) return;

  jobList.innerHTML = `
    <div style="padding: 40px; text-align: center; color: #64748b; font-size: 15px;">
      Loading opportunities from server...
    </div>
  `;

  try {
    if (window.API) {
      [allJobsList, savedJobsList] = await Promise.all([
        API.getJobs(),
        API.getSavedJobs()
      ]);
    } else {
      const res = await fetch("http://localhost:3000/jobs");
      allJobsList = await res.json();
      const sRes = await fetch("http://localhost:3000/savedJobs");
      savedJobsList = await sRes.json();
    }
  } catch (error) {
    console.error("Error loading jobs for discovery:", error);
    allJobsList = [];
    savedJobsList = [];
  }

  // Update stats cards if present
  updateDiscoveryStats(allJobsList);

  // Render cards
  renderJobCards(allJobsList);
}

// Update the 4 stats at the top of discovery_jobs.html
function updateDiscoveryStats(jobs) {
  const statValues = document.querySelectorAll(".stat-value");
  if (statValues.length >= 4) {
    const total = jobs.length;
    const internships = jobs.filter(j => j.type === "Internship").length;
    const fullTime = jobs.filter(j => j.type === "Full-Time" || j.type === "Full Time").length;
    const companies = new Set(jobs.map(j => j.company)).size;

    statValues[0].textContent = total > 0 ? total : "17";
    statValues[1].textContent = internships > 0 ? internships : "12";
    statValues[2].textContent = fullTime > 0 ? fullTime : "5";
    statValues[3].textContent = `${companies}+`;
  }
}

// Render dynamic job cards into #jobList
function renderJobCards(jobs) {
  if (!jobList) return;

  if (jobs.length === 0) {
    jobList.innerHTML = `<div class="no-results" style="padding: 30px; text-align: center; color: #64748b;">No opportunities match your search.</div>`;
    if (resultsCount) resultsCount.textContent = "Showing 0 of 0 results";
    return;
  }

  jobList.innerHTML = jobs.map(job => {
    const roleTitle = job.role || job.title;
    const isIntern = job.type === "Internship";
    const badgeClass = isIntern ? "badge-internship" : "badge-fulltime";
    const badgeText = isIntern ? "Internship" : "Full Time";
    const logoSrc = job.logo || `https://www.google.com/s2/favicons?domain=${(job.company || 'google').toLowerCase()}.com&sz=128`;
    const detailsPage = job.detailsPage || `apply.html?jobId=${job.id}`;
    const skillsText = typeof job.skills === "string" ? job.skills : (Array.isArray(job.skills) ? job.skills.join(" • ") : "Web Development");

    // Check if bookmarked
    const isBookmarked = savedJobsList.some(
      s => (s.jobId == job.id) || (s.role && s.role.toLowerCase() === roleTitle.toLowerCase() && s.company.toLowerCase() === job.company.toLowerCase())
    );

    return `
      <article class="job-card" data-id="${job.id}" data-page="${detailsPage}" data-company="${job.company}" data-title="${roleTitle}" data-skills="${skillsText}" data-location="${job.location}" data-experience="${job.experience || 'Internship'}">
        <div class="job-logo">
          <img src="${logoSrc}" alt="${job.company} logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <span class="logo-fallback" style="display: none;">${job.company[0]}</span>
        </div>
        <div class="job-body">
          <div class="job-title-row">
            <h3>${roleTitle}</h3>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <p class="job-sub">${job.company} &nbsp;•&nbsp; ${job.location}</p>
          <p class="job-meta">🖥 ${job.workMode || 'On-site'} &nbsp;&nbsp; 🕒 ${job.duration || job.experience || '6 months'} &nbsp;&nbsp; 🏷 ${skillsText}</p>
        </div>
        <div class="job-side">
          <div class="job-side-top">
            <span class="posted">Posted ${job.posted || 'recently'}</span>
            <span class="bookmark ${isBookmarked ? 'active-bookmark' : ''}" data-id="${job.id}" title="${isBookmarked ? 'Remove Bookmark' : 'Save Job'}" style="cursor: pointer; font-size: 18px; color: ${isBookmarked ? '#176fe5' : '#94a3b8'};">🔖</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm view-job-btn" data-page="${detailsPage}">View Details</button>
        </div>
      </article>
    `;
  }).join("");

  if (resultsCount) {
    resultsCount.textContent = `Showing ${jobs.length} of ${allJobsList.length} results`;
  }

  // Wire up view details buttons
  const viewBtns = jobList.querySelectorAll(".view-job-btn");
  viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      if (page) {
        window.location.href = page;
      }
    });
  });

  // Wire up bookmark toggles
  const bookmarkIcons = jobList.querySelectorAll(".bookmark");
  bookmarkIcons.forEach(icon => {
    icon.addEventListener("click", async (e) => {
      e.stopPropagation();
      const jobId = icon.getAttribute("data-id");
      await toggleDiscoveryBookmark(jobId);
    });
  });
}

// Toggle Bookmark via API
async function toggleDiscoveryBookmark(jobId) {
  const job = allJobsList.find(j => j.id == jobId);
  if (!job) return;

  const roleTitle = job.role || job.title;
  const existingSaved = savedJobsList.find(
    s => (s.jobId == job.id) || (s.role && s.role.toLowerCase() === roleTitle.toLowerCase() && s.company.toLowerCase() === job.company.toLowerCase())
  );

  const today = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  if (existingSaved) {
    // Remove
    try {
      if (window.API) {
        await API.removeSavedJob(existingSaved.id);
      } else {
        await fetch(`http://localhost:3000/savedJobs/${existingSaved.id}`, { method: "DELETE" });
      }
      savedJobsList = savedJobsList.filter(s => s.id !== existingSaved.id);
      alert(`Removed ${roleTitle} at ${job.company} from Saved Jobs`);
    } catch (err) {
      console.error(err);
    }
  } else {
    // Save
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
      if (window.API) {
        const saved = await API.saveJob(newSaved);
        savedJobsList.push(saved);
      } else {
        const res = await fetch("http://localhost:3000/savedJobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSaved)
        });
        const saved = await res.json();
        savedJobsList.push(saved);
      }
      alert(`Saved ${roleTitle} at ${job.company} to Bookmarks!`);
    } catch (err) {
      console.error(err);
    }
  }

  applyFilters();
}

// Setup search & filter listeners
function setupFilters() {
  if (searchBtn) searchBtn.addEventListener('click', applyFilters);
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') applyFilters();
    });
  }
  if (locationSelect) locationSelect.addEventListener('change', applyFilters);
  if (experienceSelect) experienceSelect.addEventListener('change', applyFilters);

  // Chip category filters
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const category = chip.textContent.trim();
      if (category === "All" || category.includes("More")) {
        searchInput.value = "";
      } else {
        searchInput.value = category;
      }
      applyFilters();
    });
  });

  // Clear all button in filters sidebar
  const clearBtn = document.querySelector('.filters-header .link-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (locationSelect) locationSelect.value = '';
      if (experienceSelect) experienceSelect.value = '';

      document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => {
        cb.checked = cb.defaultChecked;
      });

      document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.textContent.trim() === 'All');
      });

      applyFilters();
    });
  }
}

function applyFilters() {
  const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const loc = locationSelect ? locationSelect.value : "";
  const exp = experienceSelect ? experienceSelect.value : "";

  let filtered = allJobsList.filter(job => {
    const roleTitle = (job.role || job.title || "").toLowerCase();
    const company = (job.company || "").toLowerCase();
    const skills = (typeof job.skills === "string" ? job.skills : "").toLowerCase();
    const text = `${roleTitle} ${company} ${skills}`;

    const matchText = !q || text.includes(q);
    const matchLoc = !loc || (job.location && job.location.includes(loc));
    const matchExp = !exp || (job.experience && job.experience.includes(exp));

    return matchText && matchLoc && matchExp;
  });

  renderJobCards(filtered);
}

// Setup top bar dropdowns and sidebar slide
function setupTopBar() {
  const menuBtn = document.getElementById('menuBtn');
  const bellBtn = document.getElementById('bellBtn');
  const bellDot = document.getElementById('bellDot');
  const notifPanel = document.getElementById('notifPanel');
  const notifCount = document.getElementById('notifCount');
  const markAllBtn = document.getElementById('markAllRead');
  const userBtn = document.getElementById('userBtn');
  const userMenu = document.getElementById('userMenu');

  // Tooltips for icon sidebar
  document.querySelectorAll('.nav-item').forEach(a => { a.title = a.textContent.trim(); });

  const isMobile = () => window.matchMedia('(max-width: 720px)').matches;

  if (menuBtn) {
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      document.body.classList.toggle(isMobile() ? 'sidebar-open' : 'sidebar-collapsed');
    });
  }

  document.addEventListener('click', e => {
    if (document.body.classList.contains('sidebar-open') && !e.target.closest('.sidebar')) {
      document.body.classList.remove('sidebar-open');
    }
  });

  // Dropdowns
  const pairs = [
    [bellBtn, notifPanel],
    [userBtn, userMenu]
  ];

  function closeAll(except) {
    pairs.forEach(([btn, panel]) => {
      if (panel && panel !== except) {
        panel.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  pairs.forEach(([btn, panel]) => {
    if (btn && panel) {
      btn.addEventListener('click', () => {
        const open = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        closeAll(open ? panel : null);
      });
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown-wrap')) closeAll(null);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAll(null);
      document.body.classList.remove('sidebar-open');
    }
  });

  function refreshBell() {
    if (!notifPanel) return;
    const unread = notifPanel.querySelectorAll('.notif-item.unread').length;
    if (bellDot) bellDot.style.display = unread ? '' : 'none';
    if (notifCount) notifCount.textContent = unread ? `${unread} new` : 'All caught up';
  }

  if (notifPanel) {
    notifPanel.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.remove('unread');
        refreshBell();
      });
    });
  }

  if (markAllBtn && notifPanel) {
    markAllBtn.addEventListener('click', () => {
      notifPanel.querySelectorAll('.notif-item').forEach(i => i.classList.remove('unread'));
      refreshBell();
    });
  }

  refreshBell();
}
