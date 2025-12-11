# StudyBuddy

## Overview
StudyBuddy is a study-partner matching platform that connects students based on their schedules, classes, and study habits. It creates compatible study groups, builds session agendas with practice questions, and supports real-time group messaging.

---

## User Preferences
- Communication style: simple, everyday language.

---

## System Architecture

### Frontend
- **Framework:** React + TypeScript (Vite)
- **Routing:** Wouter with route-based auth checks
- **State Management:** TanStack Query with long-term caching
- **UI Library:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS, custom themes, light/dark mode, Inter font
- **Key Pages:**
  - Landing (public)
  - Dashboard (study groups, upcoming sessions)
  - Group Detail (chat, agenda, checklist)
  - Schedule (class management)
  - Settings (preferences, availability)
  - Matching (partner discovery)
- **Authentication Flow:** Redirect-based login that validates access on each protected route.

---

### Backend
- **Framework:** Express.js + TypeScript
- **Database:** Neon serverless PostgreSQL using Drizzle ORM
- **Validation:** Zod schemas
- **Authentication:** Replit Auth (OpenID Connect) with Passport.js  
  - PostgreSQL session store  
  - 7-day secure, httpOnly sessions  
  - Auto-creates user record on first login
- **WebSockets:**
  - Built-in server for real-time group messaging
  - Group connections stored in a Map for broadcasting

- **API:**
  - REST endpoints under `/api/*`
  - Authentication middleware on protected routes
  - Logging middleware with truncated output

---

## Data Models

### Main Entities
- **Users:** ID, email, name, profile image, topics, goals, languages, consent flags
- **Classes:** Courses with meeting times and exam dates
- **Availability:** Time windows used for matching
- **Groups:** Study groups with compatibility scores
- **GroupMembers:** Join/leave timestamps
- **Sessions:** Study sessions with agendas, objectives, practice questions, and time plans
- **Messages:** Group chat messages
- **ChecklistItems:** Session-specific tasks

Relations are defined using Drizzle’s relational features.

---

## Matching & Session Builder
- Uses text-based similarity between user topics to calculate match strength.
- Session builder creates structured study plans with objectives, practice questions, and time blocks based on course information and selected topics.

---

## Design System

### Style
Clean, modern layout inspired by productivity tools.

### Typography
- Inter font  
- Sizes: hero (48–60px), titles (30–36px), body (16px)

### Spacing
- Tailwind spacing: 2, 4, 6, 8, 12, 16, 20, 24

### Color System
- HSL-based CSS variables (primary, secondary, accent, muted, destructive)
- Supports light and dark themes

### Layout Patterns
- Dashboard: 3-column grid
- Session View: 2-column split (details | checklist)
- Mobile: single-column responsive layout

---

## External Dependencies

### Database
- Neon PostgreSQL
- Access via `DATABASE_URL`
- WebSocket-compatible connection pooling
- Migrations with Drizzle Kit

### Authentication
- Replit OIDC provider
- Config via `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`

### Fonts
- Inter (Google Fonts CDN)

### Development Tools
- Vite plugins (overlay, cartographer, dev banner)
- TypeScript strict mode
- Path aliases

### Session Storage
- PostgreSQL session store  
- Manual table creation required
