/* ==========================================================================
   JobPortal - Settings JavaScript (settings.js)
   Handles:
   - Load and save notification preferences in localStorage
   - Load and save display preferences
   - Synchronize profile information
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  loadSettings();
  setupSettingsHandlers();
});

// Load settings from localStorage
function loadSettings() {
  const profile = getProfile();

  // Populate profile fields
  const nameInput = document.getElementById("settings-name");
  const emailInput = document.getElementById("settings-email");
  const phoneInput = document.getElementById("settings-phone");
  const locInput = document.getElementById("settings-location");

  if (nameInput) nameInput.value = profile.name || "";
  if (emailInput) emailInput.value = profile.email || "";
  if (phoneInput) phoneInput.value = profile.phone || "";
  if (locInput) locInput.value = profile.location || "";

  // Load preferences from localStorage or default
  const savedSettings = localStorage.getItem("jobportal_settings");
  if (savedSettings) {
    const s = JSON.parse(savedSettings);
    const statusChk = document.getElementById("pref-status-updates");
    const recChk = document.getElementById("pref-recommendations");
    const digestChk = document.getElementById("pref-email-digest");
    const densitySelect = document.getElementById("pref-display-density");
    const landingSelect = document.getElementById("pref-landing-page");

    if (statusChk && s.statusUpdates !== undefined) statusChk.checked = s.statusUpdates;
    if (recChk && s.recommendations !== undefined) recChk.checked = s.recommendations;
    if (digestChk && s.emailDigest !== undefined) digestChk.checked = s.emailDigest;
    if (densitySelect && s.density) densitySelect.value = s.density;
    if (landingSelect && s.landing) landingSelect.value = s.landing;
  }
}

// Setup handlers
function setupSettingsHandlers() {
  const form = document.getElementById("settings-profile-form");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("settings-name").value.trim();
    const email = document.getElementById("settings-email").value.trim();
    const phone = document.getElementById("settings-phone").value.trim();
    const location = document.getElementById("settings-location").value.trim();

    if (!name || !email || !phone || !location) {
      showToast("Please fill in all required profile fields.", "error");
      return;
    }

    // Update profile
    const profile = getProfile();
    profile.name = name;
    profile.email = email;
    profile.phone = phone;
    profile.location = location;

    const parts = name.split(" ");
    if (parts.length >= 2) {
      profile.initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
      profile.initials = parts[0][0].toUpperCase();
    }

    saveProfile(profile);

    // Save preferences
    const settings = {
      statusUpdates: document.getElementById("pref-status-updates").checked,
      recommendations: document.getElementById("pref-recommendations").checked,
      emailDigest: document.getElementById("pref-email-digest").checked,
      density: document.getElementById("pref-display-density").value,
      landing: document.getElementById("pref-landing-page").value
    };

    localStorage.setItem("jobportal_settings", JSON.stringify(settings));

    // Sync header
    syncHeaderProfile();

    showToast("Settings and profile preferences saved successfully!", "success");
  });
}

