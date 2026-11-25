/* =========================================================
   applyjs.js - JavaScript for apply.html
   Connected to JSON Server REST API (http://localhost:3000)
   - Reads jobId or company/role from URL query parameters
   - Displays selected job information from API
   - Prefills user details from Profile API
   - Validates form fields (name, email, phone, cgpa, resume)
   - Prevents duplicate applications
   - Submits application via API POST to /applications
   ========================================================= */

let currentJob = null;

document.addEventListener("DOMContentLoaded", async function () {
    await loadJobDetailsFromUrl();
    await prefillUserProfile();
    setupApplicationForm();
});

// Read jobId from URL and fetch job details
async function loadJobDetailsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("jobId");
    const companyParam = urlParams.get("company");
    const roleParam = urlParams.get("role");

    const banner = document.getElementById("selected-job-info");
    const titleEl = document.getElementById("selected-job-title");
    const subEl = document.getElementById("selected-job-sub");
    const logoEl = document.getElementById("selected-job-logo");

    if (!banner) return;

    if (jobId) {
        try {
            if (window.API) {
                currentJob = await API.getJobById(jobId);
            } else {
                const res = await fetch(`http://localhost:3000/jobs/${jobId}`);
                if (res.ok) currentJob = await res.json();
            }
        } catch (err) {
            console.warn("Could not fetch job by ID:", err);
        }
    }

    if (!currentJob && (companyParam || roleParam)) {
        currentJob = {
            id: null,
            role: roleParam || "Software Role",
            company: companyParam || "Tech Company",
            location: "India",
            logo: "../images/suitcase_logo.png"
        };
    }

    if (currentJob) {
        banner.style.display = "block";
        const roleTitle = currentJob.role || currentJob.title;
        if (titleEl) titleEl.textContent = roleTitle;
        if (subEl) subEl.textContent = `${currentJob.company} • ${currentJob.location || 'India'} • ${currentJob.type || 'Internship'}`;
        if (logoEl && currentJob.logo) logoEl.src = currentJob.logo;
    }
}

// Prefill form from user profile if available
async function prefillUserProfile() {
    try {
        let profile = null;
        if (window.API) {
            profile = await API.getProfile();
        } else {
            const res = await fetch("http://localhost:3000/profile");
            if (res.ok) profile = await res.json();
        }

        if (profile) {
            const nameInput = document.getElementById("fullname");
            const emailInput = document.getElementById("email");
            const phoneInput = document.getElementById("phone");
            const collegeInput = document.getElementById("college");
            const courseInput = document.getElementById("course");
            const cgpaInput = document.getElementById("cgpa");
            const skillsInput = document.getElementById("skills");

            if (nameInput && !nameInput.value && profile.name) nameInput.value = profile.name;
            if (emailInput && !emailInput.value && profile.email) emailInput.value = profile.email;
            if (phoneInput && !phoneInput.value && profile.phone) phoneInput.value = profile.phone;
            if (collegeInput && !collegeInput.value && profile.university) collegeInput.value = profile.university;
            if (courseInput && !courseInput.value) courseInput.value = profile.degree ? "B.Tech CSE" : "B.Tech CSE";
            if (cgpaInput && !cgpaInput.value) cgpaInput.value = "8.5";
            if (skillsInput && !skillsInput.value && profile.skills) skillsInput.value = profile.skills;
        }
    } catch (err) {
        console.warn("Could not prefill profile:", err);
    }
}

// Handle Form Submission
function setupApplicationForm() {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const college = document.getElementById("college").value.trim();
        const course = document.getElementById("course").value.trim();
        const cgpa = document.getElementById("cgpa").value.trim();
        const skills = document.getElementById("skills").value.trim();
        const resumeFile = document.getElementById("resume").files[0];
        const coverLetter = document.getElementById("cover-letter").value.trim();

        // 1. Validation
        if (name.length < 3) {
            alert("Please enter a valid full name (minimum 3 characters).");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Clean phone number (handles +91, spaces, dashes)
        const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
        const normalizedPhone = (cleanPhone.length === 12 && cleanPhone.startsWith('91')) ? cleanPhone.slice(2) : cleanPhone;
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(normalizedPhone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        const cgpaVal = cgpa ? Number(cgpa) : 8.5;
        if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
            alert("CGPA must be a valid number between 0 and 10.");
            return;
        }

        // Handle resume (use uploaded PDF if present, or assign default resume name)
        let resumeName = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
        if (resumeFile) {
            if (!resumeFile.name.toLowerCase().endsWith(".pdf")) {
                alert("Please upload your resume in PDF format.");
                return;
            }
            resumeName = resumeFile.name;
        }

        const submitBtn = form.querySelector(".submit-btn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting Application...";
        }

        // Job details
        const jobRole = currentJob ? (currentJob.role || currentJob.title) : "General Application";
        const jobCompany = currentJob ? currentJob.company : "JobPortal Partner";
        const jobLocation = currentJob ? currentJob.location : "Bengaluru, India";

        // Today's formatted date
        const today = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

        // 2. Duplicate Check via API (check by applicant email/name so different applicants can apply)
        try {
            let existingApps = [];
            if (window.API) {
                existingApps = await API.getApplications();
            } else {
                const res = await fetch("http://localhost:3000/applications");
                if (res.ok) existingApps = await res.json();
            }

            const isDuplicate = existingApps.some(app => {
                const sameJob = (currentJob && app.jobId && app.jobId == currentJob.id) ||
                    (app.role && app.role.toLowerCase() === jobRole.toLowerCase() && app.company && app.company.toLowerCase() === jobCompany.toLowerCase());
                const sameApplicant = (app.email && email && app.email.toLowerCase() === email.toLowerCase()) ||
                    (app.applicantName && app.applicantName.toLowerCase() === name.toLowerCase());
                return sameJob && sameApplicant;
            });

            if (isDuplicate) {
                alert(`You have already submitted an application for ${jobRole} at ${jobCompany}.`);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Submit Application";
                }
                return;
            }

            // 3. Construct Application Payload
            const applicationPayload = {
                jobId: currentJob ? currentJob.id : null,
                userId: 1,
                role: jobRole,
                company: jobCompany,
                location: jobLocation,
                date: formattedDate,
                status: "In Review",
                applicantName: name,
                email: email,
                phone: normalizedPhone,
                college: college,
                course: course || "B.Tech CSE",
                cgpa: cgpaVal,
                skills: skills,
                resume: resumeName,
                coverLetter: coverLetter,
                notes: `Submitted via application form for ${jobRole}. Resume: ${resumeName}`
            };

            // 4. Send POST request to JSON Server
            if (window.API) {
                await API.addApplication(applicationPayload);
            } else {
                const postRes = await fetch("http://localhost:3000/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(applicationPayload)
                });
                if (!postRes.ok) throw new Error("Failed to post application");
            }

            // Also keep localStorage updated as fallback
            let localApps = JSON.parse(localStorage.getItem("jobportal_applications")) || [];
            applicationPayload.id = Date.now();
            localApps.unshift(applicationPayload);
            localStorage.setItem("jobportal_applications", JSON.stringify(localApps));

            alert(`Congratulations, ${name}! Your application for ${jobRole} at ${jobCompany} has been submitted successfully.`);
            form.reset();

            // Redirect to applications tracking page so student sees their application
            setTimeout(() => {
                window.location.href = "applications.html";
            }, 1000);

        } catch (error) {
            console.error("Error submitting application:", error);
            alert("There was an error saving your application to the server. Please ensure JSON Server is running.");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Application";
            }
        }
    });
}
