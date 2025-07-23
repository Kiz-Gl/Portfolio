# Portfolio Website

## Environment Variables

This project uses environment variables to store sensitive information like API keys. For security reasons, these values are not committed to the repository.

### EmailJS Configuration

The contact form uses EmailJS to send messages. The credentials are stored in a `.env` file which is not committed to the repository.

#### Setup

1. Create a `.env` file in the root directory of the project
2. Add the following variables to the file:

```
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_FORM_ID=#contact-form
EMAILJS_PUBLIC_KEY=your_public_key
```

3. Replace the placeholder values with your actual EmailJS credentials

#### Development

During development, the application uses default values from the `config.js` file. In a production environment, these values should be replaced with environment variables during the build process.

#### Security Note

Never commit your `.env` file to the repository. The `.gitignore` file is configured to exclude it.

## How It Works

The application loads configuration values from `assets/js/config.js`, which provides the EmailJS credentials to the contact form functionality in `assets/js/common.js`.

In a production environment, a build process should replace the default values in `config.js` with the actual values from the `.env` file.