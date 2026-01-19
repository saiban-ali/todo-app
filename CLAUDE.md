# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.2 application using the App Router, React 19, TypeScript, and Tailwind CSS v4. The project uses pnpm as the package manager.

## Development Commands

### Running the Application
- `pnpm dev` - Start the development server (runs on http://localhost:3000)
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Architecture

### App Router Structure
This project uses Next.js App Router (not Pages Router). All routes are defined in the `app/` directory:
- `app/layout.tsx` - Root layout with font configuration (Geist Sans and Geist Mono from next/font/google)
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles with Tailwind CSS v4 and CSS custom properties for theming

### Styling System
- **Tailwind CSS v4** with PostCSS plugin (`@tailwindcss/postcss`)
- Uses the new `@import "tailwindcss"` syntax (not traditional Tailwind config files)
- CSS custom properties for theming (`--background`, `--foreground`)
- Dark mode support via `prefers-color-scheme` media query
- Font variables: `--font-geist-sans` and `--font-geist-mono`

### TypeScript Configuration
- Path alias: `@/*` maps to project root (`./`)
- Strict mode enabled
- JSX transform: `react-jsx`
- Target: ES2017

### Key Dependencies
- Next.js 16.1.2
- React 19.2.3
- TypeScript 5.x
- Tailwind CSS v4
- ESLint 9 with Next.js config

## Important Notes

- Avoid using `any` type (per user's global CLAUDE.md preferences)
- Use TypeScript strict mode
- This is a fresh Next.js project with minimal customization
