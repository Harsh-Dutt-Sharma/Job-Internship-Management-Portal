/* ==========================================================================
   JobPortal - Apply Now Page (applyjs.js)
   - Fetches selected job details by jobId (or company/role) from URL query
   - Renders company logo, job title, company name, location, and type
   - Prefills applicant info from user profile (window.API.getProfile())
   - Validates required inputs cleanly (name, email, 10-digit phone, cgpa, optional resume)
   - Prevents duplicate applications for the SAME candidate
   - Posts complete application payload (role, company, location, date, status, etc.) to JSON Server
   - Seamlessly redirects to applications.html on success
   ========================================================================== */

let currentJob = null;
let currentProfile = null;

// Return appropriate company logo path
function getCompanyLogo(company) {
    if (!company) return "../images/suitcase_logo.png";
    const name = company.toLowerCase().trim();
    if (name.includes("google")) return "../images/google.png";
    if (name.includes("microsoft")) return "../images/microsoft.png";
    if (name.includes("swiggy")) return "../images/swiggy.png";
    if (name.includes("amazon")) return "../images/amazon.png";
    if (name.includes("zomato")) return "../images/zomato.png";
    if (name.includes("adobe")) return "../images/adobe.svg";
    if (name.includes("flipkart")) return "../images/flipkart.svg";
    if (name.includes("uber")) return "../images/uber.svg";
    if (name.includes("infosys")) return "../images/infosys.svg";
    if (name.includes("tcs")) return "../images/tcs.svg";
    if (name.includes("deloitte")) return "../images/deloitte.svg";
    if (name.includes("paytm")) return "../images/paytm.svg";
    return "../images/suitcase_logo.png";
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await loadJobDetailsFromUrl();
        await prefillUserProfile();
    } catch (err) {
        console.warn("Non-fatal loading warning:", err);
    }
    // Always setup the form listener so button click ALWAYS works!
    setupApplicationForm();
});

// Load job details from URL query parameter (jobId=... or company=...&role=...)
async function loadJobDetailsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");
    const companyParam = params.get("company");
    const roleParam = params.get("role");

    if (jobId) {
        try {
            if (window.API && typeof API.getJobById === "function") {
                currentJob = await API.getJobById(jobId);
            } else {
                const res = await fetch(`http://localhost:3000/jobs/${jobId}`);
                if (res.ok) currentJob = await res.json();
            }
        } catch (error) {
            console.warn("Could not fetch job from API:", error);
        }
    }

    // Fallback if not found in API or if company/role were passed directly
    if (!currentJob && (companyParam || roleParam || jobId)) {
        currentJob = {
            id: jobId ? Number(jobId) : null,
            company: companyParam || "Company",
            role: roleParam || "Software Role",
            title: roleParam || "Software Role",
            location: "India",
            type: "Internship"
        };
    }

    displayJobDetails();
}

// Display job title, company, and company logo in top banner
function displayJobDetails() {
    const jobInfo = document.getElementById("selected-job-info");
    const jobTitle = document.getElementById("selected-job-title");
    const jobSub = document.getElementById("selected-job-sub");
    const jobLogo = document.getElementById("selected-job-logo");

    if (!currentJob) return;

    if (jobInfo) {
        jobInfo.style.display = "block";
    }

    const role = currentJob.role || currentJob.title || "Job Position";
    const company = currentJob.company || "Company";
    const location = currentJob.location || "India";
    const type = currentJob.type || "Opportunity";

    if (jobTitle) {
        jobTitle.textContent = role;
    }

    if (jobSub) {
        jobSub.textContent = `${company} • ${location} • ${type}`;
    }

    if (jobLogo) {
        const logoSrc = currentJob.logo || getCompanyLogo(company);
        jobLogo.src = logoSrc;
        jobLogo.alt = `${company} logo`;
    }
}

// Prefill form from student profile if available
async function prefillUserProfile() {
    try {
        if (window.API && typeof API.getProfile === "function") {
            currentProfile = await API.getProfile();
        } else {
            const res = await fetch("http://localhost:3000/profile");
            if (res.ok) currentProfile = await res.json();
        }
    } catch (err) {
        console.warn("Profile fetch error, using fallback:", err);
    }

    const nameInput = document.getElementById("fullname");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const collegeInput = document.getElementById("college");
    const courseInput = document.getElementById("course");
    const cgpaInput = document.getElementById("cgpa");
    const skillsInput = document.getElementById("skills");

    if (currentProfile) {
        if (nameInput && !nameInput.value && currentProfile.name) {
            nameInput.value = currentProfile.name;
        }
        if (emailInput && !emailInput.value && currentProfile.email) {
            emailInput.value = currentProfile.email;
        }
        if (phoneInput && !phoneInput.value && currentProfile.phone) {
            phoneInput.value = currentProfile.phone;
        }
        if (collegeInput && !collegeInput.value && currentProfile.university) {
            collegeInput.value = currentProfile.university;
        }
        if (courseInput && !courseInput.value) {
            courseInput.value = currentProfile.degree ? "B.Tech CSE" : "B.Tech CSE";
        }
        if (cgpaInput && !cgpaInput.value) {
            cgpaInput.value = currentProfile.cgpa || "8.5";
        }
        if (skillsInput && !skillsInput.value && currentProfile.skills) {
            skillsInput.value = Array.isArray(currentProfile.skills) 
                ? currentProfile.skills.join(", ") 
                : currentProfile.skills;
        }
    } else {
        if (courseInput && !courseInput.value) courseInput.value = "B.Tech CSE";
        if (cgpaInput && !cgpaInput.value) cgpaInput.value = "8.5";
    }
}

// Setup Application Form submission
function setupApplicationForm() {
    const form = document.querySelector("form");
    if (!form) {
        console.error("Application form not found.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // 1. Gather form input values
        const name = (document.getElementById("fullname")?.value || "").trim();
        const email = (document.getElementById("email")?.value || "").trim();
        const phone = (document.getElementById("phone")?.value || "").trim();
        const college = (document.getElementById("college")?.value || "").trim();
        const course = (document.getElementById("course")?.value || "").trim() || "B.Tech CSE";
        const cgpa = (document.getElementById("cgpa")?.value || "").trim() || "8.5";
        const skills = (document.getElementById("skills")?.value || "").trim();
        const resumeInput = document.getElementById("resume");
        const coverLetter = (document.getElementById("cover-letter")?.value || "").trim();

        // 2. Validations
        if (name.length < 2) {
            alert("Please enter your full name.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Clean phone number (handles +91, spaces, hyphens)
        const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, "");
        const normalizedPhone = (cleanPhone.length === 12 && cleanPhone.startsWith("91")) 
            ? cleanPhone.slice(2) 
            : cleanPhone;

        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(normalizedPhone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        const cgpaNum = Number(cgpa);
        if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
            alert("CGPA must be a valid number between 0 and 10.");
            return;
        }

        // Handle resume (uploaded file or default named resume)
        let resumeName = `${name.replace(/\s+/g, "_")}_Resume.pdf`;
        if (resumeInput && resumeInput.files && resumeInput.files.length > 0) {
            const file = resumeInput.files[0];
            if (!file.name.toLowerCase().endsWith(".pdf")) {
                alert("Please upload your resume in PDF format.");
                return;
            }
            resumeName = file.name;
        }

        // Disable button to prevent double-clicks
        const submitBtn = form.querySelector(".submit-btn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting Application...";
        }

        // 3. Resolve Job Details
        const jobRole = currentJob ? (currentJob.role || currentJob.title) : "Software Engineer";
        const jobCompany = currentJob ? currentJob.company : "Microsoft";
        const jobLocation = currentJob ? currentJob.location : "Bengaluru, India";
        const jobId = currentJob ? (currentJob.id ? Number(currentJob.id) : null) : null;

        // Today's formatted date
        const today = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

        // 4. Duplicate Check (Check if THIS applicant already applied to THIS job)
        try {
            let existingApps = [];
            if (window.API && typeof API.getApplications === "function") {
                existingApps = await API.getApplications();
            } else {
                const res = await fetch("http://localhost:3000/applications");
                if (res.ok) existingApps = await res.json();
            }

            const isDuplicate = existingApps.some(app => {
                const sameJob = (jobId && app.jobId && app.jobId == jobId) ||
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

            // 5. Construct Complete Application Payload
            const applicationPayload = {
                jobId: jobId,
                userId: (currentProfile && (currentProfile.userId || currentProfile.id)) ? Number(currentProfile.userId || currentProfile.id) : 1,
                role: jobRole,
                company: jobCompany,
                location: jobLocation,
                date: formattedDate,
                status: "In Review",
                applicantName: name,
                email: email,
                phone: normalizedPhone,
                college: college,
                course: course,
                cgpa: cgpaNum,
                skills: skills,
                resume: resumeName,
                coverLetter: coverLetter,
                notes: `Submitted via application form for ${jobRole}. Resume: ${resumeName}`
            };

            // 6. Send POST to JSON Server
            let savedRecord = null;
            if (window.API && typeof API.addApplication === "function") {
                savedRecord = await API.addApplication(applicationPayload);
            } else {
                const postRes = await fetch("http://localhost:3000/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(applicationPayload)
                });
                if (!postRes.ok) throw new Error(`Server returned status: ${postRes.status}`);
                savedRecord = await postRes.json();
            }

            // Also keep localStorage synchronized as local fallback
            try {
                let localApps = JSON.parse(localStorage.getItem("jobportal_applications")) || [];
                const localCopy = { ...applicationPayload, id: savedRecord?.id || Date.now() };
                localApps.unshift(localCopy);
                localStorage.setItem("jobportal_applications", JSON.stringify(localApps));
            } catch (storageErr) {
                console.warn("Storage sync error:", storageErr);
            }

            // 7. Success message & redirect
            alert(`Congratulations, ${name}!\n\nYour application for ${jobRole} at ${jobCompany} has been submitted successfully to the server.`);
            form.reset();

            // Redirect to applications tracking page
            window.location.href = "applications.html";

        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Error submitting application. Please ensure JSON Server is running (npm run server) and try again.");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Application";
            }
        }
    });
}
