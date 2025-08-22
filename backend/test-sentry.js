// Simple test script to verify Sentry integration
require('dotenv').config();

const Sentry = require('@sentry/node');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://fc14bb90babb5f719e7263d8a15f7d5e@o4509882022756352.ingest.us.sentry.io/4509882053296128",
  environment: process.env.NODE_ENV || 'development',
  debug: true,
});

console.log('✅ Sentry initialized successfully');

// Test error capture
try {
  throw new Error('Test Sentry Error - This is intentional for testing purposes');
} catch (error) {
  const eventId = Sentry.captureException(error);
  console.log(`🚨 Error captured by Sentry with ID: ${eventId}`);
  console.log('Check your Sentry dashboard for this error');
}

// Wait a moment for Sentry to send the event
setTimeout(() => {
  console.log('✅ Test completed');
  process.exit(0);
}, 2000);
