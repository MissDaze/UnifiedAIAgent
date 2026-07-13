# Ai-nexus

A multi-agent AI collaboration platform. Users configure and manage a team of AI bots, submit project briefs, and view the combined outputs from multiple agents side-by-side, with a chat interface for interacting with the team and a dashboard for tracking activity.

## Features

- Configurable AI bots with individual settings
- Brief submission workflow that routes work to the bot team
- Multi-view output comparison across bots
- Chat interface for direct interaction with agents
- Dashboard with usage/activity stats
- User signup/login

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon serverless) via Drizzle ORM
- **AI**: OpenRouter

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Configure environment variables (database connection string, OpenRouter API key, auth settings).
3. Push the database schema:
   ```
   npm run db:push
   ```
4. Run in development:
   ```
   npm run dev
   ```
5. Build and start for production:
   ```
   npm run build
   npm start
   ```
