/*=============== Show menu =============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

/*===== Menu Show =====*/
/* Validate if constant exists */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

/*===== Hide Show =====*/
/* Validate if constant exists */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

/*=============== Remove Menu Mobile ===============*/
const navLink = document.querySelectorAll('.nav__link');

function linkAction() {
    const navMenu = document.getElementById('nav-menu');
    // when we click on each link, we remove the show-menu class
    navMenu.classList.remove('show-menu');
}

navLink.forEach((n) => n.addEventListener('click', linkAction));

/*=============== Background Header =============*/
function scrollHeader() {
    const header = document.getElementById('header');
    // when the scroll is greater than 50 viewport height, add the scroll-header class to header tag
    if (this.scrollY >= 50) header.classList.add('scroll-header');
    else header.classList.remove('scroll-header');
}

window.addEventListener('scroll', scrollHeader);

/*=============== Secure Contact Form =============*/
const contactForm = document.getElementById('contact-form');
const contactName = document.getElementById('contact-name');
const contactEmail = document.getElementById('contact-email');
const message = document.getElementById('message');
const contactMessage = document.getElementById('contact-message');

// Security configurations
const SECURITY = {
  MAX_NAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 2000,
  MIN_MESSAGE_LENGTH: 10,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_REGEX: /^[a-zA-Z\s\-']+$/,
  SPAM_KEYWORDS: ['http://', 'https://', 'www.', '.com', 'href=', 'url=', '[link]'],
  TIME_LIMIT: 5000 // 5 seconds minimum form fill time
};

let formSubmitTime = 0;

// Input sanitization function
const sanitizeInput = (input) => {
  return input.trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Validation functions
const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length > SECURITY.MAX_NAME_LENGTH) return `Name must be less than ${SECURITY.MAX_NAME_LENGTH} characters`;
  if (!SECURITY.NAME_REGEX.test(name)) return 'Name contains invalid characters';
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (email.length > SECURITY.MAX_EMAIL_LENGTH) return `Email must be less than ${SECURITY.MAX_EMAIL_LENGTH} characters`;
  if (!SECURITY.EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return '';
};

const validateMessage = (msg) => {
  if (!msg) return 'Message is required';
  if (msg.length < SECURITY.MIN_MESSAGE_LENGTH) return `Message must be at least ${SECURITY.MIN_MESSAGE_LENGTH} characters`;
  if (msg.length > SECURITY.MAX_MESSAGE_LENGTH) return `Message must be less than ${SECURITY.MAX_MESSAGE_LENGTH} characters`;
  
  // Check for spam keywords
  const lowerMsg = msg.toLowerCase();
  if (SECURITY.SPAM_KEYWORDS.some(keyword => lowerMsg.includes(keyword))) {
    return 'Message contains suspicious content';
  }
  return '';
};

// Form submission handler
const sendEmail = async (e) => {
  e.preventDefault();
  
  // Set form submission time if not set
  if (!formSubmitTime) {
    formSubmitTime = Date.now();
    return showMessage('Please fill out the form completely', 'error');
  }
  
  // Verify CSRF token
  const formToken = contactForm.querySelector('input[name="csrf_token"]')?.value;
  const storedToken = localStorage.getItem('csrf_token');
  
  if (!formToken || formToken !== storedToken) {
    console.error('CSRF token validation failed');
    return showMessage('Security validation failed. Please refresh the page and try again.', 'error');
  }
  
  // Check minimum time requirement (anti-bot measure)
  const submitDuration = Date.now() - formSubmitTime;
  if (submitDuration < SECURITY.TIME_LIMIT) {
    return showMessage('Please take your time to fill out the form', 'error');
  }

  // Sanitize inputs
  const name = sanitizeInput(contactName.value);
  const email = sanitizeInput(contactEmail.value);
  const msg = sanitizeInput(message.value);

  // Validate inputs
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const messageError = validateMessage(msg);

  if (nameError || emailError || messageError) {
    return showMessage(nameError || emailError || messageError, 'error');
  }

  // Show loading state
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    // Add honeypot field (hidden from users but visible to bots)
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'honeypot';
    honeypot.style.display = 'none';
    contactForm.appendChild(honeypot);

    // If honeypot is filled, it's likely a bot
    if (honeypot.value) {
      throw new Error('Bot detected');
    }

    // Send email via EmailJS
    await emailjs.sendForm(
      window.appConfig.emailjs.serviceId,
      window.appConfig.emailjs.templateId,
      window.appConfig.emailjs.formId,
      window.appConfig.emailjs.publicKey
    );

    showMessage('Message sent successfully ✔️', 'success');
    
    // Reset form
    contactForm.reset();
    formSubmitTime = 0;
    
    // Add to localStorage to prevent rapid submissions
    localStorage.setItem('lastFormSubmission', Date.now());
  } catch (error) {
    console.error('Error:', error);
    showMessage('Failed to send message. Please try again later.', 'error');
    
    // For security, don't reveal specific errors to users
    if (process.env.NODE_ENV === 'development') {
      console.error('Detailed error:', error);
    }
  } finally {
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
    if (honeypot) honeypot.remove();
  }
};

// Helper function to show messages
const showMessage = (msg, type) => {
  contactMessage.textContent = msg;
  contactMessage.className = 'contact__message text-sm';
  
  if (type === 'error') {
    contactMessage.classList.add('color-dark');
    contactMessage.classList.remove('color-light');
  } else {
    contactMessage.classList.add('color-light');
    contactMessage.classList.remove('color-dark');
  }
  
  // Clear message after 5 seconds
  setTimeout(() => {
    if (contactMessage.textContent === msg) {
      contactMessage.textContent = '';
    }
  }, 5000);
};

// Initialize form timing on first interaction
contactForm.addEventListener('input', () => {
  if (!formSubmitTime) {
    formSubmitTime = Date.now();
  }
});

// Prevent rapid form submissions
contactForm.addEventListener('submit', (e) => {
  const lastSubmission = localStorage.getItem('lastFormSubmission');
  if (lastSubmission && Date.now() - lastSubmission < 30000) { // 30 second cooldown
    e.preventDefault();
    showMessage('Please wait before submitting another message', 'error');
    return false;
  }
  return true;
});

// Attach the secure submit handler
contactForm.addEventListener('submit', sendEmail);

/*===============  Style Switcher =============*/
const styleSwitcherToggle = document.querySelector('.style__switcher-toggler'),
    styleSwitcher = document.querySelector('.style__switcher');

styleSwitcherToggle.addEventListener('click', () => {
    styleSwitcher.classList.toggle('open');
});

// hide switcher on scroll 
window.addEventListener('scroll', () => {
    if (styleSwitcher.classList.contains('open')) {
        styleSwitcher.classList.remove('open');
    }
});

const alternateStyles = document.querySelectorAll('.alternate-style');

function setActiveStyle(color) {
    alternateStyles.forEach((style) => {
        if (color === style.getAttribute('title')) {
            style.removeAttribute('disabled');
        } else {
            style.setAttribute('disabled', 'true');
        }
    });
}
// Add this to common.js
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Detect ultra-narrow viewport
function checkViewport() {
    if (window.innerWidth <= 320) {
        document.body.classList.add('ultra-mobile');
    } else {
        document.body.classList.remove('ultra-mobile');
    }
}
window.addEventListener('resize', checkViewport);
checkViewport();

/*=============== Share Functions =============*/
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank', 'width=600,height=400');
}

// Add click event to toggle share options
document.addEventListener('DOMContentLoaded', function() {
    const shareButton = document.querySelector('.share-button');
    if (shareButton) {
        shareButton.addEventListener('click', function(e) {
            if (e.target.closest('.share-options a')) return;
            this.classList.toggle('active');
        });
    }
});