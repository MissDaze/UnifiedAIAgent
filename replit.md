# AI Nexus - Multi-Model AI Collaboration Platform

## Overview

AI Nexus is a web application that enables users to create AI bot teams powered by multiple AI models working together collaboratively. Users can configure individual AI bots with specific roles and capabilities, assemble them into collaborative teams, submit tasks to these teams, and review combined or individual outputs in a multi-view interface. The platform is designed for iterative AI collaboration, allowing users to refine results through follow-up interactions with individual bots or entire teams.

**Core Purpose**: Enable multi-model AI collaboration through bot team orchestration and unified output management.

**Key Features**:
- Individual AI bot creation and configuration (model selection, system prompts, parameters)
- Team assembly from multiple bots with different capabilities
- **Full Collaborative Workspace** with multi-phase workflow:
  - **Planning Phase**: Bots ask clarifying questions, user provides answers, tasks are assigned
  - **Execution Phase**: Bots execute tasks sequentially, each seeing previous outputs
  - **Review Phase**: Bots critique outputs, suggest improvements, user approves/rejects
  - **Persistent Sessions**: Auto-resume incomplete sessions, manage multiple concurrent projects
- Brief submission to teams for **sequential collaborative processing** (each bot sees and builds upon previous bots' outputs)
- Multi-view output interface (combined, individual, comparison)
- Interactive chat conversations with individual bots or entire teams
- Persistent conversation history with automatic thread resumption
- Output persistence and management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter (lightweight client-side routing)
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation

**Design System Rationale**:
The application uses a Linear-inspired design approach optimized for information density and technical sophistication. The choice prioritizes:
- Typography-driven hierarchy using Inter and JetBrains Mono fonts
- Minimal decoration with purposeful spacing
- Clear visual hierarchies for complex AI outputs
- Custom CSS variables for consistent theming (light/dark modes)

**Component Architecture**:
- Atomic design with reusable UI primitives in `/components/ui`
- Feature-specific components in `/components` (BotCard, TeamCard, OutputMultiView, ChatInterface, etc.)
- Page-level components in `/pages` handling route-specific logic
- Custom hooks for authentication (`useAuth`) and common patterns

**Chat System**:
- Reusable `ChatInterface` component for bot/team conversations
- Automatic conversation history loading and persistence
- State management ensures clean transitions between different entities
- Supports both individual bot chats and team-wide conversations

**Path Aliases**:
```
@/ → client/src/
@shared/ → shared/
@assets/ → attached_assets/
```

### Backend Architecture

**Technology Stack**:
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Authentication**: Session-based authentication with PostgreSQL storage
- **Session Management**: express-session with PostgreSQL storage

**API Structure**:
RESTful API endpoints under `/api` namespace:
- `/api/auth/*` - Authentication routes (user, login, logout)
- `/api/bots` - Bot CRUD operations
- `/api/teams` - Team management
- `/api/teams/:id/sessions` - Get all collaborative sessions for a team
- `/api/team-sessions` - Create new collaborative session
- `/api/team-sessions/:id` - Get/update/delete specific session
- `/api/team-sessions/:id/planning-message` - Add planning phase messages
- `/api/team-sessions/:id/planning/bot-question` - Generate bot questions
- `/api/team-sessions/:id/finalize-planning` - Complete planning and move to execution
- `/api/team-sessions/:id/execute` - Execute collaborative tasks
- `/api/team-sessions/:id/review-message` - Add review phase messages
- `/api/team-sessions/:id/suggestion/:suggestionId` - Approve/reject bot suggestions
- `/api/team-sessions/:id/complete` - Mark session as completed
- `/api/outputs` - Output persistence
- `/api/conversations` - Conversation thread management (filter by botId/teamId)
- `/api/conversations/:id/messages` - Message history retrieval
- `/api/bots/:id/chat` - Real-time chat with individual bots
- `/api/teams/:id/chat` - Multi-bot team conversations

**Authentication Flow**:
1. Session-based authentication for user management
2. PostgreSQL-backed session storage for persistence
3. Protected route middleware (`isAuthenticated`) for API security
4. User profile stored in database

**Development vs Production**:
- Development: Vite dev server with middleware mode, HMR enabled
- Production: Pre-built static assets served from Express, bundled with esbuild

### Data Storage

**Database**: Neon Serverless PostgreSQL via `@neondatabase/serverless`

**Schema Design** (shared/schema.ts):

1. **users** - User accounts
   - Primary: User profile, email, names, profile image
   - Purpose: Authentication and ownership tracking

2. **sessions** - Session persistence (connect-pg-simple)
   - Primary: Session data, expiration
   - Purpose: Maintain authenticated sessions across requests

3. **bots** - AI bot configurations
   - Fields: name, model, systemPrompt, temperature, maxTokens, role, etc.
   - Ownership: Foreign key to users
   - Purpose: Store individual bot configurations

4. **teams** - Team definitions
   - Fields: name, description, purpose
   - Ownership: Foreign key to users
   - Purpose: Group bots into collaborative units

5. **teamMembers** - Many-to-many relationship
   - Links: teams ↔ bots
   - Purpose: Team composition management

6. **outputs** - Saved AI responses
   - Fields: content, teamId, metadata
   - Purpose: Persist team collaboration results

7. **conversations** - Chat conversation threads
   - Fields: userId, botId (optional), teamId (optional), title, createdAt
   - Links: One-to-one with either a bot OR a team
   - Purpose: Track conversation sessions for history

8. **messages** - Individual chat messages
   - Fields: conversationId, role (user/assistant/system), content, botId (for team chats), timestamp
   - Ownership: Foreign key to conversations
   - Purpose: Store complete message history for all conversations

9. **teamSessions** - Collaborative workflow sessions
   - Fields: userId, teamId, title, brief, phase (planning/execution/review/completed), createdAt
   - JSON Fields: planningMessages, taskAssignments, executionOutputs, reviewMessages, suggestions
   - Purpose: Track multi-phase collaborative sessions with persistent state across Planning, Execution, and Review phases
   - Lifecycle: Created → Planning (discussion, questions, task assignment) → Execution (bot collaboration) → Review (critique, suggestions, approval) → Completed

**Data Access Pattern**:
- Repository pattern via `storage` interface (server/storage.ts)
- Type-safe operations with Drizzle ORM
- Zod schema validation for inserts/updates using drizzle-zod

**Migration Strategy**: Drizzle Kit with `drizzle.config.ts` for schema migrations to `/migrations` directory

### External Dependencies

**AI Service Integration**:
- **OpenRouter AI**: Primary AI model provider
- Status: Fully implemented with dynamic free model fetching
- Features:
  - Automatic discovery of available free models via `/api/models` endpoint
  - Streaming chat completions for both individual and team conversations
  - Model validation with caching (scoped by API key hash)
  - Error handling for unavailable models with UI warnings
  - **Sequential collaborative execution** for team tasks
- Integration points:
  - `server/openrouter.ts`: Core OpenRouter client with model fetching and chat
  - Bot chat: `/api/bots/:id/chat` endpoint
  - Team chat: `/api/teams/:id/chat` endpoint (parallel bot execution)
  - Brief delegation: Team workspace task processing via `executeCollaborativeTeamTasks`
- Collaborative Execution Architecture:
  - Teams execute sequentially via `executeCollaborativeTeamTasks` function
  - Each bot receives: (1) the original project brief, (2) their specific task, (3) all previous bots' outputs
  - Later bots can reference, build upon, or synthesize earlier teammates' work
  - Errors are handled gracefully - a failed bot doesn't halt the entire sequence
  - Error outputs are passed forward so subsequent bots are aware of failures

**Database Connection**:
- **Neon Serverless PostgreSQL**: Via `process.env.DATABASE_URL`
- WebSocket support for serverless environments using `ws` package

**Required Environment Variables**:
```
DATABASE_URL          # Neon PostgreSQL connection string
SESSION_SECRET        # Session encryption key
OPENROUTER_API_KEY    # OpenRouter API key for AI models
APP_URL               # (Optional) Application URL for API headers
PORT                  # (Optional) Server port, defaults to 5000
NODE_ENV              # (Optional) Environment: development or production
```

**Third-Party UI Libraries**:
- Radix UI: Unstyled, accessible component primitives (40+ packages)
- React Icons: Icon sets (Google, GitHub for OAuth buttons)
- date-fns: Date manipulation and formatting
- cmdk: Command menu interface component
- vaul: Drawer/sheet component implementation

**Build & Development Dependencies**:
- tsx: TypeScript execution for development
- esbuild: Production backend bundling
- Vite: Frontend bundling and dev server
- TypeScript: Type checking and compilation
- Tailwind CSS: Utility-first styling with PostCSS