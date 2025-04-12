function openNav() {
    document.getElementById("mySidebar").style.left = "0";
}
closeNav();
// Close the sidebar
function closeNav() {
    document.getElementById("mySidebar").style.left = "-400px";
}

// Switch between Login and Registration forms
document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const switchBackToLogin = document.getElementById('switch-back-to-login');
    const switchBackToLoginReset = document.getElementById('switch-back-to-login-reset');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');

    // Show forgot password form
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', () => {
            loginForm.style.display = 'none';
            forgotPasswordForm.style.display = 'block';
        });
    }

    // Switch to registration form
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }

    // Switch back to login form from registration
    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Switch back to login form from forgot password
    if (switchBackToLogin) {
        switchBackToLogin.addEventListener('click', () => {
            forgotPasswordForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Switch back to login form from reset password
    if (switchBackToLoginReset) {
        switchBackToLoginReset.addEventListener('click', () => {
            resetPasswordForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }
});

const passwordInput = document.getElementById('register-password');
const confirmPasswordInput = document.getElementById('register-confirm-password');
const passwordWarning = document.getElementById('password-warning');
const submitButton = document.querySelector('.custom-btn');

// Function to validate password
const validatePassword = () => {
    const password = passwordInput.value;

    // Regular expression for password validation
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;

    // Create warnings
    let warnings = [];
    if (!hasUppercase) warnings.push("an uppercase letter");
    if (!hasLowercase) warnings.push("a lowercase letter");
    if (!hasNumber) warnings.push("a number");
    if (!isLongEnough) warnings.push("at least 8 characters");

    // Show warnings or clear them
    if (warnings.length > 0) {
        passwordWarning.textContent = "Password must contain " + warnings.join(", ") + ".";
        return false; // Invalid password
    } else {
        passwordWarning.textContent = ""; // Clear warnings
        return true; // Valid password
    }
};

// Function to check if passwords match
const validateConfirmPassword = () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        passwordWarning.textContent = "Passwords do not match.";
        return false; // Passwords don't match
    } else if (validatePassword()) {
        passwordWarning.textContent = ""; // Clear warnings
        return true; // Passwords match and are valid
    }
};

// Add event listeners for real-time validation
passwordInput.addEventListener('input', () => {
    const isValidPassword = validatePassword();
    const isValidConfirmPassword = validateConfirmPassword();
    submitButton.disabled = !(isValidPassword && isValidConfirmPassword); // Enable/disable submit button
});

confirmPasswordInput.addEventListener('input', () => {
    const isValidPassword = validatePassword();
    const isValidConfirmPassword = validateConfirmPassword();
    submitButton.disabled = !(isValidPassword && isValidConfirmPassword); // Enable/disable submit button
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'hi,en' }, 'google_translate_element');
}

// ✅ Language Toggle Logic
document.getElementById("languageToggle").addEventListener("click", function () {
    let currentLang = document.documentElement.lang || "en"; // Detect current language
    let newLang = currentLang === "en" ? "hi" : "en"; // Toggle between Hindi & English
    document.documentElement.lang = newLang; // Update language attribute

    // ✅ Change Google Translate Language
    let googleTranslateSelect = document.querySelector(".goog-te-combo");
    if (googleTranslateSelect) {
        googleTranslateSelect.value = newLang;
        googleTranslateSelect.dispatchEvent(new Event("change"));
    }

    // ✅ Toggle Button Icon & Style
    let icon = document.getElementById("languageIcon");
    if (newLang === "hi") {
        icon.className = "bi bi-globe2"; // Change to Hindi Icon
        this.classList.remove("btn-outline-primary");
        this.classList.add("btn-outline-danger");
    } else {
        icon.className = "bi bi-translate"; // Change to English Icon
        this.classList.remove("btn-outline-danger");
        this.classList.add("btn-outline-primary");
    }
});


document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.setAttribute("translate", "no"); // Prevents translation on the entire page
    document.body.setAttribute("translate", "no");

    // Prevent translation for all elements
    document.querySelectorAll("*").forEach((el) => {
        el.setAttribute("translate", "no");
    });

    // Ensure form fields (input, textarea) are not translated
    document.querySelectorAll("input, textarea").forEach((el) => {
        el.setAttribute("autocomplete", "off");
    });

    console.log("🚫 Automatic translation disabled!");
});


