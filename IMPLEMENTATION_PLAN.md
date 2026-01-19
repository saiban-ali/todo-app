# Task Management App - Implementation Plan

## Overview

Build a production-quality Next.js task management application with Supabase backend, focusing on performance, clean architecture, and excellent UX. The app will support thousands of tasks per user with virtual scrolling, drag-and-drop reordering, and smooth animations.

## User Preferences

- **Authentication**: Email/password + Google OAuth
- **Tag filtering**: OR logic (show tasks with ANY selected tags)
- **Color scheme**: Neutral modern (slate/zinc palette)

## Database Schema

### Tables

```sql
-- Tasks table
tasks (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES auth.users(id),
  title: TEXT NOT NULL,
  description: TEXT,
  priority: INTEGER DEFAULT 0,
  created_at: TIMESTAMPTZ DEFAULT NOW(),
  updated_at: TIMESTAMPTZ DEFAULT NOW()
)

-- Tags table
tags (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES auth.users(id),
  name: TEXT NOT NULL,
  color: TEXT,
  created_at: TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
)

-- Junction table
task_tags (
  task_id: UUID REFERENCES tasks(id),
  tag_id: UUID REFERENCES tags(id),
  PRIMARY KEY (task_id, tag_id)
)
```

### Performance Indexes

- `idx_tasks_user_priority` on `tasks(user_id, priority DESC)`
- `idx_tasks_user_updated` on `tasks(user_id, updated_at DESC)`
- `idx_tasks_search` using GIN for full-text search
- Standard indexes on foreign keys

### Row Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data:

- SELECT/INSERT/UPDATE/DELETE policies on `tasks` filtered by `auth.uid() = user_id`
- Same policies on `tags`
- `task_tags` policies verify ownership through JOIN with tasks table

## Project Structure

```
app/
├── (auth)/                          # Auth route group
│   ├── login/page.tsx              # Login with email + Google OAuth
│   ├── signup/page.tsx             # Signup with email
│   └── layout.tsx                  # Centered auth layout
├── (dashboard)/                     # Protected routes
│   ├── tasks/page.tsx              # Main tasks page (Server Component)
│   └── layout.tsx                  # Dashboard layout with header
├── auth/callback/route.ts          # OAuth callback handler
├── layout.tsx                      # Root layout
├── page.tsx                        # Landing page (public)
└── globals.css                     # Tailwind v4 styles

components/
├── auth/
│   ├── LoginForm.tsx               # Email/password + Google OAuth button
│   ├── SignupForm.tsx              # Email/password signup
│   └── AuthButton.tsx              # User menu + logout
├── tasks/
│   ├── TaskList.tsx                # Virtual scrolling + drag-drop
│   ├── TaskItem.tsx                # Individual task card
│   ├── TaskForm.tsx                # Create/edit modal
│   ├── TaskFilters.tsx             # Search + tag filter
│   └── EmptyState.tsx              # No tasks placeholder
├── tags/
│   ├── TagSelector.tsx             # Multi-select for OR filtering
│   ├── TagBadge.tsx                # Tag display
│   └── TagManager.tsx              # Create/edit/delete tags
├── ui/                             # Reusable components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Spinner.tsx
└── layout/
    └── Header.tsx                  # App header with search + user menu

lib/
├── supabase/
│   ├── client.ts                   # Browser Supabase client
│   ├── server.ts                   # Server Supabase client
│   └── middleware.ts               # Auth helpers
├── stores/
│   ├── taskStore.ts                # Zustand store for tasks
│   └── filterStore.ts              # Zustand store for filters
├── hooks/
│   ├── useTasks.ts                 # Task data fetching
│   ├── useTags.ts                  # Tag data fetching
│   └── useInfiniteScroll.ts        # Infinite scroll logic
└── utils/
    ├── cn.ts                       # Class name utility
    └── validation.ts               # Form validation

types/
├── database.types.ts               # Generated from Supabase
├── task.ts                         # Task-related types
└── tag.ts                          # Tag-related types

middleware.ts                        # Route protection
```

## Tech Stack

### Core Dependencies

- **Next.js 16.1.2** - App Router (already installed)
- **React 19.2.3** - Latest React (already installed)
- **TypeScript 5** - Strict mode (already configured)
- **Tailwind CSS v4** - Modern styling (already installed)
- **pnpm** - Package manager (already configured)

### New Dependencies to Install

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "zustand": "^4.4.7",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@tanstack/react-virtual": "^3.0.1",
    "framer-motion": "^10.18.0",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "supabase": "^1.134.0"
  }
}
```

### Library Rationale

- **@supabase/supabase-js**: Official Supabase client for auth and database
- **@supabase/ssr**: Server-side Supabase with proper cookie handling
- **zustand**: Lightweight state management (1kb), perfect for client state
- **@dnd-kit**: Modern drag-and-drop with accessibility, works with virtualization
- **@tanstack/react-virtual**: Best-in-class virtual scrolling for thousands of tasks
- **framer-motion**: Smooth animations and transitions
- **react-hook-form + zod**: Forms with minimal re-renders and type-safe validation
- **clsx + tailwind-merge**: Conditional Tailwind classes with proper merging

## Implementation Phases

### Phase 0: Supabase Setup (USER ACTION REQUIRED)

**User must complete these steps:**

1. **Create Supabase project**
   - Go to https://supabase.com
   - Create new project
   - Wait for database provisioning (~2 minutes)

2. **Copy credentials**
   - Go to Project Settings > API
   - Copy `Project URL`
   - Copy `anon/public` key

3. **Create `.env.local` file** in project root:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run database migration**
   - Go to Supabase SQL Editor
   - Run the complete database schema (provided in next step)
   - Verify tables created in Table Editor

5. **Configure Google OAuth**
   - Go to Supabase Authentication > Providers
   - Enable Google provider
   - Add OAuth credentials from Google Cloud Console
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

**Development tasks (after user setup):**

- Install all dependencies: `pnpm install`
- Generate TypeScript types: `pnpm supabase gen types typescript --project-id <your-id> > types/database.types.ts`
- Verify connection with simple query

### Phase 1: Foundation & Authentication

**Goal:** Users can sign up, log in, and log out

**Critical files to create:**

- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/supabase/client.ts` - Browser client
- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/supabase/server.ts` - Server client
- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/utils/cn.ts` - Utility for class names
- `/home/saiban-ali/Desktop/work/upwork/todo-app/middleware.ts` - Route protection
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/ui/Button.tsx` - Base button
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/ui/Input.tsx` - Base input
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/auth/LoginForm.tsx` - Login with Google
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/auth/SignupForm.tsx` - Signup form
- `/home/saiban-ali/Desktop/work/upwork/todo-app/app/(auth)/login/page.tsx` - Login page
- `/home/saiban-ali/Desktop/work/upwork/todo-app/app/(auth)/signup/page.tsx` - Signup page
- `/home/saiban-ali/Desktop/work/upwork/todo-app/app/(auth)/layout.tsx` - Auth layout
- `/home/saiban-ali/Desktop/work/upwork/todo-app/app/auth/callback/route.ts` - OAuth callback

**Validation:**

- Can create account with email/password
- Can log in with email/password
- Can log in with Google OAuth
- Session persists across refresh
- Protected routes redirect to login
- Logout works correctly

### Phase 2: Basic Task CRUD

**Goal:** Create, read, update, delete tasks (no tags yet, simple list)

**Critical files to create:**

- `/home/saiban-ali/Desktop/work/upwork/todo-app/types/database.types.ts` - Generated types
- `/home/saiban-ali/Desktop/work/upwork/todo-app/types/task.ts` - Task types
- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/stores/taskStore.ts` - Task state management
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/ui/Modal.tsx` - Modal component
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/ui/Spinner.tsx` - Loading spinner
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/TaskItem.tsx` - Task card
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/TaskForm.tsx` - Create/edit form
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/TaskList.tsx` - Simple list
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/EmptyState.tsx` - No tasks
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/layout/Header.tsx` - App header
- `/home/saiban-ali/Desktop/work/upwork/todo-app/app/(dashboard)/layout.tsx` - Dashboard layout
- `/home/saiban-ali/Desktop/work/upwork/todo-app/app/(dashboard)/tasks/page.tsx` - Tasks page

**Features:**

- Create task with title + description
- Edit existing tasks
- Delete tasks with confirmation
- Optimistic updates (instant feedback)
- Loading and error states
- Empty state when no tasks

**Validation:**

- CRUD operations work
- Data persists in Supabase
- Optimistic updates feel instant
- Error handling works

### Phase 3: Tags System

**Goal:** Create tags, assign to tasks, manage tags

**Critical files to create:**

- `/home/saiban-ali/Desktop/work/upwork/todo-app/types/tag.ts` - Tag types
- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/hooks/useTags.ts` - Tag data fetching
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tags/TagBadge.tsx` - Tag display
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tags/TagSelector.tsx` - Multi-select
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tags/TagManager.tsx` - CRUD for tags

**Features:**

- Create tags with auto-generated colors
- Assign multiple tags to tasks
- Remove tags from tasks
- Delete tags (removes from all tasks)
- Display tags on task cards

**Validation:**

- Can create tags
- Can assign tags to tasks (multiple)
- Tags show on task cards
- Tag deletion removes from all tasks

### Phase 4: Search & Filtering

**Goal:** Search tasks by text, filter by tags (OR logic)

**Critical files to create:**

- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/stores/filterStore.ts` - Filter state
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/TaskFilters.tsx` - Filter UI

**Features:**

- Search by title/description (debounced 300ms)
- Filter by multiple tags (OR logic: show tasks with ANY selected tag)
- Clear all filters button
- Filter state persists in URL query params
- Empty state when no results

**Validation:**

- Search works instantly (debounced)
- Tag filter shows tasks with ANY selected tag
- Combining search + tags works
- Clear filters button resets everything

### Phase 5: Drag & Drop Priority

**Goal:** Reorder tasks by dragging, persist priority

**Critical files to update:**

- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/TaskList.tsx` - Add dnd-kit
- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/TaskItem.tsx` - Add drag handle
- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/stores/taskStore.ts` - Add reorder action

**Features:**

- Drag handle on each task
- Smooth drag animations
- Visual feedback while dragging
- Priority updates on drop
- Optimistic reordering
- Persists to Supabase

**Validation:**

- Can drag tasks to reorder
- Visual feedback is smooth
- Priority persists after refresh
- Drag works with active filters

### Phase 6: Virtual Scrolling

**Goal:** Handle thousands of tasks efficiently

**Critical files to update:**

- `/home/saiban-ali/Desktop/work/upwork/todo-app/components/tasks/TaskList.tsx` - Add virtualization

**Features:**

- Virtual scrolling with @tanstack/react-virtual
- Only render visible tasks (+ overscan of 5)
- Works with drag-and-drop
- Dynamic height estimation

**Validation:**

- Smooth scrolling with 1000+ tasks
- Drag-and-drop still works
- No performance degradation

### Phase 7: Infinite Scroll

**Goal:** Load tasks progressively as user scrolls

**Critical files to create:**

- `/home/saiban-ali/Desktop/work/upwork/todo-app/lib/hooks/useInfiniteScroll.ts` - Pagination logic

**Features:**

- Load 50 tasks initially
- Load more as user scrolls to bottom
- Loading spinner at bottom
- "No more tasks" indicator

**Validation:**

- Tasks load in batches
- Smooth experience scrolling
- Works with filters/search

### Phase 8: Animations & Polish

**Goal:** Premium feel with smooth animations

**Features:**

- Layout animations for task list reordering (framer-motion)
- Exit animations for task deletion
- Hover/focus states on all interactive elements
- Loading skeletons for initial load
- Micro-interactions (button press, drag feedback)
- Toast notifications for actions
- Responsive design (mobile + desktop)

**Validation:**

- Animations feel smooth (60fps)
- Mobile experience is excellent
- App feels premium

### Phase 9: Performance Optimization

**Goal:** Production-ready performance

**Optimizations:**

- React.memo on TaskItem to prevent re-renders
- useCallback for event handlers
- Debounced search (300ms)
- Optimize Supabase queries (select only needed fields)
- Code splitting for modals
- Lighthouse audit (target score > 90)

**Validation:**

- No unnecessary re-renders
- Fast on slow networks
- Smooth on mobile devices

### Phase 10: Deployment

**Goal:** Deploy to Vercel

**Steps:**

1. Add error boundaries
2. Test edge cases (empty states, long text)
3. Test auth flows thoroughly
4. Set up Vercel project
5. Add environment variables in Vercel
6. Deploy production build
7. Test in production
8. Monitor logs for errors

**Validation:**

- App works in production
- No errors in Vercel logs
- Fast initial load
- SEO meta tags correct

## Architecture Decisions

### Server vs Client Components

**Server Components (data fetching, auth checks):**

- `app/layout.tsx` - Font setup
- `app/(dashboard)/layout.tsx` - Auth check, initial data
- `app/(dashboard)/tasks/page.tsx` - Initial task fetch

**Client Components (interactivity):**

- All forms, buttons, modals
- TaskList (drag-drop, virtual scroll)
- Filters and search
- Auth forms

**Rationale:** Server Components reduce JS bundle, Client Components handle complex interactions

### State Management: Zustand

**Why Zustand over React Query:**

- Simpler setup (no provider)
- Perfect for optimistic updates
- Lighter bundle size
- Sufficient for this use case

**Stores:**

- `taskStore` - All task data and mutations
- `filterStore` - Search query and tag filters

### Optimistic Updates Pattern

All mutations (create, update, delete, reorder) use optimistic updates:

1. Update local state immediately
2. Make API call to Supabase
3. On success: no action (already updated)
4. On error: rollback + show error

**Result:** App feels instant, even on slow networks

### Performance Strategy

**For large datasets (1000+ tasks):**

- Virtual scrolling (only render visible items)
- Pagination (load 50 at a time)
- Indexed queries (fast even with 100k+ tasks)
- Client-side filtering (fast for < 1000 tasks)
- Server-side search available if needed (PostgreSQL full-text)

## Critical Files (in creation order)

1. `.env.local` - Environment variables
2. `lib/supabase/client.ts` - Browser Supabase client
3. `lib/supabase/server.ts` - Server Supabase client
4. `middleware.ts` - Route protection
5. `types/database.types.ts` - Generated Supabase types
6. `lib/stores/taskStore.ts` - Task state management
7. `components/tasks/TaskList.tsx` - Main task UI
8. `app/(dashboard)/tasks/page.tsx` - Tasks page

## Verification & Testing

### End-to-End Testing Flow

1. **Setup Verification:**

   ```bash
   pnpm install
   pnpm dev
   # Should start on localhost:3000
   ```

2. **Authentication Flow:**
   - Visit `/signup` → create account
   - Verify email confirmation (if enabled)
   - Visit `/login` → log in with email/password
   - Click "Sign in with Google" → OAuth flow
   - Check session persists after refresh
   - Click logout → redirects to landing page

3. **Task Management:**
   - Create 5 tasks with different titles
   - Edit a task's title and description
   - Delete a task → confirm it's gone
   - Refresh page → tasks persist

4. **Tags:**
   - Create 3 tags (e.g., "urgent", "work", "personal")
   - Assign 2 tags to a task
   - Create more tasks with various tag combinations
   - Verify tags display correctly

5. **Search & Filter:**
   - Search for task by title
   - Clear search
   - Filter by 1 tag → shows tasks with that tag
   - Filter by 2 tags → shows tasks with ANY of those tags (OR logic)
   - Combine search + filter
   - Clear all filters

6. **Drag & Drop:**
   - Drag a task to a new position
   - Verify visual feedback during drag
   - Drop task → priority updates
   - Refresh page → new order persists
   - Try dragging while filters active

7. **Performance (optional but recommended):**
   - Use Supabase SQL Editor to insert 1000+ test tasks:
     ```sql
     INSERT INTO tasks (user_id, title, priority)
     SELECT
       'your-user-id',
       'Test Task ' || generate_series,
       generate_series
     FROM generate_series(1, 1000);
     ```
   - Verify smooth scrolling
   - Verify search/filter still fast
   - Verify drag-and-drop still works

8. **Mobile Testing:**
   - Open DevTools → mobile viewport
   - Test all features on mobile view
   - Verify touch interactions work
   - Check responsive layout

9. **Production Build:**

   ```bash
   pnpm build
   pnpm start
   ```

   - Verify no build errors
   - Test in production mode locally
   - Check bundle size in `.next` output

### Success Criteria

- ✅ All CRUD operations work correctly
- ✅ Authentication flows (email + Google OAuth) work
- ✅ Tasks are user-specific (RLS enforced)
- ✅ Search and tag filtering work with OR logic
- ✅ Drag-and-drop reordering works smoothly
- ✅ Handles 1000+ tasks without lag
- ✅ Animations are smooth (no jank)
- ✅ Mobile responsive
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Lighthouse score > 90

## Development Workflow

1. **Start with Phase 0:** Pause and wait for user to complete Supabase setup
2. **Phase-by-phase implementation:** Complete each phase fully before moving on
3. **Test after each phase:** Verify features work before continuing
4. **Ask before proceeding:** If uncertain about approach or need user input, ask explicitly
5. **Comment only where needed:** Code should be self-documenting, comments only for complex logic
6. **Follow TypeScript strict mode:** No `any` types (user preference)

## Post-Implementation

### Deployment Steps

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Test in production
6. Monitor Vercel logs

### Future Enhancements (Phase 11+)

- Real-time updates (Supabase Realtime subscriptions)
- Recurring tasks
- Task due dates and reminders
- Collaborative task sharing
- Task templates
- Dark mode toggle (beyond system preference)
- Keyboard shortcuts
- Export tasks (CSV, JSON)
- Task analytics/insights

---

## Summary

This plan delivers a **production-quality task management app** with:

- **Scalability**: Handles thousands of tasks efficiently with virtual scrolling
- **Performance**: Optimistic updates, efficient state management, indexed queries
- **UX**: Smooth animations, instant feedback, premium feel
- **Architecture**: Clean separation of concerns, type-safe, maintainable
- **Security**: Row-level security, proper auth, user isolation

The implementation will be done in **10 well-defined phases**, starting with user-required Supabase setup, then building from authentication through to deployment. Each phase is independently testable and delivers incremental value.
