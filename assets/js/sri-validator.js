/*=============== Subresource Integrity Validator =============*/

/**
 * This script adds Subresource Integrity (SRI) validation to external resources
 * SRI helps ensure that resources loaded from external sources (like CDNs)
 * haven't been tampered with.
 *
 * IMPORTANT: These hashes must exactly match the files served by the CDN.
 * To regenerate: https://www.srihash.org/ or use the jsDelivr SRI hash endpoint:
 * https://cdn.jsdelivr.net/npm/<package>/+esm (check Network tab -> Response Headers -> x-jsd-integrity)
 *
 * Or run locally:
 *   curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
 * Then prefix with "sha384-"
 */

// SRI hashes for our external resources
// Generated from the actual CDN files — update these whenever you bump a version
const integrityMap = {
  // RemixIcon CSS v4.5.0
  'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css':
    'sha384-L/vw44MdBs/7hovWr2rBVSRKqdti4Vw077yuSGQ2PO3tQARRLiLuMh8xhVmVrR0I',

  // Swiper CSS v11
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css':
    'sha384-gAPqlBuTCdtVcYt9ocMOYWrnBZ4XSL6q+4eXqwNycOr4iFczhNKtnYhF3NEXJM51',

  // Swiper JS v11
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js':
    'sha384-2UI1PfnXFjVMQ7/ZDEF70CR943oH3v6uZrFQGGqJYlvhh4g6z6uVktxYbOlAczav',

  // EmailJS browser v4
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js':
    'sha384-SALc35EccAf6RzGw4iNsyj7kTPr33K7RoGzYu+7heZhT8s0GZouafRiCg1qy44AS'
};

/**
 * Adds integrity and crossorigin attributes to external resources.
 * NOTE: This only works reliably if called BEFORE the browser fetches the
 * resources. Since scripts run after the HTML is parsed, SRI is better set
 * directly on the <link> and <script> tags in your HTML rather than injected
 * via JS. This function is kept as a belt-and-suspenders measure.
 */
function applySRI() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('https://') && integrityMap[href] && !link.hasAttribute('integrity')) {
      link.setAttribute('integrity', integrityMap[href]);
      link.setAttribute('crossorigin', 'anonymous');
    }
  });

  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.startsWith('https://') && integrityMap[src] && !script.hasAttribute('integrity')) {
      script.setAttribute('integrity', integrityMap[src]);
      script.setAttribute('crossorigin', 'anonymous');
    }
  });
}

/**
 * Handles resources that fail to load.
 * Only shows the security banner for resources that had an integrity attribute
 * (i.e., genuine SRI failures), not for ordinary network errors.
 */
function handleResourceError(event) {
  const target = event.target;
  if (!target || !(target instanceof Element)) return;

  const resourceUrl = target.src || target.href || '';

  // Only treat it as an SRI issue if the element actually had an integrity attribute
  const hasIntegrity = target.hasAttribute('integrity');
  if (!resourceUrl.startsWith('https://') || !hasIntegrity) return;

  console.error('Resource integrity check failed:', resourceUrl);

  const securityAlert = document.createElement('div');
  securityAlert.style.cssText =
    'position:fixed;top:0;left:0;right:0;background:#ff3860;color:white;' +
    'padding:10px;text-align:center;z-index:9999;font-family:sans-serif;font-size:14px;';
  securityAlert.innerHTML =
    '<strong>Security Warning:</strong> A resource failed integrity validation. ' +
    'This could indicate a security issue. ' +
    '<button onclick="this.parentNode.remove()" ' +
    'style="background:white;color:#ff3860;border:none;padding:2px 8px;' +
    'margin-left:10px;cursor:pointer;border-radius:3px;">Dismiss</button>';
  document.body.appendChild(securityAlert);
}

document.addEventListener('DOMContentLoaded', applySRI);
window.addEventListener('error', handleResourceError, true);
