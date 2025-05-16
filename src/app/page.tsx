'use client';

import { useState } from 'react';
import ProjectBoard from "../components/ProjectBoard";
import GanttChart from "../components/GanttChart";
import TeamSection from "../components/TeamSection";
import Sidebar from "../components/Sidebar";
import { Project, Task, TeamMember } from "../lib/types";

// Default tasks for private studies
const DEFAULT_TASKS: Task[] = [
  { id: '1', name: 'TOR Submitted', completed: false, order: 1 },
  { id: '2', name: 'Data Collection', completed: false, order: 2 },
  { id: '3', name: 'Transit and AT Network', completed: false, order: 3 },
  { id: '4', name: 'Traffic Analysis', completed: false, order: 4 },
  { id: '5', name: 'Site Plan Review', completed: false, order: 5 },
  { id: '6', name: 'Site Circulation and Access Review', completed: false, order: 6 },
  { id: '7', name: 'Sightline Review', completed: false, order: 7 },
  { id: '8', name: 'Turn Lane Warrants', completed: false, order: 8 },
  { id: '9', name: 'Signal Warrants', completed: false, order: 9 },
  { id: '10', name: 'Parking and Loading Review', completed: false, order: 10 },
  { id: '11', name: 'TDM Plan', completed: false, order: 11 },
  { id: '12', name: 'Draft Report Submitted', completed: false, order: 12 },
  { id: '13', name: 'Comments Received', completed: false, order: 13 },
  { id: '14', name: 'Final Report Submitted', completed: false, order: 14 },
];

// Sample demo team members
const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Project Manager',
    email: 'john.doe@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'Traffic Engineer',
    email: 'jane.smith@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    role: 'Transportation Planner',
    email: 'robert.johnson@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

// Sample demo data
const DEMO_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Downtown Intersection Improvement',
    client: 'City of Example',
    clientType: 'public', // Public client
    startDate: '2023-10-01',
    dueDate: '2023-12-15',
    status: 'on-track',
    priority: 'high',
    tasks: [
      { id: '1', name: 'Project Setup', completed: true, order: 1 },
      { id: '2', name: 'Stakeholder Consultation', completed: true, order: 2 },
      { id: '3', name: 'Traffic Counts', completed: false, order: 3 },
      { id: '4', name: 'Analysis', completed: false, order: 4 },
      { id: '5', name: 'Recommendations', completed: false, order: 5 },
      { id: '6', name: 'Draft Report', completed: false, order: 6 },
      { id: '7', name: 'Final Report', completed: false, order: 7 },
    ],
    milestones: [
      { id: 'm1', name: 'Project Kickoff', date: '2023-10-05', completed: true },
      { id: 'm2', name: 'Data Collection Complete', date: '2023-11-01', completed: false },
      { id: 'm3', name: 'Final Presentation', date: '2023-12-10', completed: false },
    ],
    notes: [
      {
        id: '1',
        content: "Initial consultation with City Council completed. Traffic count data needed for peak hours.",
        timestamp: "2023-10-15T09:30:00Z",
        authorId: '1'
      },
      {
        id: '2',
        content: "Meeting scheduled with public works department for next week.",
        timestamp: "2023-10-18T14:45:00Z",
        authorId: '2'
      }
    ],
    assignedTeam: ['1', '2'],
  },
  {
    id: '2',
    name: 'Highway 101 Traffic Study',
    client: 'State DOT',
    clientType: 'public', // Public client
    startDate: '2023-09-15',
    dueDate: '2023-11-30',
    status: 'delayed',
    priority: 'medium',
    tasks: [
      { id: '1', name: 'Data Collection', completed: true, order: 1 },
      { id: '2', name: 'Traffic Model Setup', completed: true, order: 2 },
      { id: '3', name: 'Capacity Analysis', completed: true, order: 3 },
      { id: '4', name: 'Future Projections', completed: false, order: 4 },
      { id: '5', name: 'Recommendations', completed: false, order: 5 },
      { id: '6', name: 'Draft Report', completed: false, order: 6 },
      { id: '7', name: 'Final Report', completed: false, order: 7 },
    ],
    milestones: [
      { id: 'm1', name: 'Model Calibration', date: '2023-10-15', completed: true },
      { id: 'm2', name: 'Traffic Analysis Approval', date: '2023-11-15', completed: false },
    ],
    notes: [
      {
        id: '1',
        content: "Delay due to additional scope requirements from DOT. Need to incorporate weekend traffic patterns.",
        timestamp: "2023-11-05T11:20:00Z",
        authorId: '2'
      }
    ],
    assignedTeam: ['2'],
  },
  {
    id: '3',
    name: 'Residential Development Review',
    client: 'XYZ Developers Inc.',
    clientType: 'private', // Private client
    startDate: '2023-11-01',
    dueDate: '2024-02-28',
    status: 'at-risk',
    priority: 'high',
    tasks: [
      { id: '1', name: 'TOR Submitted', completed: true, order: 1 },
      { id: '2', name: 'Data Collection', completed: true, order: 2 },
      { id: '3', name: 'Transit and AT Network', completed: true, order: 3 },
      { id: '4', name: 'Traffic Analysis', completed: true, order: 4 },
      { id: '5', name: 'Site Plan Review', completed: false, order: 5 },
      { id: '6', name: 'Site Circulation and Access Review', completed: false, order: 6 },
      { id: '7', name: 'Sightline Review', completed: false, order: 7 },
      { id: '8', name: 'Turn Lane Warrants', completed: false, order: 8 },
      { id: '9', name: 'Signal Warrants', completed: false, order: 9 },
      { id: '10', name: 'Parking and Loading Review', completed: false, order: 10 },
      { id: '11', name: 'TDM Plan', completed: false, order: 11 },
      { id: '12', name: 'Draft Report Submitted', completed: false, order: 12 },
      { id: '13', name: 'Comments Received', completed: false, order: 13 },
      { id: '14', name: 'Final Report Submitted', completed: false, order: 14 },
    ],
    milestones: [
      { id: 'm1', name: 'Initial Submission', date: '2023-11-05', completed: true },
      { id: 'm2', name: 'Mid-Review Meeting', date: '2023-12-15', completed: false },
      { id: 'm3', name: 'Municipal Approval', date: '2024-01-30', completed: false },
      { id: 'm4', name: 'Client Sign-off', date: '2024-02-25', completed: false, color: '#EA580C' }, // Custom color
    ],
    notes: [
      {
        id: '1',
        content: "Developer has requested additional analysis for bicycle infrastructure.",
        timestamp: "2023-12-01T10:15:00Z",
        authorId: '3'
      },
      {
        id: '2',
        content: "Site visit scheduled for next week.",
        timestamp: "2023-12-05T16:30:00Z",
        authorId: '1'
      }
    ],
    assignedTeam: ['1', '3'],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gantt' | 'teams'>('dashboard');
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEMO_TEAM_MEMBERS);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Update team members
  const handleUpdateTeamMembers = (updatedTeamMembers: TeamMember[]) => {
    setTeamMembers(updatedTeamMembers);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Management Portal</h1>
        </div>
        
        {/* Dynamic Content based on active tab */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <ProjectBoard 
              projects={projects}
              onUpdateProjects={setProjects}
              teamMembers={teamMembers}
            />
          )}

          {activeTab === 'gantt' && (
            <div className="mb-6">
              <GanttChart projects={projects} />
        </div>
          )}

          {activeTab === 'teams' && (
            <TeamSection 
              projects={projects}
              initialTeamMembers={teamMembers}
              onUpdateTeamMembers={handleUpdateTeamMembers}
            />
          )}
        </div>
      </main>
    </div>
  );
}
