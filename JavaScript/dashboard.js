document.addEventListener("DOMContentLoaded", function () {
  // Using DOM to retrieve the elements of the web-page.
  const menuButton = document.querySelector(".menu-btn");
  const notificationButton = document.querySelector(".notification-btn");
  const notificationArea = document.querySelector(".notification");
  const profileArea = document.querySelector(".profile");
  const savedJobsList = document.querySelector(".saved-jobs-list");
  const applicationList = document.querySelector(".application-list");
  const applicationSection = document.querySelector(".recent-applications");
  const sidebarLinks = document.querySelectorAll(".sidebar-action");

  //Helper Message
  function showMessage(message, undoFunction) {
    const oldMessage = document.querySelector(".message-box");
    if (oldMessage) oldMessage.remove();

    const messageBox = document.createElement("div");
    messageBox.className = "message-box";

    const messageText = document.createElement("span");
    messageText.textContent = message;
    messageBox.appendChild(messageText);

    if (undoFunction) {
      const undoButton = document.createElement("button");
      undoButton.textContent = "Undo";
      undoButton.addEventListener("click", function () {
        undoFunction();
        messageBox.remove();
      });
      messageBox.appendChild(undoButton);
    }

    document.body.appendChild(messageBox);
    setTimeout(function () {
      messageBox.remove();
    }, 4000);
  }

  // Simple popup window
  function openPopup(title, content) {
    closePopup();

    const cover = document.createElement("div");
    cover.className = "popup-cover";

    const popup = document.createElement("div");
    popup.className = "popup-box";

    const heading = document.createElement("div");
    heading.className = "popup-heading";

    const popupTitle = document.createElement("h2");
    popupTitle.textContent = title;

    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Close popup");
    closeButton.addEventListener("click", closePopup);

    heading.append(popupTitle, closeButton);
    popup.append(heading, content);
    cover.appendChild(popup);
    document.body.appendChild(cover);

    cover.addEventListener("click", function (event) {
      if (event.target === cover) closePopup();
    });
  }

  function closePopup() {
    const cover = document.querySelector(".popup-cover");
    if (cover) cover.remove();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePopup();
  });

  // 1. Collapse or expand the sidebar
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      document.body.classList.toggle("small-sidebar");
    });
  }

  // 2. Notifications dropdown
  if (notificationButton) {
    notificationButton.addEventListener("click", function (event) {
      event.stopPropagation();
      const oldPanel = document.querySelector(".notification-menu");
      if (oldPanel) {
        oldPanel.remove();
        return;
      }

      closeMenus();
      const panel = document.createElement("div");
      panel.className = "notification-menu";
      panel.innerHTML = `
        <div class="menu-heading">
          <strong>Notifications</strong>
          <button type="button" class="read-notifications">Mark as read</button>
        </div>
        <div class="notice-item">
          <strong>Application update</strong>
          <p>Your Google application is shortlisted.</p>
          <small>Demo notification</small>
        </div>
        <div class="notice-item">
          <strong>Profile reminder</strong>
          <p>Keep your profile information updated.</p>
          <small>Demo reminder</small>
        </div>`;

      notificationArea.appendChild(panel);
      panel
        .querySelector(".read-notifications")
        .addEventListener("click", function () {
          const dot = document.querySelector(".notification-dot");
          if (dot) dot.style.display = "none";
          panel.querySelectorAll(".notice-item").forEach(function (item) {
            item.style.opacity = "0.6";
          });
          showMessage("Notifications marked as read.");
        });
    });
  }

  // Close the header menus when the user clicks somewhere else
  function closeMenus() {
    document
      .querySelectorAll(".notification-menu, .profile-menu")
      .forEach(function (menu) {
        menu.remove();
      });
  }

  document.addEventListener("click", function (event) {
    if (
      !event.target.closest(".notification") &&
      !event.target.closest(".profile")
    ) {
      closeMenus();
    }
  });

  // 3. Profile menu and profile name editing
  let profileName = localStorage.getItem("jobPortalName") || "Isha Rana";

  function updateName(name) {
    profileName = name.trim() || "Isha Rana";
    localStorage.setItem("jobPortalName", profileName);

    const nameElement = document.querySelector(".profile .name");
    const initials = document.querySelector(".profile-icon");
    const welcome = document.querySelector(".dashboard-heading p");
    const bannerTitle = document.querySelector(".motivation-content h2");
    const firstName = profileName.split(" ")[0];

    if (nameElement) nameElement.textContent = profileName;
    if (initials) {
      initials.textContent = profileName
        .split(" ")
        .map(function (part) {
          return part.charAt(0);
        })
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    if (welcome)
      welcome.textContent =
        "Welcome back, " + firstName + "! Here's your application overview.";
    if (bannerTitle) bannerTitle.textContent = "Keep Going, " + firstName + "!";
  }

  updateName(profileName);

  function openProfileForm() {
    const content = document.createElement("div");
    content.className = "popup-content";
    content.innerHTML = `
      <p>Change the name shown on your dashboard.</p>
      <form class="profile-form">
        <label for="profile-name-input">Your name</label>
        <input id="profile-name-input" type="text" maxlength="50" required>
        <button type="submit">Save changes</button>
      </form>`;
    content.querySelector("input").value = profileName;
    content.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      updateName(content.querySelector("input").value);
      closePopup();
      showMessage("Profile name updated.");
    });
    openPopup("My Profile", content);
  }

  function openSettings() {
    const content = document.createElement("div");
    content.className = "popup-content";
    content.innerHTML = `
      <p>These are demo settings saved in this browser.</p>
      <form class="settings-form">
        <label><input type="checkbox" name="emailAlerts"> Email notifications</label>
        <label><input type="checkbox" name="jobAlerts"> Application status alerts</label>
        <button type="submit">Save settings</button>
      </form>`;

    const settings = JSON.parse(
      localStorage.getItem("jobPortalSettings") ||
        '{"emailAlerts":true,"jobAlerts":true}',
    );
    content.querySelector('[name="emailAlerts"]').checked =
      settings.emailAlerts;
    content.querySelector('[name="jobAlerts"]').checked = settings.jobAlerts;

    content.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      const newSettings = {
        emailAlerts: content.querySelector('[name="emailAlerts"]').checked,
        jobAlerts: content.querySelector('[name="jobAlerts"]').checked,
      };
      localStorage.setItem("jobPortalSettings", JSON.stringify(newSettings));
      closePopup();
      showMessage("Settings saved.");
    });
    openPopup("Settings", content);
  }

  function showProfileMenu() {
    closeMenus();
    const menu = document.createElement("div");
    menu.className = "profile-menu";
    menu.innerHTML = `
      <p><strong>${profileName}</strong><br><small>Job seeker · Demo account</small></p>
      <button type="button" class="view-profile">View profile</button>
      <button type="button" class="open-settings">Settings</button>
      <button type="button" class="logout-button">Logout</button>`;
    profileArea.appendChild(menu);
    menu
      .querySelector(".view-profile")
      .addEventListener("click", openProfileForm);
    menu
      .querySelector(".open-settings")
      .addEventListener("click", openSettings);
    menu.querySelector(".logout-button").addEventListener("click", function () {
      closeMenus();
      const confirmLogout = confirm(
        "This is a demo, so no real account will be logged out. Continue?",
      );
      if (confirmLogout)
        showMessage("Demo logout selected. Real logout needs a backend.");
    });
  }

  if (profileArea) {
    profileArea.style.cursor = "pointer";
    profileArea.addEventListener("click", function (event) {
      if (event.target.closest(".profile-menu")) return;
      event.stopPropagation();
      if (profileArea.querySelector(".profile-menu")) closeMenus();
      else showProfileMenu();
    });
  }

  // 4. Saved jobs are stored in localStorage so they stay after refresh
  function makeJobId(title, company) {
    return (title + "-" + company).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  let savedJobs = [];
  const oldSavedJobs = localStorage.getItem("jobPortalSavedJobs");

  if (oldSavedJobs) {
    try {
      savedJobs = JSON.parse(oldSavedJobs);
    } catch (error) {
      savedJobs = [];
    }
  } else if (savedJobsList) {
    savedJobsList.querySelectorAll(".job-card").forEach(function (card) {
      const title = card.querySelector(".job-info h3").textContent.trim();
      const companyAndLocation = card
        .querySelector(".company-location")
        .textContent.split("•");
      savedJobs.push({
        id: makeJobId(title, companyAndLocation[0].trim()),
        title: title,
        company: companyAndLocation[0].trim(),
        location: (companyAndLocation[1] || "India").trim(),
        date: card.querySelector(".saved-date .date").textContent.trim(),
      });
    });
    saveJobs();
  }

  function saveJobs() {
    localStorage.setItem("jobPortalSavedJobs", JSON.stringify(savedJobs));
  }

  function showSavedJobs() {
    if (!savedJobsList) return;
    savedJobsList.innerHTML = "";

    if (savedJobs.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = "You have no saved jobs right now.";
      savedJobsList.appendChild(emptyMessage);
      const browseButton = document.createElement("button");
      browseButton.className = "simple-button";
      browseButton.textContent = "Browse demo jobs";
      browseButton.addEventListener("click", showBrowseJobs);
      savedJobsList.appendChild(browseButton);
      return;
    }

    savedJobs.forEach(function (job) {
      const card = document.createElement("div");
      card.className = "job-card";
      const info = document.createElement("div");
      info.className = "job-info";
      const title = document.createElement("h3");
      title.className = "job-role";
      title.textContent = job.title;
      const company = document.createElement("p");
      company.className = "company-location";
      company.textContent = job.company + " • " + job.location;
      info.append(title, company);

      const date = document.createElement("div");
      date.className = "saved-date";
      date.innerHTML = "<span class='date-label'>Saved on</span>";
      const dateText = document.createElement("span");
      dateText.className = "date";
      dateText.textContent = job.date;
      date.appendChild(dateText);

      const removeButton = document.createElement("button");
      removeButton.className = "save-icon";
      removeButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
      removeButton.setAttribute("aria-label", "Remove saved job");
      removeButton.addEventListener("click", function () {
        const removedJob = job;
        savedJobs = savedJobs.filter(function (savedJob) {
          return savedJob.id !== job.id;
        });
        saveJobs();
        showSavedJobs();
        showMessage(job.title + " removed from saved jobs.", function () {
          savedJobs.push(removedJob);
          saveJobs();
          showSavedJobs();
        });
      });

      card.append(info, date, removeButton);
      savedJobsList.appendChild(card);
    });
  }

  const demoJobs = [
    {
      title: "Frontend Developer Intern",
      company: "Acme Technologies",
      location: "Noida, India",
    },
    {
      title: "Python Developer Intern",
      company: "Nova Labs",
      location: "Remote, India",
    },
    {
      title: "Data Analyst Intern",
      company: "Orbit Analytics",
      location: "Bengaluru, India",
    },
    {
      title: "UI/UX Design Intern",
      company: "Pixel Works",
      location: "Gurugram, India",
    },
  ];

  function showBrowseJobs() {
    const content = document.createElement("div");
    content.className = "popup-content";
    const intro = document.createElement("p");
    intro.textContent =
      "These are sample jobs for this project, not live vacancies.";
    content.appendChild(intro);

    demoJobs.forEach(function (job) {
      const row = document.createElement("div");
      row.className = "browse-job-row";
      const details = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = job.title;
      const company = document.createElement("p");
      company.textContent = job.company + " · " + job.location;
      details.append(title, company);

      const button = document.createElement("button");
      const jobId = makeJobId(job.title, job.company);
      const alreadySaved = savedJobs.some(function (item) {
        return item.id === jobId;
      });
      button.textContent = alreadySaved ? "Saved" : "Save job";
      button.disabled = alreadySaved;
      button.addEventListener("click", function () {
        savedJobs.push({
          id: jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        });
        saveJobs();
        showSavedJobs();
        closePopup();
        showMessage(job.title + " saved successfully.");
      });
      row.append(details, button);
      content.appendChild(row);
    });
    openPopup("Browse Jobs", content);
  }

  if (savedJobsList) {
    showSavedJobs();
    document.querySelectorAll(".saved-jobs .view-all").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        showMessage("You have " + savedJobs.length + " saved jobs.");
      });
    });
  }

  // 5. Search applications and filter by status
  let currentStatus = "all";
  let searchText = "";
  let filterBox;

  function addApplicationFilters() {
    if (filterBox || !applicationSection) return;
    filterBox = document.createElement("div");
    filterBox.className = "application-filters";

    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.placeholder = "Search job or company...";
    searchInput.setAttribute("aria-label", "Search applications");
    searchInput.addEventListener("input", function () {
      searchText = searchInput.value.toLowerCase().trim();
      filterApplications();
    });

    const statusSelect = document.createElement("select");
    statusSelect.setAttribute("aria-label", "Filter by application status");
    statusSelect.innerHTML = `
      <option value="all">All statuses</option>
      <option value="shortlisted">Shortlisted</option>
      <option value="in-review">In Review</option>
      <option value="rejected">Rejected</option>`;
    statusSelect.value = currentStatus;
    statusSelect.addEventListener("change", function () {
      currentStatus = statusSelect.value;
      filterApplications();
    });

    filterBox.append(searchInput, statusSelect);
    const header = applicationSection.querySelector(".section-header");
    header.insertAdjacentElement("afterend", filterBox);
    filterApplications();
  }

  function filterApplications() {
    if (!applicationList) return;
    const rows = applicationList.querySelectorAll(".application");
    let visibleCount = 0;

    rows.forEach(function (row) {
      const status = row.querySelector(".application-status");
      let rowStatus = "all";
      if (status.classList.contains("shortlisted")) rowStatus = "shortlisted";
      if (status.classList.contains("in-review")) rowStatus = "in-review";
      if (status.classList.contains("rejected")) rowStatus = "rejected";

      const matchesStatus =
        currentStatus === "all" || currentStatus === rowStatus;
      const matchesSearch = row.textContent.toLowerCase().includes(searchText);
      const shouldShow = matchesStatus && matchesSearch;
      row.style.display = shouldShow ? "grid" : "none";
      if (shouldShow) visibleCount++;
    });

    let countText = document.querySelector(".application-count");
    if (!countText && filterBox) {
      countText = document.createElement("p");
      countText.className = "application-count";
      filterBox.appendChild(countText);
    }
    if (countText)
      countText.textContent =
        "Showing " +
        visibleCount +
        " of " +
        rows.length +
        " recent applications";

    let emptyText = applicationList.querySelector(".empty-applications");
    if (visibleCount === 0) {
      if (!emptyText) {
        emptyText = document.createElement("p");
        emptyText.className = "empty-applications";
        emptyText.textContent =
          "No applications found. Try another search or status.";
        applicationList.appendChild(emptyText);
      }
    } else if (emptyText) {
      emptyText.remove();
    }
  }

  function filterByStatus(status) {
    currentStatus = status;
    addApplicationFilters();
    const select = filterBox.querySelector("select");
    select.value = status;
    filterApplications();
    applicationSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".summary-card").forEach(function (card) {
    card.style.cursor = "pointer";
    card.addEventListener("click", function () {
      if (card.classList.contains("shortlisted-card"))
        filterByStatus("shortlisted");
      else if (card.classList.contains("review-card"))
        filterByStatus("in-review");
      else if (card.classList.contains("rejected-card"))
        filterByStatus("rejected");
      else filterByStatus("all");
    });
  });

  document
    .querySelectorAll(".recent-applications .view-all, .applications-button")
    .forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        filterByStatus("all");
      });
    });

  // 6. Sidebar items take the user to the matching dashboard section
  sidebarLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      sidebarLinks.forEach(function (item) {
        item.classList.remove("active");
      });
      link.classList.add("active");

      const label = link.querySelector(".action-name").textContent.trim();
      if (label === "Dashboard")
        document
          .querySelector(".dashboard-heading")
          .scrollIntoView({ behavior: "smooth" });
      if (label === "My Applications") filterByStatus("all");
      if (label === "Saved Jobs")
        document
          .querySelector(".saved-jobs")
          .scrollIntoView({ behavior: "smooth" });
      if (label === "Alerts") notificationButton.click();
      if (label === "Profile") openProfileForm();
      if (label === "Settings") openSettings();
      if (label === "Logout") {
        if (
          confirm(
            "This is a demo. No real account will be logged out. Continue?",
          )
        )
          showMessage("Demo logout selected.");
      }
    });
  });

  // 7. Browse jobs and help centre buttons
  const browseButton = document.querySelector(".browse-jobs-button");
  if (browseButton) {
    browseButton.addEventListener("click", function (event) {
      event.preventDefault();
      showBrowseJobs();
    });
  }

  const helpButton = document.querySelector(".help-button");
  if (helpButton) {
    helpButton.addEventListener("click", function (event) {
      event.preventDefault();
      const content = document.createElement("div");
      content.className = "popup-content";
      content.innerHTML = `
        <p>This is a front-end class project. Try these interactions:</p>
        <ul>
          <li>Click a summary card to filter applications.</li>
          <li>Use View All Applications to search and filter.</li>
          <li>Click a bookmark to remove a saved job and use Undo.</li>
          <li>Use Browse Jobs to add a sample job.</li>
          <li>Open your profile to change the display name.</li>
        </ul>
        <p>Real applications and account login would need a backend.</p>`;
      openPopup("JobPortal Help Center", content);
    });
  }
});
