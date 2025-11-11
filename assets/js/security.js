/*=============== Website Security Enhancements =============*/

// Content Security Policy implementation
/*=============== Website Security Enhancements =============*/

// Content Security Policy implementation
function applyContentSecurityPolicy() {
  // Create meta tag for CSP
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net https://cdn.emailjs.com 'unsafe-inline'; " +
    "style-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; " +
    "connect-src 'self' https://api.emailjs.com; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self';";
  document.head.appendChild(cspMeta);

  // Add X-XSS-Protection header via meta tag
  const xssProtection = document.createElement('meta');
  xssProtection.httpEquiv = 'X-XSS-Protection';
  xssProtection.content = '1; mode=block';
  document.head.appendChild(xssProtection);

  // Add X-Content-Type-Options header via meta tag
  const noSniff = document.createElement('meta');
  noSniff.httpEquiv = 'X-Content-Type-Options';
  noSniff.content = 'nosniff';
  document.head.appendChild(noSniff);

  // Add Referrer-Policy header via meta tag
  const referrerPolicy = document.createElement('meta');
  referrerPolicy.name = 'referrer';
  referrerPolicy.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(referrerPolicy);

  // Add Permissions-Policy header via meta tag
  const permissionsPolicy = document.createElement('meta');
  permissionsPolicy.httpEquiv = 'Permissions-Policy';
  permissionsPolicy.content = 'camera=(), microphone=(), geolocation=(), interest-cohort=()';
  document.head.appendChild(permissionsPolicy);
}

// CSRF Protection
function addCSRFProtection() {
  // Generate a CSRF token
  const generateCSRFToken = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
  };

  // Set CSRF token in localStorage if not present
  if (!localStorage.getItem('csrf_token')) {
    localStorage.setItem('csrf_token', generateCSRFToken());
  }

  // Add CSRF token to all forms
  document.querySelectorAll('form').forEach(form => {
    // Skip if already has token
    if (form.querySelector('input[name="csrf_token"]')) return;
    
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = localStorage.getItem('csrf_token');
    form.appendChild(csrfInput);
  });
}


// Prevent clickjacking
function preventClickjacking() {
  if (window.self !== window.top) {
    // If page is in iframe, break out of it
    window.top.location = window.self.location;
  }
}

// Sanitize URL parameters to prevent XSS
function sanitizeURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  let hasXSS = false;
  
  urlParams.forEach((value, key) => {
    // Check for potential XSS in URL parameters
    if (value.includes('<') || value.includes('>') || value.includes('javascript:') || 
        value.includes('on') || value.includes('\\x') || value.includes('&') ||
        value.includes('alert(') || value.includes('confirm(') || value.includes('prompt(')) {
      hasXSS = true;
      console.warn('Potentially malicious URL parameter detected:', key);
    }
  });
  
  if (hasXSS) {
    // Redirect to clean URL if suspicious parameters found
    window.location.href = window.location.pathname;
  }
}

// Initialize all security measures
function initSecurity() {
  // Apply all security enhancements
  applyContentSecurityPolicy();
  addCSRFProtection();
  // Secure external links (add this function to security.js)
  function secureExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Secure external links
  function secureExternalLinks() {
      document.querySelectorAll('a[href^="http"]').forEach(link => {
          if (!link.href.includes(window.location.hostname)) {
              link.setAttribute('target', '_blank');
              link.setAttribute('rel', 'noopener noreferrer');
          }
      });
  }
  }
  preventClickjacking();
  secureExternalLinks()
  sanitizeURLParams();
  
  // Periodically check for new external links
  setInterval(secureExternalLinks, 3000);
  
  console.log('Security measures initialized');
}

// Run security initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initSecurity);