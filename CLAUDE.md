# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration

## Architecture Overview

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS. The project includes shadcn/ui component library setup.

### Key Structure
- **App Router**: Uses Next.js 13+ app directory structure in `src/app/`
- **Component System**: Configured for shadcn/ui with components in `@/components` and utilities in `@/lib/utils`
- **Styling**: Tailwind CSS v4 with PostCSS, custom CSS variables, and New York style theme
- **Fonts**: Uses Geist Sans and Geist Mono fonts via next/font/google

### Important Configurations
- **Path Aliases**: `@/*` maps to `./src/*`
- **shadcn/ui**: Components configured in `components.json` with:
  - Style: "new-york"
  - Base color: "neutral" 
  - CSS variables enabled
  - Lucide icons as icon library
- **TypeScript**: Strict mode enabled with Next.js plugin
- **ESLint**: Uses Next.js core web vitals and TypeScript configurations

### File Organization
```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Home page component
│   └── globals.css         # Global styles and Tailwind imports
└── lib/
    └── utils.ts            # Utility functions (cn helper for className merging)
```

### Dependencies
- **Core**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, class-variance-authority, clsx, tailwind-merge
- **UI**: Lucide React icons
- **Development**: ESLint with Next.js configs