import { app } from "./firebase.js";

// Firebase is initialized. Use `app` for Firebase services, `analytics` for tracking.
console.log("Firebase initialized:", app.name);

// Smooth scroll for anchor links lives in motion.js — it has to go through
// Lenis, and it must survive a Firebase config failure.

// Form submission handler.
// These are queried off the real markup: the <form> itself carries no id (the wrapper div
// owns `contact-form`) and the button is identified by type, not id. The previous lookups
// (#contactForm / #formStatus / #submitBtn) matched nothing, so this handler never bound and
// every submit fell through to a native POST that navigated the visitor off the site.
const contactForm = document.querySelector('#contact-form form');
const formStatus = document.getElementById('cf-status');
const submitBtn = contactForm?.querySelector('button[type="submit"]');

if (contactForm && formStatus && submitBtn) {
  const submitLabel = submitBtn.textContent.trim();

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    // Get form data
    const formData = new FormData(contactForm);
    
    try {
      // Submit to FormSubmit
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Success
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
      // Restore the real label ("Send Request"). This used to hardcode 'Submit',
      // silently relabelling the button after the first submit.
      submitBtn.textContent = submitLabel;
    }
  });
}

// The scroll-reveal IntersectionObserver that used to live here was dead code: it watched
// `.service-card, .value-item`, and neither class appears in index.html. Reveals are owned
// by [data-reveal] in motion.js.
