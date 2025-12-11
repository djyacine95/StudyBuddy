StudyBuddy
Overview

StudyBuddy is a study-partner matching platform that connects students based on their schedules, classes, and study habits. It creates compatible study groups, builds session agendas with practice questions, and supports real-time group messaging.

User Preferences

Communication style: simple, everyday language.

System Architecture
Frontend

Framework: React + TypeScript (Vite)

Routing: Wouter with route-based auth checks

State Management: TanStack Query with long-term caching

UI Library: Radix UI + shadcn/ui

Styling: Tailwind CSS, custom themes, light/dark mode, Inter font

Key Pages:

Landing (public)

Dashboard (study groups, upcoming sessions)

Group Detail (chat, agenda, checklist)

Schedule (class management)

Settings (preferences, availability)

Matching (partner discovery)

Auth Flow: Redirect-based login that validates access on each protected route.

Backend

Framework: Express.js + TypeScript

Database: Neon serverless PostgreSQL using Drizzle ORM

Validation: Zod schemas

Auth: Replit Auth (OpenID Connect) with Passport.js

PostgreSQL session store

7-day sessions with secure cookies

Auto-creates user record on first login

WebSockets:

Built-in server for real-time group messaging

Groups stored in a Map for message broadcasting

API:

REST endpoints under /api/*

Auth middleware on all protected routes

Logging middleware with truncated output

Data Models
Main Entities

Users: ID, email, name, profile image, topics, goals, languages, consent flags

Classes: Courses with meeting times and exam dates

Availability: Time windows used for partner matching

Groups: Study groups with compatibility scores

GroupMembers: Records join/leave timestamps

Sessions: Study sessions with agendas, objectives, practice questions, time plans

Messages: Group chat messages

ChecklistItems: Session-specific tasks

All relations are handled with Drizzle’s relational mapping.

Matching & Agenda System (Non-AI wording)

Uses text-based similarity between user topics to calculate how closely students match.

Session builder creates structured study plans with objectives, practice questions, and time blocks based on the course and topics provided.

Design System

Style: Clean, modern layout inspired by productivity tools

Typography: Inter font with defined sizes (hero 48–60px, titles 30–36px, body 16px)

Spacing: Tailwind spacing scale (2, 4, 6, 8, 12, 16, 20, 24)

Colors: HSL-based variables (primary, secondary, accent, etc.) with light/dark mode

Layouts:

Dashboard: 3-column grid

Session View: 2-column split

Mobile: single-column responsive design

External Dependencies

Database: Neon PostgreSQL

Access via DATABASE_URL

WebSocket-compatible connection pooling

Migrations with Drizzle Kit

Auth: Replit OIDC

Uses ISSUER_URL, REPL_ID, SESSION_SECRET

Fonts: Inter from Google Fonts

Dev Tools:

Vite plugins (overlay, cartographer, banner)

TypeScript strict mode

Path aliases

Session Storage: PostgreSQL session store with manual table creation
