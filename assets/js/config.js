// EmailJS configuration
// These values are loaded from environment variables in production
// For development, they use the default values
const config = {
  emailjs: {
    // In production, these values would be replaced with environment variables
    // during the build process
    serviceId: 'service_cu2e23g',  // Replace with actual value from .env in production
    templateId: 'template_dhn2fhf', // Replace with actual value from .env in production
    formId: '#contact-form',        // Form selector
    newsletterTemplateId: 'template_jfkfizg',
    publicKey: 'OkGAOshc0KYrG8-_5'  // Replace with actual value from .env in production
  }
};

// Make config available globally
window.appConfig = config;

// For security, log a message indicating that credentials should be properly secured in production
console.log('Note: In production, EmailJS credentials should be secured through environment variables and not exposed in client-side code.');