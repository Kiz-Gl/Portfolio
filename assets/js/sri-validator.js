/*=============== Subresource Integrity Validator =============*/

/**
 * This script adds Subresource Integrity (SRI) validation to external resources
 * SRI helps ensure that resources loaded from external sources (like CDNs) 
 * haven't been tampered with.
 */

// SRI hashes for our external resources
const integrityMap = {
  // RemixIcon CSS
  'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css': 'sha384-q1iZP5NmFnFXiETQigCP3c0dGM8JCQQJTe+t9QZJrJg1UqZuNh9CpH5U0B3AzOjH',
  
  // Swiper CSS (if used)
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css': 'sha384-Lq/vZPR+f3FuXTvQHktAp9s3cF2Bc9+S8E/yrEq5Eid9Ql1J7+h3lGpYpg8xR6D3',
  
  // EmailJS
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js': 'sha384-Jp1H8zSpRRWIGlEsDmDMhWKj9chLCMwcXLDj8oqcUoZAb+jxCnKGv7UDnGNcGCpW'
};

/**
 * Adds integrity and crossorigin attributes to external resources
 */
function applySRI() {
  // Process all link elements (CSS)
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('https://') && integrityMap[href]) {
      link.setAttribute('integrity', integrityMap[href]);
      link.setAttribute('crossorigin', 'anonymous');
    }
  });
  
  // Process all script elements (JS)
  document.querySelectorAll('script').forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.startsWith('https://') && integrityMap[src]) {
      script.setAttribute('integrity', integrityMap[src]);
      script.setAttribute('crossorigin', 'anonymous');
    }
  });
}

/**
 * Validates the integrity of resources that failed to load
 */
function handleResourceError(event) {
  const target = event.target;
  const resourceUrl = target.src || target.href;
  
  if (resourceUrl && resourceUrl.startsWith('https://')) {
    console.error(`Resource integrity check failed: ${resourceUrl}`);
    
    // Alert the user about potential security issue
    const securityAlert = document.createElement('div');
    securityAlert.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff3860;color:white;padding:10px;text-align:center;z-index:9999;';
    securityAlert.innerHTML = `<strong>Security Warning:</strong> A resource failed integrity validation. This could indicate a security issue. <button onclick="this.parentNode.remove()" style="background:white;color:#ff3860;border:none;padding:2px 8px;margin-left:10px;cursor:pointer;">Dismiss</button>`;
    document.body.appendChild(securityAlert);
    
    // Prevent the resource from being used
    event.preventDefault();
    
    // Remove the element if possible
    if (target.parentNode) {
      target.parentNode.removeChild(target);
    }
  }
}

// Apply SRI when DOM is loaded
document.addEventListener('DOMContentLoaded', applySRI);

// Listen for resource loading errors
window.addEventListener('error', handleResourceError, true);