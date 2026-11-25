/* ==========================================================================
   JobPortal - Settings JavaScript (settings.js)
   Handles:
   - Load and save notification preferences via JSON Server API (http://localhost:3000/settings)
   - Load and save display preferences
   - Synchronize profile information with API (http://localhost:3000/profile)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async function() {
  await loadSettings();
  setupSettingsHandlers();
});

// Load settings from JSON Server REST API
async function loadSettings() {
  let profile = null;
  let settings = null;

  try {
    if (window.API) {
      [profile, settings] = await Promise.all([
        API.getProfile(),
        API.getSettings()
      ]);
    }
  } catch (err) {
    console.warn("Could not fetch settings from API, using fallback:", err);
  }

  if (!profile) profile = getProfile();

  // Populate profile fields
  const nameInput = document.getElementById("settings-name");
  const emailInput = document.getElementById("settings-email");
  const phoneInput = document.getElementById("settings-phone");
  const locInput = document.getElementById("settings-location");

  if (nameInput) nameInput.value = profile.name || "";
  if (emailInput) emailInput.value = profile.email || "";
  if (phoneInput) phoneInput.value = profile.phone || "";
  if (locInput) locInput.value = profile.location || "";

  // Load preferences from API or local fallback
  if (!settings) {
    const saved = localStorage.getItem("jobportal_settings");
    settings = saved ? JSON.parse(saved) : {};
  }

  const statusChk = document.getElementById("pref-status-updates");
  const recChk = document.getElementById("pref-recommendations");
  const digestChk = document.getElementById("pref-email-digest");
  const densitySelect = document.getElementById("pref-display-density");
  const landingSelect = document.getElementById("pref-landing-page");

  if (statusChk && settings.statusUpdates !== undefined) statusChk.checked = settings.statusUpdates;
  if (recChk && settings.recommendations !== undefined) recChk.checked = settings.recommendations;
  if (digestChk && settings.emailDigest !== undefined) digestChk.checked = settings.emailDigest;
  if (densitySelect && settings.density) densitySelect.value = settings.density;
  if (landingSelect && settings.landing) landingSelect.value = settings.landing;
}

// Setup handlers with API updates
function setupSettingsHandlers() {
  const form = document.getElementById("settings-profile-form");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("settings-name").value.trim();
    const email = document.getElementById("settings-email").value.trim();
    const phone = document.getElementById("settings-phone").value.trim();
    const location = document.getElementById("settings-location").value.trim();

    if (!name || !email || !phone || !location) {
      showToast("Please fill in all required profile fields.", "error");
      return;
    }

    const saveBtn = document.getElementById("save-settings-btn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    // Update profile
    const parts = name.split(" ");
    let initials = "IR";
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
      initials = parts[0][0].toUpperCase();
    }

    const profileUpdates = {
      name: name,
      initials: initials,
      email: email,
      phone: phone,
      location: location
    };

    // Save preferences
    const settingsUpdates = {
      statusUpdates: document.getElementById("pref-status-updates").checked,
      recommendations: document.getElementById("pref-recommendations").checked,
      emailDigest: document.getElementById("pref-email-digest").checked,
      density: document.getElementById("pref-display-density").value,
      landing: document.getElementById("pref-landing-page").value
    };

    try {
      if (window.API) {
        await Promise.all([
          API.updateProfile(profileUpdates),
          API.updateSettings(settingsUpdates)
        ]);
      }

      // Also cache in localStorage
      localStorage.setItem("jobportal_settings", JSON.stringify(settingsUpdates));
      let currentLocalProfile = getProfile();
      localStorage.setItem("jobportal_profile", JSON.stringify({ ...currentLocalProfile, ...profileUpdates }));

      // Sync header
      if (typeof syncHeaderProfile === "function") {
        await syncHeaderProfile();
      }

      showToast("Settings and profile preferences saved successfully!", "success");
    } catch (error) {
      console.error("Error saving settings to API:", error);
      showToast("Failed to save settings to server.", "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save All Settings';
      }
    }
  });
}
