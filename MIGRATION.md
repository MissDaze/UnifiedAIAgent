# Migration from Replit to Railway

This document describes the changes made to remove Replit dependencies and make the application fully compatible with Railway deployment.

## Changes Made

### 1. Authentication System
- **Removed**: Replit OAuth/OpenID Connect authentication
- **Added**: Simple session-based authentication system
- **File**: `server/auth.ts` replaces `server/replitAuth.ts`

The new authentication system:
- Uses session-based authentication with PostgreSQL storage
- Creates user accounts based on email addresses
- No longer requires external OAuth providers
- Maintains the same session management approach

### 2. Environment Variables

#### Removed:
- `REPLIT_DOMAINS` - No longer needed
- `REPL_ID` - No longer needed
- `ISSUER_URL` - No longer needed

#### Updated:
- `SESSION_SECRET` - Now has a default fallback for development (still required for production)

#### Optional:
- `RAILWAY_PUBLIC_DOMAIN` - Automatically set by Railway
- `PUBLIC_URL` - Can be set manually if needed

### 3. Dependencies
Removed the following Replit-specific packages from `package.json`:
- `@replit/vite-plugin-cartographer`
- `@replit/vite-plugin-dev-banner`
- `@replit/vite-plugin-runtime-error-modal`

### 4. Code Changes

#### Backend:
- `server/auth.ts`: New simple authentication system
- `server/routes.ts`: Updated to use new auth system
- `server/openrouter.ts`: Updated HTTP-Referer header to use Railway domain
- `server/storage.ts`: Removed Replit-specific comments
- `shared/schema.ts`: Removed Replit-specific comments

#### Frontend:
- `client/src/components/LoginForm.tsx`: Implemented working login form
- `client/src/components/NavHeader.tsx`: Updated login redirect to `/login`

### 5. Documentation
- `README.md`: Complete rewrite with Railway deployment instructions
- `.env.example`: Added with all required environment variables
- `replit.md`: Removed (no longer relevant)

## Migration Steps for Existing Deployments

If you have an existing deployment on Replit and want to migrate to Railway:

1. **Export your database**
   - Create a backup of your Neon/PostgreSQL database
   - Keep your `DATABASE_URL` the same

2. **Create a Railway project**
   - Deploy from your GitHub repository
   - Configure environment variables (see README.md)

3. **Update authentication**
   - Users will need to log in again with the new auth system
   - Previous Replit OAuth sessions will not carry over

4. **Test the deployment**
   - Verify the application starts without errors
   - Test login functionality
   - Verify all features work as expected

## Benefits

1. **Platform Independence**: No longer tied to Replit-specific services
2. **Simplified Authentication**: Easier to understand and maintain
3. **Railway Optimized**: Uses Railway-specific environment variables when available
4. **Reduced Dependencies**: Fewer packages to maintain and update
5. **Cleaner Codebase**: Removed platform-specific code

## Notes

- The new authentication system is intentionally simple for ease of deployment
- For production use, consider implementing more robust authentication (bcrypt password hashing, email verification, etc.)
- All core features (bots, teams, chat, outputs) remain unchanged
- Database schema remains the same - no migrations needed
