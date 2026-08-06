/**
 * Contact form submission handler.
 *
 * Deliberately imports NOTHING. This is the site's only lead-capture path, and it must
 * survive a Firebase config failure — the same reasoning that moved smooth scroll into
 * motion.js. While this lived in main.js it sat downstream of `import "./firebase.js"`,
 * which throws at module top level when any VITE_FIREBASE_* var is missing. A build
 * without those vars (they are gitignored and no deploy workflow injects them) therefore
 * never registered this listener, and every submit fell through to a native POST that
 * navigated the visitor off the site — the exact bug this handler exists to prevent.
 *
 * Keep this module dependency-free.
 */

// Queried off the real markup: the <form> carries no id (the wrapper div owns
// `contact-form`) and the button is identified by type, not id.
const contactForm = document.querySelector('#contact-form form');
const formStatus = document.getElementById('cf-status');
const submitBtn = contactForm?.querySelector('button[type="submit"]');

if (contactForm && formStatus && submitBtn) {
  const submitLabel = submitBtn.textContent.trim();

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        formStatus.textContent = 'Thank you! We will contact you soon.';
        formStatus.className = 'form-status form-status-success';
        contactForm.reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      formStatus.textContent = 'Error sending message. Please try again or contact us directly.';
      formStatus.className = 'form-status form-status-error';
    } finally {
      submitBtn.disabled = false;
      // Restore the real label ("Send Request") rather than hardcoding one.
      submitBtn.textContent = submitLabel;
    }
  });
}
