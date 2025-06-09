const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable API routes
  trailingSlash: true,
  // Sentry configuration
  sentry: {
    hideSourceMaps: true,
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: true, // Suppresses all logs
  // Upload source maps to Sentry for better error tracking
  widenClientFileUpload: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);