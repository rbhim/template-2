# Traffic/Transportation Project Management App

A modern project management dashboard for traffic/transportation engineering consulting firms. Visually track projects through customizable stages, manage tasks, teams, and deadlines, and gain insights with timelines.

## Features
- **Project & Task Tracking:** Create, edit, and track projects through customizable stages (e.g., TOR submitted, Data collection, Analysis, etc.)
- **Customizable Tasks:** Add, reorder, and group tasks; drag-and-drop support
- **Status & Priority:** Color-coded status badges and priority indicators
- **Dashboard Overview:** Tabbed interface for Dashboard, Timeline (Gantt), and Team management
- **Interactive Gantt Chart:** 
  - Visual timeline of project stages and deadlines
  - Interactive timeline bars with resize handles to adjust start/end dates
  - Project zooming feature to focus on specific project timelines
  - Today line indicator for quick timeline reference
  - Expandable tasks view for detailed project breakdown
- **Team Management:** Assign team members, manage roles, and display avatars
- **Task Categories:** Custom categories and grouping for tasks
- **Notes:** Add and manage project notes with author attribution and system notes support
- **Dark Mode:** Fully supported, toggleable
- **Recent Projects Tracking:** Automatically tracks and displays recently viewed/updated projects
- **User Experience:** 
  - Collapsible filter sections to maximize screen space
  - Confirmation dialogs for all deletion actions (projects, tasks, notes, team members)
  - Unsaved changes protection when canceling forms
  - Responsive, accessible, and visually appealing interface
  - Animated transitions and hover effects

## Tech Stack
- **Next.js 14 App Router** (React, SSR/SSG, API routes)
- **TypeScript**
- **TailwindCSS**
- **Vercel AI SDK** (OpenAI, Anthropic, Replicate, Deepgram integrations)
- **Firebase** (Auth, Storage, Database utilities available)

## Folder Structure
```
/src
  /app
    page.tsx, layout.tsx         # Main app entry and layout
    /api                        # API routes (OpenAI, Anthropic, Replicate, Deepgram, etc.)
    /components                 # All React components (ProjectBoard, ProjectItem, KanbanBoard, GanttChart, TeamSection, etc.)
    /lib                        # Types, helpers, hooks, and contexts (Firebase, Auth, Deepgram, etc.)
```

## Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Development Notes
- Uses demo data for projects/tasks by default. Avoids random values that cause hydration errors.
- All new features/components should be modular and placed in `/src/app/components`.
- Firebase utilities are available but only used if persistent backend is required.
- Follows best practices for accessibility and responsive design.
- For AI/LLM features, uses Vercel AI SDK and streaming APIs.

## Recent Updates
- Added collapsible filters section to maximize dashboard space
- Added drag-to-resize functionality for Gantt chart timeline bars
- Implemented system notes for project documentation without author attribution
- Enhanced Recent Projects sidebar tracking using database timestamps
- Added visual feedback for timeline interactions 

---

*Built with ❤️ for engineering teams managing complex projects.*