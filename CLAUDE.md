# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `pnpm install`
- **Start development server**: `pnpm dev` (runs on http://localhost:3000)
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Lint code**: `pnpm lint`
- **Fix linting issues**: `pnpm lint:fix`
- **Create admin user**: `pnpm create-admin` (runs scripts/create-admin.js)

## Architecture Overview

This is a **Nuxt 3 calendar application** with MongoDB backend, designed for internal network use (no internet access). The app features multi-user calendar management with role-based permissions.

### Key Technologies
- **Frontend**: Nuxt 3, Vue 3, TypeScript, Vuetify 3, FullCalendar
- **Backend**: Nuxt Server API (Nitro), MongoDB with Mongoose
- **Authentication**: JWT-based auth with @sidebase/nuxt-auth
- **State Management**: Pinia (configured but stores/ directory empty)
- **Internationalization**: @nuxtjs/i18n with Chinese Traditional (default), Simplified Chinese, and English

### Core Models
Located in `server/models/`:
- **User**: username, password (bcrypt hashed), displayName, roles (admin/user)
- **Calendar**: name, category, ownerId, permissions array with userId + accessLevel (view/edit)
- **Event**: calendarId, subject, description, startTime, endTime, allDay, createdBy

### Permission System
- **Admin users**: Full access to all calendars and events
- **Regular users**: Access based on calendar permissions (view/edit)
- **Calendar permissions**: Users can have "view" or "edit" access to specific calendars
- **Owner permissions**: Calendar owners have full access to their calendars

### Authentication Flow
- JWT tokens stored in httpOnly cookies (`auth-token`)
- Server utilities: `requireAuth()`, `requireAdmin()`, `requireAdminAuth()` in `server/utils/auth.ts`
- Permission utilities: `requireCalendarPermission()`, `getUserAccessibleCalendarIds()` in `server/utils/permissions.ts`
- Middleware: `admin.ts` for admin-only pages

### API Structure
Server API endpoints in `server/api/`:
- **Auth**: `/auth/login`, `/auth/logout`, `/auth/register`, `/auth/session`
- **Users**: CRUD operations (admin only)
- **Calendars**: CRUD + permissions management
- **Events**: CRUD + calendar-specific and aggregated views

### Frontend Components
Key components in `components/`:
- **CalendarView.vue**: FullCalendar wrapper for main calendar display
- **EventModal.vue**: Event creation/editing modal
- **FilterPanel.vue**: Event filtering interface
- **Admin components**: Calendar and user management interfaces

### Pages Structure
- **Main pages**: `/` (aggregated calendar view), `/calendar.vue`, `/calendars.vue`
- **Admin pages**: `/admin/` (dashboard), `/admin/calendars/`, `/admin/users.vue`
- **Auth**: `/login.vue`

## Development Notes

### Code Style (from .cursorrules)
- Use Composition API with `<script setup>`
- Prefer functional/declarative patterns over classes
- Use TypeScript interfaces over types
- PascalCase for component files
- Composables named as `use<Name>`

### Data Fetching Patterns
- `useFetch` for SSR-optimized data fetching
- `$fetch` for client-side requests in event handlers
- `useAsyncData` for complex data fetching logic

### Environment Variables
Required in `.env`:
- `MONGODB_URI`: MongoDB connection string
- `NUXT_AUTH_SECRET`: JWT secret for token signing
- `NUXT_AUTH_ORIGIN`: Base URL for auth (optional)

### Database Indexes
Models include performance indexes on:
- User: username
- Calendar: permissions.userId, ownerId, name
- Event: calendarId, startTime, endTime, createdBy

### Testing
Check package.json for available test commands. No specific test framework detected in current setup.