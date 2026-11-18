/* ATU Project Board – contact form validation rules.
 * Used by the browser (contact.html) AND by the automated tests (Node.js),
 * so the tests check exactly the same code the website runs.
 */
'use strict';

(function (root) {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isBlank(value) {
    return typeof value !== 'string' || value.trim().length === 0;
  }

  // Returns an object of field -> error message. An empty object means valid.
  function validateContact(input) {
    const data = input || {};
    const errors = {};

    if (isBlank(data.name)) errors.name = 'Name is required';
    else if (data.name.trim().length > 80) errors.name = 'Name must be 80 characters or fewer';

    if (isBlank(data.email)) errors.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(data.email.trim())) errors.email = 'Enter a valid email address';

    if (isBlank(data.message)) errors.message = 'Message is required';
    else if (data.message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
    else if (data.message.trim().length > 1000) errors.message = 'Message must be 1000 characters or fewer';

    return errors;
  }

  const api = { validateContact, EMAIL_PATTERN };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api; // Node.js (tests)
  } else {
    root.ATUValidation = api; // browser
  }
})(this);
