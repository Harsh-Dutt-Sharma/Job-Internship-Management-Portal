console.log("Apply JS connected successfully.");

let currentJob = null;
let currentProfile = null;
// start the initialization process when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async function () {

    try {

        await loadJobDetailsFromUrl();

        await prefillUserProfile();

        setupApplicationForm();

    } catch (error) {

        console.error("Initialization Error:", error);

        alert("Something went wrong while loading the page.");

    }

});


// ========================================
// 2. LOAD JOB DETAILS FROM URL
// ========================================

async function loadJobDetailsFromUrl() {

    const params = new URLSearchParams(window.location.search);

    const jobId = params.get("jobId");
    const company = params.get("company");
    const role = params.get("role");

    if (jobId) {

        try {

            currentJob = await API.getJobById(jobId);

        } catch (error) {

            console.error("Job fetching error:", error);

        }

    }

    // Fallback if job is not found in database
    if (!currentJob) {

        currentJob = {
            id: jobId || null,
            company: company || "Company",
            title: role || "Job Position"
        };

    }

    displayJobDetails();

}


// ========================================
// 3. DISPLAY JOB DETAILS
// ========================================

function displayJobDetails() {

    const jobInfo = document.getElementById("selected-job-info");

    const jobTitle = document.getElementById("selected-job-title");

    const jobSub = document.getElementById("selected-job-sub");

    const jobLogo = document.getElementById("selected-job-logo");

    if (jobInfo) {
        jobInfo.style.display = "block";
    }

    const role =
        currentJob.title ||
        currentJob.role ||
        currentJob.position ||
        "Job Position";

    const company =
        currentJob.company ||
        currentJob.companyName ||
        "Company";

    if (jobTitle) {
        jobTitle.textContent = role;
    }

    if (jobSub) {
        jobSub.textContent = company;
    }

    if (jobLogo) {
        jobLogo.textContent = company.charAt(0).toUpperCase();
    }

}


// ========================================
// 4. PREFILL USER PROFILE
// ========================================

async function prefillUserProfile() {

    try {

        currentProfile = await API.getProfile();

        if (!currentProfile) {
            return;
        }

        const name = document.getElementById("fullname");

        const email = document.getElementById("email");

        const phone = document.getElementById("phone");

        const college = document.getElementById("college");

        const skills = document.getElementById("skills");

        if (name) {
            name.value = currentProfile.name || "";
        }

        if (email) {
            email.value = currentProfile.email || "";
        }

        if (phone) {
            phone.value = currentProfile.phone || "";
        }

        if (college) {
            college.value = currentProfile.university || "";
        }

        if (skills) {
            skills.value = Array.isArray(currentProfile.skills)
                ? currentProfile.skills.join(", ")
                : currentProfile.skills || "";
        }

    } catch (error) {

        console.error("Profile loading error:", error);

    }

}


// ========================================
// 5. APPLICATION FORM
// ========================================

function setupApplicationForm() {

    const form = document.querySelector("form");

    if (!form) {

        console.error("Application form not found.");

        return;

    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Get form values

        const name = document.getElementById("fullname").value.trim();

        const email = document.getElementById("email").value.trim();

        const phone = document.getElementById("phone").value.trim();

        const college = document.getElementById("college").value.trim();

        const course = document.getElementById("course").value.trim();

        const cgpa = document.getElementById("cgpa").value.trim();

        const skills = document.getElementById("skills").value.trim();

        const resumeInput = document.getElementById("resume");

        const coverLetter =
            document.getElementById("cover-letter").value.trim();


        // ========================================
        // 6. VALIDATION
        // ========================================

        if (name.length < 3) {

            alert("Please enter a valid full name.");

            return;

        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            alert("Please enter a valid email address.");

            return;

        }

        const phoneDigits = phone.replace(/\D/g, "");

        const validPhone =
            phoneDigits.length === 10 ||
            (phoneDigits.length === 12 && phoneDigits.startsWith("91"));

        if (!validPhone) {

            alert("Please enter a valid 10-digit phone number.");

            return;

        }

        if (!college) {

            alert("Please enter your college name.");

            return;

        }

        if (!course) {

            alert("Please enter your course.");

            return;

        }

        if (cgpa === "") {

            alert("Please enter your CGPA.");

            return;

        }

        const cgpaValue = Number(cgpa);

        if (
            !Number.isFinite(cgpaValue) ||
            cgpaValue < 0 ||
            cgpaValue > 10
        ) {

            alert("CGPA must be between 0 and 10.");

            return;

        }


        // Resume validation

        if (!resumeInput || !resumeInput.files.length) {

            alert("Please upload your resume.");

            return;

        }

        const resumeFile = resumeInput.files[0];

        if (!resumeFile.name.toLowerCase().endsWith(".pdf")) {

            alert("Only PDF resumes are allowed.");

            return;

        }


        // ========================================
        // 7. GET JOB INFORMATION
        // ========================================

        const jobId = currentJob ? currentJob.id : null;

        const jobRole =
            currentJob.title ||
            currentJob.role ||
            currentJob.position ||
            "Job Position";

        const jobCompany =
            currentJob.company ||
            currentJob.companyName ||
            "Company";


        // ========================================
        // 8. GET USER ID
        // ========================================

        const userId = currentProfile
            ? (currentProfile.userId ?? currentProfile.id)
            : null;

        if (userId === null || userId === undefined) {

            alert("User profile not found. Please login again.");

            return;

        }


        // ========================================
        // 9. CHECK DUPLICATE APPLICATION
        // ========================================

        try {

            const existingApps = await API.getApplications();

            const isDuplicate = existingApps.some(function (app) {

                const sameUser = String(app.userId) === String(userId);

                const sameJob =
                    jobId !== null &&
                    jobId !== undefined &&
                    String(app.jobId) === String(jobId);

                const sameRoleAndCompany =
                    app.role &&
                    app.company &&
                    app.role.toLowerCase() === jobRole.toLowerCase() &&
                    app.company.toLowerCase() === jobCompany.toLowerCase();

                return sameUser && (sameJob || sameRoleAndCompany);

            });

            if (isDuplicate) {

                alert("You have already applied for this job.");

                return;

            }


            // ========================================
            // 10. CREATE APPLICATION OBJECT
            // ========================================

            const application = {

                userId: userId,

                jobId: jobId,

                name: name,

                email: email,

                phone: phone,

                college: college,

                course: course,

                cgpa: cgpaValue,

                skills: skills,

                resume: resumeFile.name,

                coverLetter: coverLetter,

                role: jobRole,

                company: jobCompany,

                status: "Pending",

                appliedAt: new Date().toISOString()

            };


            // ========================================
            // 11. SAVE APPLICATION TO JSON SERVER
            // ========================================

            const savedApplication = await API.addApplication(application);

            console.log("Application saved:", savedApplication);


            // ========================================
            // 12. SUCCESS MESSAGE
            // ========================================

            alert("Application submitted successfully!");

            form.reset();

            window.location.href = "applications.html";


        } catch (error) {

            console.error("Application submission error:", error);

            alert("Unable to submit application. Please try again.");

        }

    });

}