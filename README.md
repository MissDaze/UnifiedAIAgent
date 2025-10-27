# AI Nexus

Multi-Model AI Collaboration Platform

## Overview

AI Nexus is a web application that enables users to create AI bot teams powered by multiple AI models working together collaboratively. Configure individual AI bots, assemble them into teams, and manage collaborative workflows with persistent sessions.

## Deployment on Railway

### Prerequisites
- Railway account
- Neon PostgreSQL database
- OpenRouter API key

### Environment Variables
Set the following environment variables in your Railway project:

```
DATABASE_URL=postgresql://...      # Your Neon PostgreSQL connection string
SESSION_SECRET=your-secret-here    # Random string for session encryption
OPENROUTER_API_KEY=sk-...         # Your OpenRouter API key
APP_URL=https://your-app.railway.app  # Your Railway app URL
NODE_ENV=production
PORT=5000
```

### Deploy Steps
1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Node.js application
3. Set the environment variables listed above
4. Railway will automatically build and deploy
5. Run database migrations: `npm run db:push`

## Local Development

### Setup
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```
DATABASE_URL=postgresql://localhost/ainexus
SESSION_SECRET=dev-secret-change-in-production
OPENROUTER_API_KEY=sk-...
APP_URL=http://localhost:5000
NODE_ENV=development
PORT=5000
```

### Run Development Server
```bash
npm run dev
```

The application will be available at http://localhost:5000

### Build for Production
```bash
npm run build
npm start
```

## Features

- Individual AI bot creation with model selection and configuration
- Team assembly from multiple bots
- Multi-phase collaborative workflow (Planning → Execution → Review)
- Interactive chat with individual bots or teams
- Persistent conversation history
- Output management and persistence

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **AI Provider**: OpenRouter
- **ORM**: Drizzle ORM

## Documentation

See [replit.md](./replit.md) for detailed architecture documentation.
