# Task Manager

A modern, production-quality task management application built with Next.js 16, React 19, TypeScript, and Supabase.

## Features

- **Authentication**: Email/password and Google OAuth
- **Task Management**: Create, edit, delete, and organize tasks
- **Tags System**: Categorize tasks with colorful tags
- **Search & Filtering**: Find tasks quickly with debounced search and tag filters (OR logic)
- **Drag & Drop**: Reorder tasks by priority with smooth animations
- **Virtual Scrolling**: Handle thousands of tasks efficiently
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 16.1.2 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Animations**: Framer Motion
- **Virtualization**: @tanstack/react-virtual
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd todo-app
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up Supabase**

- Create a new project at [supabase.com](https://supabase.com)
- Go to Project Settings > API and copy:
  - Project URL
  - anon/public key

4. **Configure environment variables**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. **Database is already set up**

The database schema has been applied to your Supabase project. If you need to regenerate types:

```bash
pnpm supabase gen types typescript --linked > types/database.types.ts
```

6. **Start the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/              # Authentication routes
│   ├── login/
│   └── signup/
├── (dashboard)/         # Protected routes
│   └── tasks/
├── auth/callback/       # OAuth callback
└── layout.tsx           # Root layout

components/
├── auth/                # Authentication components
├── tasks/               # Task management components
├── tags/                # Tag management components
├── ui/                  # Reusable UI components
└── layout/              # Layout components

lib/
├── stores/              # Zustand state management
├── supabase/            # Supabase client configuration
├── hooks/               # Custom React hooks
└── utils/               # Utility functions

types/                   # TypeScript type definitions
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Deployment to Vercel

1. **Push your code to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push
```

2. **Connect to Vercel**

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Vercel will auto-detect Next.js

3. **Add environment variables**

In Vercel dashboard > Settings > Environment Variables, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**

Vercel will automatically deploy on every push to main.

5. **Update Supabase redirect URLs**

In Supabase Dashboard > Authentication > URL Configuration:

- Add your Vercel domain to Redirect URLs
- Example: `https://your-app.vercel.app/auth/callback`

## Features in Detail

### Authentication

- Email/password authentication with Supabase Auth
- Google OAuth integration
- Automatic session management
- Protected routes with middleware
- Row-level security (RLS) for data isolation

### Task Management

- Create tasks with title and description
- Edit existing tasks inline
- Delete tasks with confirmation
- Optimistic UI updates for instant feedback
- Automatic save with error handling

### Tags

- Create custom tags with auto-generated colors
- Assign multiple tags to tasks
- Filter tasks by tags (OR logic - shows tasks with ANY selected tag)
- Manage tags: create, edit, and delete
- Tag deletion removes tags from all associated tasks

### Search & Filtering

- Real-time search across task titles and descriptions
- Debounced input (300ms) for performance
- Tag filtering with OR logic
- Combined search and tag filtering
- Clear all filters button
- Shows filtered count

### Drag & Drop

- Intuitive drag handles on each task
- Smooth animations during drag
- Visual feedback while dragging
- Priority automatically updates on drop
- Disabled when filters are active (for clarity)

### Performance Optimizations

- Virtual scrolling for lists with 1000+ tasks
- React.memo to prevent unnecessary re-renders
- useCallback for stable function references
- Debounced search input
- Optimized Supabase queries
- Lazy loading of components

## Database Schema

### Tables

**tasks**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `title` (TEXT)
- `description` (TEXT, nullable)
- `priority` (INTEGER, for ordering)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**tags**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (TEXT)
- `color` (TEXT)
- `created_at` (TIMESTAMPTZ)

**task_tags** (Junction table)
- `task_id` (UUID, Foreign Key to tasks)
- `tag_id` (UUID, Foreign Key to tags)
- Primary Key: (task_id, tag_id)

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Policies enforce user_id matching
- Automatic CASCADE deletion for related records

## License

MIT
