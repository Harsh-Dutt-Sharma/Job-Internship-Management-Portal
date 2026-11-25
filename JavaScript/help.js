/* ==========================================================================
   JobPortal - Help Center JavaScript (help.js)
   Handles:
   - Interactive FAQ accordion toggle
   - Contact Support form validation
   - Pre-fills student information dynamically from JSON Server API
   - Simulated message submission with feedback toast & inline confirmation
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async function() {
  setupAccordion();
  await setupContactForm();
});

// Setup FAQ Accordion expand / collapse
function setupAccordion() {
  const items = document.querySelectorAll(".accordion-item");

  items.forEach(item => {
    const header = item.querySelector(".accordion-header");
    if (!header) return;

    header.addEventListener("click", function() {
      const wasActive = item.classList.contains("active");

      // Close other items
      items.forEach(i => i.classList.remove("active"));

      // Toggle current item
      if (!wasActive) {
        item.classList.add("active");
      }
    });
  });
}

// Setup Contact Form
async function setupContactForm() {
  const form = document.getElementById("help-contact-form");
  if (!form) return;

  // Pre-fill profile name & email if available from API
  let profile = null;
  try {
    if (window.API && typeof API.getProfile === "function") {
      profile = await API.getProfile();
    }
  } catch (err) {
    console.warn("Could not fetch profile for help form:", err);
  }

  if (!profile) profile = getProfile();

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");

  if (nameInput && profile && profile.name) nameInput.value = profile.name;
  if (emailInput && profile && profile.email) emailInput.value = profile.email;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const subject = document.getElementById("contact-subject").value;
    const message = document.getElementById("contact-message").value.trim();

    // Basic validation
    if (!name || !email || !message) {
      showToast("Please complete all required fields before submitting.", "error");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // Success response
    showToast("Your inquiry has been submitted! Our support team will reply soon.", "success");

    // Replace form with confirmation box
    const card = form.closest(".contact-card");
    if (card) {
      card.innerHTML = `
        <div style="text-align: center; padding: 24px 10px;">
          <div style="width: 52px; height: 52px; background: #e8f8ed; color: #159447; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3 style="font-size: 17px; font-weight: bold; color: #111827; margin-bottom: 8px;">Inquiry Received!</h3>
          <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 18px;">
            Thank you, <strong>${name}</strong>. Your inquiry regarding <em>"${subject}"</em> has been logged. Our student support team typically responds within 24 hours.
          </p>
          <button type="button" class="btn btn-secondary" id="send-another-btn">
            Send Another Message
          </button>
        </div>
      `;

      const sendAnotherBtn = card.querySelector("#send-another-btn");
      if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener("click", function() {
          window.location.reload();
        });
      }
    }
  });
}
