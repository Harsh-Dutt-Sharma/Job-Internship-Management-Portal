/* =========================================================
   discovery jobs.js  -  all JavaScript for jobs.html
   1) Search + location + experience filters
   2) View Details buttons
   3) Top bar: sidebar slider (☰), bell, user menu
   ========================================================= */

/* ---------- 1) SEARCH + LOCATION + EXPERIENCE ---------- */
const cards = [...document.querySelectorAll('.job-card')];
const searchInput = document.getElementById('searchInput');
const locationSelect = document.getElementById('locationSelect');
const experienceSelect = document.getElementById('experienceSelect');
const searchBtn = document.getElementById('searchBtn');
const jobList = document.getElementById('jobList');
const resultsCount = document.getElementById('resultsCount');

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const loc = locationSelect.value;
  const exp = experienceSelect.value;
  let visible = 0;

  cards.forEach(card => {
    const d = card.dataset;
    const text = `${d.title} ${d.company} ${d.skills}`.toLowerCase();

    const matchText = !q || text.includes(q);
    const matchLoc = !loc || d.location === loc;
    const matchExp = !exp || d.experience === exp;

    const show = matchText && matchLoc && matchExp;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // "no results" message
  let msg = document.getElementById('noResults');
  if (visible === 0 && !msg) {
    msg = document.createElement('div');
    msg.id = 'noResults';
    msg.className = 'no-results';
    msg.textContent = 'No opportunities match your search.';
    jobList.after(msg);
  } else if (visible > 0 && msg) {
    msg.remove();
  }

  resultsCount.textContent = `Showing ${visible} of ${cards.length} results`;
}

searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('input', applyFilters);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') applyFilters();
});
locationSelect.addEventListener('change', applyFilters);
experienceSelect.addEventListener('change', applyFilters);

/* ---------- 2) VIEW DETAILS BUTTONS ---------- */
document.querySelectorAll('.job-card .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.closest('.job-card').dataset.page;
    if (page) {
      window.location.href = page;
    } else {
      alert('Details page coming soon.');
    }
  });
});

/* ---------- CLEAR ALL (filters box) ---------- */
document.querySelector('.filters-header .link-btn').addEventListener('click', () => {
  // search bar + dropdowns
  searchInput.value = '';
  locationSelect.value = '';
  experienceSelect.value = '';

  // sidebar checkboxes back to their starting state
  document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => {
    cb.checked = cb.defaultChecked;
  });

  // category chips back to "All"
  document.querySelectorAll('.chip').forEach(chip => {
    chip.classList.toggle('active', chip.textContent.trim() === 'All');
  });

  // show every card again and refresh the count
  applyFilters();
});

/* ---------- 3) TOP BAR: SIDEBAR SLIDER, BELL, USER MENU ---------- */
(function () {
  const menuBtn = document.getElementById('menuBtn');
  const bellBtn = document.getElementById('bellBtn');
  const bellDot = document.getElementById('bellDot');
  const notifPanel = document.getElementById('notifPanel');
  const notifCount = document.getElementById('notifCount');
  const markAllBtn = document.getElementById('markAllRead');
  const userBtn = document.getElementById('userBtn');
  const userMenu = document.getElementById('userMenu');

  // tooltips for the icon-only sidebar
  document.querySelectorAll('.nav-item').forEach(a => { a.title = a.textContent.trim(); });

  // Sidebar slider (☰)
  const isMobile = () => window.matchMedia('(max-width: 720px)').matches;

  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    // desktop: collapse/expand, mobile: slide in/out
    document.body.classList.toggle(isMobile() ? 'sidebar-open' : 'sidebar-collapsed');
  });

  // mobile: tap outside the sidebar closes it
  document.addEventListener('click', e => {
    if (document.body.classList.contains('sidebar-open') && !e.target.closest('.sidebar')) {
      document.body.classList.remove('sidebar-open');
    }
  });

  // Dropdowns (bell + user)
  const pairs = [
    [bellBtn, notifPanel],
    [userBtn, userMenu]
  ];

  function closeAll(except) {
    pairs.forEach(([btn, panel]) => {
      if (panel !== except) {
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  pairs.forEach(([btn, panel]) => {
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      closeAll(open ? panel : null);
    });
  });

  // click outside closes dropdowns
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown-wrap')) closeAll(null);
  });

  // Esc closes everything
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAll(null);
      document.body.classList.remove('sidebar-open');
    }
  });

  // Notifications
  function refreshBell() {
    const unread = notifPanel.querySelectorAll('.notif-item.unread').length;
    bellDot.style.display = unread ? '' : 'none';
    notifCount.textContent = unread ? `${unread} new` : 'All caught up';
  }

  notifPanel.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.remove('unread');
      refreshBell();
    });
  });

  markAllBtn.addEventListener('click', () => {
    notifPanel.querySelectorAll('.notif-item').forEach(i => i.classList.remove('unread'));
    refreshBell();
  });

  refreshBell();
})();