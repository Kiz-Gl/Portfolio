// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/js/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Handle offline/online status changes
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  
  // Check if we should redirect back to the last page after coming back online
  if (sessionStorage.getItem('lastPage') && 
      window.location.pathname.includes('offline.html')) {
    const lastPage = sessionStorage.getItem('lastPage');
    sessionStorage.removeItem('lastPage');
    window.location.href = lastPage;
  }
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  
  // If the user is offline and not on the offline page, redirect to offline page
  if (!window.location.pathname.includes('offline.html')) {
    // Store the current page to return to when back online
    sessionStorage.setItem('lastPage', window.location.href);
    window.location.href = '/offline.html';
  }
});

// Check initial online status when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (!window.navigator.onLine) {
    document.body.classList.add('offline');
    
    // Only redirect if not already on the offline page
    if (!window.location.pathname.includes('offline.html')) {
      sessionStorage.setItem('lastPage', window.location.href);
      window.location.href = '/offline.html';
    }
  } else if (window.location.pathname.includes('offline.html') && sessionStorage.getItem('lastPage')) {
    // If we're online and on the offline page, go back to the last page
    const lastPage = sessionStorage.getItem('lastPage');
    sessionStorage.removeItem('lastPage');
    window.location.href = lastPage;
  }
});

// Handle 404 errors
window.addEventListener('error', event => {
  if (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || 
      event.target.tagName === 'LINK') {
    console.log('Resource not found:', event.target.src || event.target.href);
  }
});