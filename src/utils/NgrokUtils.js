/**
 * Ngrok Utilities
 * Provides functions to add ngrok headers to network requests
 */

// Ngrok header configuration
const NGROK_HEADERS = {
    'ngrok-skip-browser-warning': '69420'
};

/**
 * Check if a URL is a localhost or ngrok domain
 * @param {string} url - The URL to check
 * @returns {boolean} - True if localhost or ngrok domain
 */
function isLocalOrNgrokDomain(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        return hostname === 'localhost' || 
               hostname === '127.0.0.1' || 
               hostname.includes('ngrok') ||
               hostname.includes('ngrok.io') ||
               hostname.includes('ngrok-free.app');
    } catch (error) {
        // If URL parsing fails, assume it's not a local domain
        return false;
    }
}

/**
 * Add ngrok headers to fetch requests (only for local/ngrok domains)
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise with ngrok headers (if applicable)
 */
export async function fetchWithNgrokHeaders(url, options = {}) {
    const fetchOptions = { ...options };
    
    // Only add ngrok headers for local/ngrok domains
    if (isLocalOrNgrokDomain(url)) {
        fetchOptions.headers = {
            ...NGROK_HEADERS,
            ...options.headers
        };
    } else {
        fetchOptions.headers = { ...options.headers };
    }
    
    return fetch(url, fetchOptions);
}

/**
 * Get ngrok headers object
 * @returns {Object} - Object containing ngrok headers
 */
export function getNgrokHeaders() {
    return { ...NGROK_HEADERS };
}

/**
 * Add ngrok headers to existing headers object
 * @param {Object} headers - Existing headers object
 * @returns {Object} - Headers object with ngrok headers added
 */
export function addNgrokHeaders(headers = {}) {
    return {
        ...NGROK_HEADERS,
        ...headers
    };
}

/**
 * Create Socket.IO connection options with ngrok headers
 * @param {Object} options - Socket.IO options
 * @returns {Object} - Socket.IO options with ngrok headers
 */
export function createSocketOptionsWithNgrokHeaders(options = {}) {
    return {
        ...options,
        extraHeaders: {
            ...NGROK_HEADERS,
            ...options.extraHeaders
        }
    };
}

/**
 * Override global fetch to automatically include ngrok headers (only for local/ngrok domains)
 * Call this function once to enable automatic ngrok headers for local fetch requests
 */
export function enableGlobalNgrokHeaders() {
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options = {}) {
        const fetchOptions = { ...options };
        
        // Only add ngrok headers for local/ngrok domains
        if (isLocalOrNgrokDomain(url)) {
            fetchOptions.headers = {
                ...NGROK_HEADERS,
                ...options.headers
            };
        } else {
            fetchOptions.headers = { ...options.headers };
        }
        
        return originalFetch(url, fetchOptions);
    };
    
    console.log('🌐 Global ngrok headers enabled for local/ngrok domains only');
}

/**
 * Restore original fetch function
 * Call this to disable automatic ngrok headers
 */
export function disableGlobalNgrokHeaders() {
    if (window._originalFetch) {
        window.fetch = window._originalFetch;
        delete window._originalFetch;
        console.log('🌐 Global ngrok headers disabled');
    }
} 