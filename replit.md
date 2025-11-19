# StudyBuddy

## Overview

StudyBuddy is an AI-powered study partner matching platform that connects students based on their schedules, learning topics, and study preferences. The application uses semantic similarity matching via OpenAI embeddings to create compatible study groups, generates personalized session agendas with practice questions, and facilitates real-time collaboration through WebSocket-based messaging.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with route-based authentication guards

**State Management**: TanStack Query (React Query) for server state management with aggressive caching strategies (staleTime: Infinity)

**UI Component Library**: Radix UI primitives with shadcn/ui design system
- Custom theme system using CSS variables for light/dark mode support
- Tailwind CSS for styling with custom design tokens
- Inter font family for consistent typography
- New York style variant for component aesthetics

**Key Pages**:
- Landing: Unauthenticated marketing page with hero section and feature showcase
- Home (Dashboard): Displays user's study groups and upcoming sessions
- Group Detail: Real-time chat interface with WebSocket integration, session agenda viewer, and checklist management
- Schedule: Course/class management interface
- Settings: User preferences and availability configuration
- Matching: AI-powered study partner discovery interface

**Authentication Flow**: Redirect-based authentication that checks auth status on each protected page, automatically redirecting to `/api/login` if unauthorized

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**Database ORM**: Drizzle ORM with Neon serverless PostgreSQL adapter
- Schema-first approach with Zod validation schemas
- Connection pooling via `@neondatabase/serverless`
- WebSocket constructor override for serverless compatibility

**Authentication**: Replit Auth (OpenID Connect)
- Passport.js strategy integration
- Session-based authentication with PostgreSQL session store (`connect-pg-simple`)
- 7-day session TTL with secure, httpOnly cookies
- User auto-provisioning on first login (upsert pattern)

**Real-time Communication**: Native WebSocket server
- Group-based connection management with Map<groupId, Set<WebSocket>>
- Message broadcasting within study group channels
- Separate WebSocket upgrade from HTTP server

**API Structure**:
- RESTful endpoints under `/api/*` prefix
- Authentication middleware (`isAuthenticated`) protecting all non-public routes
- Request/response logging middleware with truncation for readability

### Data Models

**Core Entities**:
- **Users**: Replit Auth integration fields (id, email, firstName, lastName, profileImageUrl) plus study preferences (topics, learningGoals, preferredLanguages, dataUsageConsent)
- **Classes**: User-owned course records with meeting times and exam dates
- **Availability**: Time-based availability windows for matching algorithm
- **Groups**: Study groups with AI-generated compatibility scores
- **GroupMembers**: Many-to-many relationship with join/leave timestamps
- **Sessions**: Scheduled study sessions with AI-generated agendas (objectives, practice questions, time schedules)
- **Messages**: Real-time chat messages with WebSocket delivery
- **ChecklistItems**: Session-specific task tracking

**Relationships**: Drizzle relations configured for bi-directional associations (users->classes, groups->members, sessions->groups, etc.)

### AI Integration

**Provider**: OpenAI API (GPT and embeddings models)

**Embedding Generation**:
- Model: `text-embedding-3-small`
- Used for semantic similarity matching of study preferences and topics
- Cosine similarity calculation for compatibility scoring

**Session Agenda Generation**:
- Generates structured study session plans with objectives, practice questions (Q&A pairs), and time-based activity schedules
- Input parameters: course name, topics array, duration, optional exam date
- Output format: JSON with objectives array, practice questions, and time schedule

**Matching Algorithm**: Semantic vector similarity between user topic embeddings to find compatible study partners

### Design System

**Design Approach**: Modern productivity hybrid drawing from Linear (clean aesthetics), Notion (accessibility), and Slack (collaborative interfaces)

**Typography**: Inter font family with specific weight/size scales for different content types (hero: 48-60px, page titles: 30-36px, body: 16px)

**Spacing System**: Tailwind unit-based spacing (2, 4, 6, 8, 12, 16, 20, 24) for consistent visual rhythm

**Color System**: HSL-based CSS custom properties with semantic naming (primary, secondary, muted, accent, destructive) supporting both light and dark modes

**Layout Patterns**:
- Dashboard: 3-column grid for group cards
- Session views: 2-column split (details | checklist)
- Mobile-first responsive design with single-column stacking

## External Dependencies

**Database**: Neon serverless PostgreSQL
- Accessed via `DATABASE_URL` environment variable
- Connection pooling with WebSocket support for serverless environments
- Schema migrations managed by Drizzle Kit

**Authentication**: Replit Auth OIDC provider
- Issuer URL: `https://replit.com/oidc` (configurable via `ISSUER_URL`)
- Client ID: `REPL_ID` environment variable
- Session secret: `SESSION_SECRET` environment variable

**AI Services**: OpenAI API
- API key: `OPENAI_API_KEY` environment variable
- Models: `text-embedding-3-small` for embeddings, GPT for agenda generation
- Graceful degradation with dummy key when not configured

**CDN**: Google Fonts for Inter font family

**Development Tools**:
- Vite plugins: Runtime error overlay, Replit cartographer, dev banner
- TypeScript with strict mode and path aliases (@/, @shared/, @assets/)

**Session Storage**: PostgreSQL-backed session store with automatic table creation disabled (manual migration required)