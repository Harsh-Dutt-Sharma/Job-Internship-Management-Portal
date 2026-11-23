console.log("JavaScript file is linked successfully.");

const form = document.querySelector("form");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.querySelector('input[type="text"]').value.trim();

    const email = document.querySelector('input[type="email"]').value.trim();

    const phone = document.querySelector('input[type="tel"]').value.trim();

    // const cgpa = document.querySelectorAll('input[type="number"]')[2].value.trim();
    const cgpa = document.getElementById("cgpa").value;

    const resume = document.querySelector('input[type="file"]').files[0];

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

   if (cgpa !== "" && (Number(cgpa) < 0 || Number(cgpa) > 10 || isNaN(cgpa))) {
    alert("CGPA must be between 0 and 10");
    return;
}


    if (!resume || resume.type !== "application/pdf") {
        alert("Please upload your resume in PDF format.");
        return;
    }

    alert("Congratulations! Your application has been submitted successfully.");

    form.reset();

});