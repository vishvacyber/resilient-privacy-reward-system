// Example configuration file
// Copy this to config.js and update with your production credentials
// IMPORTANT: Change these credentials before deploying to production!

const PRODUCTION_CONFIG = {
    // Admin credentials - CHANGE THESE FOR PRODUCTION
    adminCredentials: {
        username: 'admin',
        password: 'admin123'
    },
    
    // Session settings
    sessionTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds (as per requirements)
    
    // Security settings
    enableConsoleLogging: false, // Disable console logs in production
    enableDebugMode: false, // Disable debug features in production
    maxLoginAttempts: 3, // Maximum login attempts before lockout
    lockoutDuration: 15 * 60 * 1000, // 15 minutes lockout duration
    
    // App settings
    appName: 'Resilient Privacy Inc. Reward System',
    version: '2.0.0',
    companyName: 'Resilient Privacy Inc.',
    
    // File upload settings
    maxFileSize: 5 * 1024 * 1024, // 5MB max file size for headshots
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    
    // Performance settings
    enableCaching: true,
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours cache expiry
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PRODUCTION_CONFIG;
}
