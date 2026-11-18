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

// ---------- Form helpers ----------
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
}

function showErrors(form, errors) {
  for (const [field, message] of Object.entries(errors)) {
    form.querySelector(`[data-error-for="${field}"]`).textContent = message;
    form.querySelector(`[name="${field}"]`).classList.add('invalid');
  }
}

function setStatus(form, message, type) {
  const status = form.querySelector('.form-status');
  status.textContent = message;
  status.className = `form-status ${type}`;
}

// ---------- Contact form: name, email, message ----------
function validateContact({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!message.trim()) errors.message = 'Message is required';
  else if (message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
  return errors;
}

function handleForm(formId, validate, successMessage) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // stay on the page
    clearErrors(form);

    const data = Object.fromEntries(new FormData(form));
    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      showErrors(form, errors);
      setStatus(form, 'Please fix the highlighted fields.', 'error');
      return;
    }

    setStatus(form, successMessage(data), 'success');
    form.reset();
  });
}

handleForm('contact-form', validateContact,
  (data) => `Thanks ${data.name.trim()}, your message has been received.`);
