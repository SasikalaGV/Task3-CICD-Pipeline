/* ATU Project Board – script shared by every page */
'use strict';

// ---------- Highlight the current page in the menu ----------
const currentPage = document.body.dataset.page;
document.querySelectorAll('.nav-links a').forEach((link) => {
  if (link.dataset.page === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

// ---------- Mobile menu button ----------
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// ---------- Contact form ----------
const form = document.getElementById('contact-form');

function clearErrors() {
  form.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
}

function showErrors(errors) {
  for (const [field, message] of Object.entries(errors)) {
    form.querySelector(`[data-error-for="${field}"]`).textContent = message;
    form.querySelector(`[name="${field}"]`).classList.add('invalid');
  }
}

function setStatus(message, type) {
  const status = form.querySelector('.form-status');
  status.textContent = message;
  status.className = `form-status ${type}`;
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // stay on the page
    clearErrors();

    const data = Object.fromEntries(new FormData(form));
    // Rules live in js/validation.js so the automated tests can check them too
    const errors = window.ATUValidation.validateContact(data);

    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      setStatus('Please fix the highlighted fields.', 'error');
      return;
    }

    setStatus(`Thanks ${data.name.trim()}, your message has been received.`, 'success');
    form.reset();
  });
}
