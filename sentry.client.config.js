import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Add custom tags for better error tracking
  beforeSend(event) {
    // Add client context if available
    if (typeof window !== 'undefined' && window.location) {
      event.tags = {
        ...event.tags,
        client: 'property-agent-pro',
        page: window.location.pathname,
      };
    }
    return event;
  },
  
  // Environment detection
  environment: process.env.NODE_ENV,
  
  // Debug in development
  debug: process.env.NODE_ENV === 'development',
});