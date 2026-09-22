> [!WARNING]  
> **ARCHIVED**: This repository has been moved into the Lukewarm monorepo (under `apps/dashboard`). All future development will happen there. This standalone repository is kept for historical purposes only and will no longer be updated.

# CRM Next (Web)

A modern web dashboard for the Lukewarm system, built with Next.js 15 (React 19).

## Features

- **Dashboard**: Overview of contacts, scans, and activities.
- **Contact Management**:
  - List view with search and filters.
  - Detailed contact view.
  - Manual contact entry.
- **Authentication**: Secure login and registration.
- **Responsive Design**: Optimized for desktop and tablet users.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix Primitives)
- **State/Data**: React Server Components & Server Actions (presumed) / Axios

## Development

Run in the `nextjs` terminal:

```bash
# Start the development server
pnpm run dev
```

## Project Structure

- `app/`: App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Utility functions and potential server actions.
