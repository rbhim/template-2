# Traffic/Transportation Project Management App

A modern project management dashboard for traffic/transportation engineering consulting firms. Visually track projects through customizable stages, manage tasks, teams, and deadlines, and gain insights with analytics and timelines.

## Features
- **Project & Task Tracking:** Create, edit, and track projects through customizable stages (e.g., TOR submitted, Data collection, Analysis, etc.)
- **Customizable Tasks:** Add, reorder, and group tasks; drag-and-drop support
- **Status & Priority:** Color-coded status badges and priority indicators
- **Dashboard Overview:** Tabbed interface for Dashboard, Timeline (Gantt), Team, Task Categories, and Analytics
- **Gantt Chart:** Visual timeline of project stages and deadlines
- **Analytics:** Project stats, donut/bar charts, deadlines, and progress
- **Team Management:** Assign team members, manage roles, and display avatars
- **Task Categories:** Custom categories and grouping for tasks
- **Notes:** Add and manage project notes with author attribution
- **Dark Mode:** Fully supported, toggleable
- **Modern UI/UX:** Responsive, accessible, and visually appealing

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
    /components                 # All React components (ProjectBoard, ProjectItem, TaskList, GanttChart, ProjectStats, TeamSection, TaskCategoryManager, etc.)
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

---

*Built with ❤️ for engineering teams managing complex projects.*