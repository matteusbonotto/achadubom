import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - The sanitized HTML content
 */
export const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html);
};

/**
 * Validates and sanitizes user input
 * @param {string} input - The user input to validate
 * @returns {string} - The sanitized input
 */
export const sanitizeUserInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(input.trim());
};

/**
 * Validates URL to prevent malicious redirects
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}; 