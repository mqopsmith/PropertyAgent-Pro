import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Add custom tags for better error tracking
  beforeSend(event) {
    // Add server context
    event.tags = {
      ...event.tags,
      client: 'property-agent-pro',
      environment: process.env.NODE_ENV,
      server: true,
    };
    return event;
  },
  
  // Environment detection
  environment: process.env.NODE_ENV,
  
  // Debug in development
  debug: process.env.NODE_ENV === 'development',
});