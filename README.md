# AI Nexus - Multi-Model AI Collaboration Platform

AI Nexus is a web application that enables users to create AI bot teams powered by multiple AI models working together collaboratively.

## Features

- Individual AI bot creation and configuration
- Team assembly from multiple bots
- Full collaborative workspace with multi-phase workflow
- Multi-view output interface
- Interactive chat conversations with individual bots or teams
- Persistent conversation history

## Deployment on Railway

### Prerequisites

1. A [Railway](https://railway.app) account
2. A [Neon](https://neon.tech) PostgreSQL database (or any PostgreSQL database)
3. An [OpenRouter](https://openrouter.ai) API key

### Environment Variables

Configure the following environment variables in your Railway project:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# OpenRouter AI (Required)
OPENROUTER_API_KEY=your_openrouter_api_key

# Session Secret (Required for production)
SESSION_SECRET=your_random_secret_key_here

# Optional - will use Railway public domain if not set
RAILWAY_PUBLIC_DOMAIN=your-app.railway.app
PUBLIC_URL=https://your-app.railway.app
```

### Deployment Steps

1. **Fork or clone this repository**

2. **Create a new Railway project**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Configure environment variables**
   - In your Railway project, go to Variables
   - Add all the required environment variables listed above

4. **Deploy**
   - Railway will automatically build and deploy your application
   - The build process runs: `npm install && npm run build`
   - The start command is: `npm start`

5. **Set up the database**
   - Run database migrations using: `npm run db:push`
   - This can be done from the Railway dashboard or locally with the DATABASE_URL

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env file with the required variables

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **AI**: OpenRouter API
- **Authentication**: Simple session-based auth

## Security Notes

This application uses a simple session-based authentication system for ease of deployment. For production use, consider:

1. **CSRF Protection**: Add CSRF middleware (e.g., `csurf` package)
2. **Password Hashing**: Implement bcrypt or argon2 for password storage
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Input Validation**: The application uses Zod for validation, but review all user inputs
5. **HTTPS**: Always use HTTPS in production (Railway provides this by default)

## License

MIT
