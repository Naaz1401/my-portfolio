// ============================================
// DREAMY PASTEL PORTFOLIO - INTERACTIONS
// ============================================

"use strict";

// 1. Set the current year in the footer.
const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// 2. Dark/light mode toggle.
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.querySelector(".theme-toggle-label");
const rootElement = document.documentElement;

function applyTheme(theme) {
    // Set the theme on the root HTML element. CSS variables update automatically.
    rootElement.setAttribute("data-theme", theme);

    const isDark = theme === "dark";

    // Update the icon, label, and accessible description.
    if (themeIcon) {
        themeIcon.textContent = isDark ? "☀" : "☾";
    }

    if (themeLabel) {
        themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    }

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    }
}

// Restore the user's saved theme, or use the device preference.
let savedTheme = null;

try {
    savedTheme = localStorage.getItem("portfolio-theme");
} catch (error) {
    // The site still works if browser storage is unavailable.
}

const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const currentTheme = rootElement.getAttribute("data-theme") || "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        applyTheme(nextTheme);

        try {
            localStorage.setItem("portfolio-theme", nextTheme);
        } catch (error) {
            // Theme switching still works for this page view.
        }
    });
}

// 3. Animated typing text in the hero section.
const typingText = document.getElementById("typingText");
const phrases = [
    "web development",
    "Java & problem-solving",
    "creative interfaces",
    "learning new things"
];

let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeNextCharacter() {
    if (!typingText) return;

    const currentPhrase = phrases[phraseIndex];

    if (!deleting) {
        // Add one character at a time.
        characterIndex++;
        typingText.textContent = currentPhrase.slice(0, characterIndex);

        // Pause after the complete phrase, then start deleting.
        if (characterIndex === currentPhrase.length) {
            deleting = true;
            window.setTimeout(typeNextCharacter, 1200);
            return;
        }
    } else {
        // Remove one character at a time.
        characterIndex--;
        typingText.textContent = currentPhrase.slice(0, characterIndex);

        // Move to the next phrase after deleting the current one.
        if (characterIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }
    }

    window.setTimeout(typeNextCharacter, deleting ? 45 : 85);
}

// Respect reduced-motion preferences by displaying one static phrase.
const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typingText) {
    if (reducedMotion) {
        typingText.textContent = phrases[0];
        const cursor = document.querySelector(".typing-cursor");
        if (cursor) cursor.hidden = true;
    } else {
        typingText.textContent = "";
        typeNextCharacter();
    }
}

// 4. Scroll reveal animations using IntersectionObserver.
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");

                    // Stop observing once the element has appeared.
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    revealElements.forEach(function (element) {
        revealObserver.observe(element);
    });
} else {
    // Fallback for older browsers: show every section immediately.
    revealElements.forEach(function (element) {
        element.classList.add("is-visible");
    });
}

// 5. Contact form validation.
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    subject: document.getElementById("subject"),
    message: document.getElementById("message")
};

const errorElements = {
    name: document.getElementById("nameError"),
    email: document.getElementById("emailError"),
    subject: document.getElementById("subjectError"),
    message: document.getElementById("messageError")
};

function isValidEmail(email) {
    // Basic format check; this does not verify that the mailbox exists.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function showFieldError(fieldName, message) {
    const field = fields[fieldName];
    const errorElement = errorElements[fieldName];

    if (field) {
        field.classList.toggle("is-invalid", Boolean(message));
        field.setAttribute("aria-invalid", message ? "true" : "false");
    }

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(fieldName) {
    showFieldError(fieldName, "");
}

Object.keys(fields).forEach(function (fieldName) {
    const field = fields[fieldName];

    if (field) {
        // Clear that field's error as the user edits it.
        field.addEventListener("input", function () {
            clearFieldError(fieldName);

            if (formStatus) {
                formStatus.textContent = "";
                formStatus.className = "form-status";
            }
        });
    }
});

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        // Keep the browser on this page while we validate the form.
        event.preventDefault();

        // Read the values and remove leading/trailing whitespace.
        const name = fields.name.value.trim();
        const email = fields.email.value.trim();
        const subject = fields.subject.value.trim();
        const message = fields.message.value.trim();

        // Clear any old errors before checking the new submission.
        Object.keys(fields).forEach(function (fieldName) {
            clearFieldError(fieldName);
        });

        if (formStatus) {
            formStatus.textContent = "";
            formStatus.className = "form-status";
        }

        let firstInvalidField = null;

        // Check that every required field contains text.
        if (!name) {
            showFieldError("name", "Please enter your name.");
            firstInvalidField = firstInvalidField || fields.name;
        }

        if (!email) {
            showFieldError("email", "Please enter your email address.");
            firstInvalidField = firstInvalidField || fields.email;
        } else if (!isValidEmail(email)) {
            showFieldError("email", "Please enter a valid email address.");
            firstInvalidField = firstInvalidField || fields.email;
        }

        if (!subject) {
            showFieldError("subject", "Please enter a subject.");
            firstInvalidField = firstInvalidField || fields.subject;
        }

        if (!message) {
            showFieldError("message", "Please write a message.");
            firstInvalidField = firstInvalidField || fields.message;
        }

        // If validation failed, show a summary and focus the first invalid field.
        if (firstInvalidField) {
            if (formStatus) {
                formStatus.textContent = "A few details need your attention above.";
                formStatus.classList.add("error");
            }

            firstInvalidField.focus();
            return;
        }

        // This is a front-end demo: no email is sent and no data is stored.
        if (formStatus) {
            formStatus.textContent =
                "Thanks, " + name + "! Your form passed validation. (Demo only — no message was sent.)";
            formStatus.classList.add("success");
        }

        // Reset fields after successful front-end validation.
        contactForm.reset();

        Object.keys(fields).forEach(function (fieldName) {
            clearFieldError(fieldName);
        });
    });
}

// 6. Close the mobile Bootstrap navigation after a section link is selected.
const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
const navCollapse = document.getElementById("mainNav");

navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        if (
            navCollapse &&
            navCollapse.classList.contains("show") &&
            window.bootstrap
        ) {
            const collapseInstance =
                window.bootstrap.Collapse.getOrCreateInstance(navCollapse);
            collapseInstance.hide();
        }
    });
});
