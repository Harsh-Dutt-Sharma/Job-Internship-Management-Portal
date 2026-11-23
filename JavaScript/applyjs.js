const form = document.querySelector("form");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("fullname").value.trim();

    const email = document.getElementById("email").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const college = document.getElementById("college").value.trim();

    const course = document.getElementById("course").value.trim();

    const cgpa = document.getElementById("cgpa").value;

    const skills = document.getElementById("skills").value.trim();

    const resume = document.getElementById("resume").files[0];

    const coverLetter = document.getElementById("cover-letter").value.trim();

    if (name.length < 3) {
        alert("Please enter a valid full name.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        return;
    }

    if (cgpa === "" || isNaN(Number(cgpa)) || Number(cgpa) < 0 || Number(cgpa) > 10) {
        alert("CGPA must be between 0 and 10.");
        return;
    }

    if (!resume || resume.type !== "application/pdf") {
        alert("Please upload your resume in PDF format.");
        return;
    }

    const formData = {

        name: name,
        email: email,
        phone: phone,
        college: college,
        course: course,
        cgpa: Number(cgpa),
        skills: skills,
        resume: resume.name,
        coverLetter: coverLetter,
        submittedAt: new Date().toISOString()

    };

    const jsonData = JSON.stringify(formData, null, 2);

    let applications = JSON.parse(localStorage.getItem("applications")) || [];

    applications.push(formData);

    localStorage.setItem("applications", JSON.stringify(applications));

    console.log("Application submitted successfully!");
    console.log(jsonData);

    console.log("All Applications:", applications);


    alert("Congratulations! Your application has been submitted successfully.");

    form.reset();

});