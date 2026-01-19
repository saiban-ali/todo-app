I want you to plan and then implement a production-quality Next.js application.  
This is a take-home style project where **how the system is built matters more than feature count**.

## Goal

Build a modern, high-performance **task management app** that goes beyond a basic to-do list.  
The app should feel fast, intuitive, and well thought out, with strong UX and clean architecture.

## Core Requirements

### Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Supabase (Auth + Database)
- Supabase type generation using `supabase gen types`
- TailwindCSS (or similar modern styling system)
- Open to high-quality third-party libraries where appropriate

### Authentication & Data

- Implement Supabase authentication
- All tasks must be user-specific
- Enforce data isolation per user at the database and app level
- Persist tasks in Supabase
- Generate and use typed Supabase models via the official typegen utility

### Task Features

Each task should support:

- Title
- Description (optional)
- Priority (sortable via drag and drop)
- Tags (multiple per task)
- Created / updated timestamps

### Functionality

- Create, update, delete tasks
- Drag-and-drop reordering to control priority
- Task search (by text)
- Filter/search by tag
- Infinite scrolling for task lists
- Must handle **thousands of tasks efficiently**
- Smooth animations and transitions throughout the UI

### UI / UX

- Clean, modern, visually polished UI
- Thoughtful animations (list transitions, drag feedback, loading states)
- Fast interactions with minimal friction
- Use motion/animation libraries if helpful
- Avoid overdesign, but make it feel premium

### Performance & Architecture

- Optimize rendering for large lists (virtualization where needed)
- Avoid unnecessary re-renders
- Use sensible state management
- Keep architecture simple, readable, and extensible
- No overengineering, but no shortcuts that break at scale

## Development Flow Requirements

- Start by producing a **clear plan**:
  - Feature breakdown
  - Component structure
  - Data model
  - Key trade-offs
- During implementation:
  - If user input is required (Supabase project setup, env vars, auth config, etc), **pause and ask me explicitly**
  - Only continue after I confirm the step is complete
- Comment code only where intent is not obvious
- Prefer clarity over cleverness

## What to Avoid

- Overly abstract patterns
- Premature optimization beyond what’s needed
- Excessive configuration
- Unnecessary libraries

## Output Expectations

- Step-by-step plan first
- Then implementation following the plan
- Ask before moving past setup steps
- Assume this app will be deployed on Vercel

**Begin by producing the planning document.**
