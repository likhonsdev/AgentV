# Deployment Guide

This document provides detailed instructions for deploying Sifra UI to various environments, including local development, staging, and production.

## Table of Contents

- [Deployment Guide](#deployment-guide)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
    - [Setup](#setup)
    - [Running the Development Server](#running-the-development-server)
    - [Building for Production](#building-for-production)
  - [Vercel Deployment](#vercel-deployment)
    - [Deploying with Vercel CLI](#deploying-with-vercel-cli)
    - [Deploying with GitHub Integration](#deploying-with-github-integration)
    - [Environment Variables on Vercel](#environment-variables-on-vercel)
  - [Other Deployment Platforms](#other-deployment-platforms)
    - [Netlify](#netlify)
    - [AWS Amplify](#aws-amplify)
    - [Docker Deployment](#docker-deployment)
  - [CI/CD Setup](#cicd-setup)
    - [GitHub Actions](#github-actions)
  - [Performance Optimization](#performance-optimization)
    - [Edge Functions](#edge-functions)
    - [Static Generation](#static-generation)
  - [Scaling Considerations](#scaling-considerations)
    - [API Rate Limits](#api-rate-limits)
    - [Cost Management](#cost-management)
  - [Monitoring and Analytics](#monitoring-and-analytics)
  - [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying Sifra UI, ensure you have the following:

- **Node.js**: Version 18.x or later
- **npm**, **yarn**, or **pnpm**: For package management
- **Google Gemini API Key**: Required for AI functionality
- **Git**: For version control and deployment
- **Vercel Account** (optional): For easy deployment to Vercel

## Local Development

### Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/sifra-ui.git
cd sifra-ui
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env` file in the root directory:

```env
# Required: Google AI API Key for Gemini models
GEMINI_API_KEY=your_api_key_here

# Optional: Override default UI configurations
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_APP_NAME=Sifra UI
NEXT_PUBLIC_DEFAULT_MODEL=gemini-pro
```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

To test the production build locally:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

## Vercel Deployment

Vercel is the recommended deployment platform for Sifra UI, providing seamless integration with Next.js.

### Deploying with Vercel CLI

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Login to your Vercel account:

```bash
vercel login
```

3. Deploy the application:

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

### Deploying with GitHub Integration

1. Push your project to a GitHub repository
2. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
3. Click "New Project" and select your repository
4. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next
5. Add environment variables:
   - GEMINI_API_KEY: Your Gemini API key
   - Any other required environment variables
6. Click "Deploy"

### Environment Variables on Vercel

Set up environment variables in your Vercel project:

1. Navigate to your project in the Vercel dashboard
2. Go to "Settings" > "Environment Variables"
3. Add the following environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key (required)
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Optional client-side key
   - `NEXT_PUBLIC_APP_NAME`: Custom application name
   - `NEXT_PUBLIC_DEFAULT_MODEL`: Default Gemini model

## Other Deployment Platforms

### Netlify

1. Push your project to a GitHub repository
2. Log in to your [Netlify dashboard](https://app.netlify.com/)
3. Click "New site from Git" and select your repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in the "Environment" section
6. Click "Deploy site"

### AWS Amplify

1. Push your project to a GitHub, BitBucket, or GitLab repository
2. Log in to the [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Choose "Host web app" and connect your repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add environment variables
6. Click "Save and deploy"

### Docker Deployment

You can containerize Sifra UI for deployment to various platforms like Kubernetes, AWS ECS, or Google Cloud Run.

1. Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set user
USER node

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the app
CMD ["node", "server.js"]
```

2. Create a `.dockerignore` file:

```
node_modules
.next
.git
.env
.env.local
```

3. Modify `next.config.js` to enable standalone output:

```js
module.exports = {
  output: 'standalone',
  // ...other config
};
```

4. Build and run the Docker image:

```bash
docker build -t sifra-ui .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_api_key_here sifra-ui
```

## CI/CD Setup

### GitHub Actions

Create a GitHub Actions workflow for CI/CD. Create a file at `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Performance Optimization

### Edge Functions

Sifra UI uses Edge Functions for API routes, which provides several benefits:

- Lower latency: Edge functions run closer to the user
- Improved response times: Edge functions have faster cold starts
- Global distribution: Functions are deployed globally

The API route at `app/api/chat/route.ts` uses the Edge runtime:

```typescript
export const runtime = 'edge';
```

### Static Generation

Optimize performance by leveraging Next.js static generation:

- Static pages load faster and reduce server load
- Use server components where possible
- Implement caching strategies for frequently accessed data

## Scaling Considerations

### API Rate Limits

Be aware of Google Generative AI API rate limits:

- Monitor API usage to avoid rate limit errors
- Implement exponential backoff retry logic for API calls
- Consider implementing a queue system for high-traffic scenarios

### Cost Management

Manage costs by optimizing API usage:

- Use appropriate token limits to control API costs
- Cache common responses to reduce API calls
- Consider implementing usage quotas for users

## Monitoring and Analytics

Set up monitoring and analytics to track application performance:

1. **Vercel Analytics**: Provides insights into performance and usage
2. **Error Tracking**: Integrate with services like Sentry for error monitoring
3. **Custom Logging**: Implement logging for important events and errors

Example integration with Sentry:

```typescript
// Install Sentry SDK: npm install @sentry/nextjs
// Then initialize in your Next.js app:

// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});

// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

## Troubleshooting

Common deployment issues and solutions:

1. **API Key Issues**: Ensure the `GEMINI_API_KEY` is correctly set in your environment variables.

2. **Build Failures**: Check for any linting or type errors that might cause the build to fail:
   ```bash
   npm run lint
   ```

3. **Edge Runtime Errors**: If you encounter issues with Edge runtime, check that all imported packages are compatible with Edge.

4. **Memory Limitations**: If you encounter memory issues during build, try increasing the memory limit:
   ```bash
   NODE_OPTIONS="--max_old_space_size=4096" npm run build
   ```

5. **Environment Variable Access**: Remember that only environment variables prefixed with `NEXT_PUBLIC_` are accessible on the client side.

For persistent issues, check the application logs on your deployment platform or open an issue in the GitHub repository.
