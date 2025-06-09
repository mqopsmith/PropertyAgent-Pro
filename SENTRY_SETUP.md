# Sentry Error Monitoring Setup

This project now includes Sentry for automatic error tracking and performance monitoring.

## Quick Setup

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io) and create a free account
   - Create a new project and select "Next.js"
   - Copy your DSN (Data Source Name)

2. **Configure Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     ```
     SENTRY_DSN=https://your-dsn@sentry.io/project-id
     SENTRY_ORG=your-org-name (optional)
     SENTRY_PROJECT=property-agent-pro (optional)
     ```

3. **Deploy**
   - Your app will automatically deploy with Sentry monitoring
   - Errors will now be captured and sent to your Sentry dashboard

## What Sentry Captures

- **JavaScript Errors**: Unhandled exceptions in browser and server
- **Performance Issues**: Slow API calls, rendering problems
- **User Context**: What actions led to errors
- **Environment Info**: Browser, OS, device details
- **Custom Tags**: Client info and page context

## Benefits for Your Workflow

- **No More Screenshots**: Errors come with full stack traces and context
- **Automatic Alerts**: Get notified immediately when clients experience issues  
- **Error Grouping**: Similar errors are grouped together, not reported separately
- **Performance Insights**: See which parts of your app are slow
- **Client Context**: Know exactly which client experienced which error

## Usage

Once deployed, Sentry works automatically. You can:
- View errors at [sentry.io](https://sentry.io)
- Set up Slack/email alerts for critical errors
- Track error frequency and resolution

No code changes needed - errors are automatically captured!