/* ==========================================================================
   JobPortal - User Profile JavaScript (profile.js)
   Handles:
   - Display profile details from JSON Server REST API (http://localhost:3000/profile)
   - Form population & editing for Name, Email, Phone, Location, Skills
   - Form validation & saving to API via PATCH
   - Synchronization of header greeting & name across all pages
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async function() {
  await loadProfileData();
  setupProfileForm();
});

// Load and populate profile fields from API
async function loadProfileData() {
  let profile = null;
  try {
    if (window.API && typeof API.getProfile === "function") {
      profile = await API.getProfile();
    }
  } catch (err) {
    console.warn("Could not fetch profile from API, using fallback:", err);
  }

  if (!profile || !profile.name) {
    profile = getProfile();
  }

  // Overview card
  const avatarLarge = document.getElementById("avatar-large");
  const viewName = document.getElementById("view-name");
  const viewHeadline = document.getElementById("view-headline");
  const viewLocation = document.getElementById("view-location");
  const viewEmail = document.getElementById("view-email");
  const viewPhone = document.getElementById("view-phone");
  const skillsContainer = document.getElementById("skills-tags-container");

  if (avatarLarge) avatarLarge.textContent = profile.initials || "IR";
  if (viewName) viewName.textContent = profile.name;
  if (viewHeadline) viewHeadline.textContent = profile.headline || "Aspiring Developer";
  if (viewLocation) viewLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${profile.location || 'Bengaluru, India'}`;
  if (viewEmail) viewEmail.textContent = profile.email;
  if (viewPhone) viewPhone.textContent = profile.phone;

  // Render skills tags
  if (skillsContainer) {
    const skillsList = profile.skills ? profile.skills.split(",").map(s => s.trim()) : [];
    skillsContainer.innerHTML = skillsList.map(skill => `<span class="skill-tag">${skill}</span>`).join("");
  }

  // Populate form fields
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const phoneInput = document.getElementById("profile-phone");
  const locInput = document.getElementById("profile-location-input");
  const headlineInput = document.getElementById("profile-headline-input");
  const skillsInput = document.getElementById("profile-skills");

  if (nameInput) nameInput.value = profile.name || "";
  if (emailInput) emailInput.value = profile.email || "";
  if (phoneInput) phoneInput.value = profile.phone || "";
  if (locInput) locInput.value = profile.location || "";
  if (headlineInput) headlineInput.value = profile.headline || "";
  if (skillsInput) skillsInput.value = profile.skills || "";
}

// Setup form submit handler with API PATCH
function setupProfileForm() {
  const form = document.getElementById("profile-edit-form");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("profile-name").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const phone = document.getElementById("profile-phone").value.trim();
    const location = document.getElementById("profile-location-input").value.trim();
    const headline = document.getElementById("profile-headline-input").value.trim();
    const skills = document.getElementById("profile-skills").value.trim();

    // Basic validation
    if (!name || !email || !phone || !location) {
      showToast("Please fill in all required fields (Name, Email, Phone, Location).", "error");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    // Compute initials from name
    const parts = name.split(" ");
    let initials = "IR";
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
      initials = parts[0][0].toUpperCase();
    }

    const updatedProfile = {
      name: name,
      initials: initials,
      email: email,
      phone: phone,
      location: location,
      headline: headline || "Student / Job Seeker",
      skills: skills
    };

    try {
      if (window.API && typeof API.updateProfile === "function") {
        await API.updateProfile(updatedProfile);
      } else {
        saveProfile(updatedProfile);
      }

      // Also update localStorage as cache
      localStorage.setItem("jobportal_profile", JSON.stringify(updatedProfile));

      // Sync header on this page
      if (typeof syncHeaderProfile === "function") {
        await syncHeaderProfile();
      }

      // Re-populate view
      await loadProfileData();

      showToast("Profile details updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to save profile on server.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Profile';
      }
    }
  });
}
