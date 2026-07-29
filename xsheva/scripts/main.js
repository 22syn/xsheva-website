import { app } from "./firebase.js";

// Firebase is initialized. Use `app` for Firebase services, `analytics` for tracking.
console.log("Firebase initialized:", app.name);

// Smooth scroll for anchor links lives in motion.js — it has to go through
// Lenis, and it must survive a Firebase config failure.

// Form submission handler
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
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
      submitBtn.textContent = 'Submit';
    }
  });
}

// Scroll reveal animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe service cards and value items
document.querySelectorAll('.service-card, .value-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
