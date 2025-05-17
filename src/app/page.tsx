'use client';

import { useState, useEffect } from 'react';
import ProjectBoard from "../components/ProjectBoard";
import GanttChart from "../components/GanttChart";
import TeamSection from "../components/TeamSection";
import Sidebar from "../components/Sidebar";
import { Project, Task, TeamMember } from "../lib/types";
import StatsCard from "./components/StatsCard";
import Toast from "../components/Toast";
import { BriefcaseIcon, CheckCircleIcon, ExclamationTriangleIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { getAllProjects, addProject, updateProject, deleteProject, batchAddProjects } from '../lib/firebase/projectService';
import { getAllTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '../lib/firebase/teamService';

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

// Sample demo team members - these will be used to seed the database if it's empty
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

// Sample demo data - these will be used to seed the database if it's empty
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Project[]>([]);
  
  // Toast notification state
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'info'}>({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch projects and team members from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects from Firebase
        const projectsData = await getAllProjects();
        
        // If no projects exist, seed the database with demo data
        if (projectsData.length === 0) {
          // Add demo projects to Firebase
          await Promise.all(DEMO_PROJECTS.map(project => {
            // Remove the id since Firebase will generate one
            const { id, ...projectData } = project;
            return addProject(projectData as Omit<Project, 'id'>);
          }));
          
          // Fetch again after seeding
          setProjects(await getAllProjects());
        } else {
          setProjects(projectsData);
        }
        
        // Fetch team members from Firebase
        const teamData = await getAllTeamMembers();
        
        // If no team members exist, seed the database with demo data
        if (teamData.length === 0) {
          // Add demo team members to Firebase
          await Promise.all(DEMO_TEAM_MEMBERS.map(member => {
            // Remove the id since Firebase will generate one
            const { id, ...memberData } = member;
            return addTeamMember(memberData as Omit<TeamMember, 'id'>);
          }));
          
          // Fetch again after seeding
          setTeamMembers(await getAllTeamMembers());
        } else {
          setTeamMembers(teamData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Error loading data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate upcoming deadlines
  useEffect(() => {
    if (projects.length > 0) {
      const today = new Date();
      // Set time to start of day for comparison
      today.setHours(0, 0, 0, 0);
      
      // Get projects with upcoming deadlines (within the next 7 days)
      const upcoming = projects
        .filter(project => {
          const dueDate = new Date(project.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          // Calculate days difference
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          // Include if due date is within 7 days (future or today)
          return daysDiff >= 0 && daysDiff <= 7;
        })
        // Sort by closest due date
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        // Take only the first 3
        .slice(0, 3);
      
      setUpcomingDeadlines(upcoming);
    }
  }, [projects]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  // Hide toast notification
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      show: false
    }));
  };

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

  // Update project and add to recent projects
  const handleUpdateProjects = async (updatedProjects: Project[]) => {
    // Check if multiple new projects are being added at once (CSV import)
    const newProjects = updatedProjects.filter(
      project => !projects.some(p => p.id === project.id)
    );
    
    if (newProjects.length > 1) {
      try {
        // Use batch import for CSV imports
        const newProjectsWithoutIds = newProjects.map(({id, ...rest}) => rest);
        await batchAddProjects(newProjectsWithoutIds as any);
        
        // Refresh projects from the database to get the proper IDs
        const refreshedProjects = await getAllProjects();
        setProjects(refreshedProjects);
        
        // Show success message
        showToast(`Successfully imported ${newProjects.length} projects`, 'success');
        return;
      } catch (error) {
        console.error('Error batch importing projects:', error);
        showToast('Error importing projects', 'error');
        return;
      }
    }
    
    // Single project update or deletion
    setProjects(updatedProjects);
    
    // Find the changed project by comparing with current projects
    const changedProject = updatedProjects.find(
      (p) => !projects.some((existing) => existing.id === p.id) || 
      projects.some((existing) => 
        existing.id === p.id && JSON.stringify(existing) !== JSON.stringify(p)
      )
    );

    // If we found a changed project, update it in Firebase
    if (changedProject) {
      // If it's a new project (not in the current list)
      if (!projects.some(p => p.id === changedProject.id)) {
        try {
          // Remove id before adding to Firebase
          const { id, ...projectData } = changedProject;
          await addProject(projectData as Omit<Project, 'id'>);
          showToast('Project added successfully', 'success');
        } catch (error) {
          console.error('Error adding project:', error);
          showToast('Error adding project', 'error');
        }
      } else {
        try {
          // Update existing project
          await updateProject(changedProject.id, changedProject);
          showToast('Project updated successfully', 'success');
        } catch (error) {
          console.error('Error updating project:', error);
          showToast('Error updating project', 'error');
        }
      }
    }

    // Check for deleted projects
    const deletedProject = projects.find(
      p => !updatedProjects.some(updated => updated.id === p.id)
    );

    // If we found a deleted project, remove it from Firebase
    if (deletedProject) {
      try {
        await deleteProject(deletedProject.id);
        
        // Remove from recent projects if it was there
        setRecentProjects(prev => prev.filter(p => p.id !== deletedProject.id));
        
        showToast('Project deleted successfully', 'info');
      } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Error deleting project', 'error');
      }
    }
  };

  // Function to update the recent projects list
  const updateRecentProjects = (project: Project) => {
    console.log('Updating recent projects with:', project.name);
    setRecentProjects(prev => {
      // Remove the project if it's already in the list
      const filtered = prev.filter(p => p.id !== project.id);
      // Add the project to the beginning of the list
      const updated = [project, ...filtered].slice(0, 5); // Keep only the 5 most recent
      
      console.log('New recent projects list:', updated.map(p => p.name));
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentProjects', JSON.stringify(updated));
      }
      
      return updated;
    });
  };

  // Ensure the recent projects list is populated with at least some projects
  useEffect(() => {
    if (projects.length > 0) {
      // Sort projects by most recent timestamp from database
      const sortedProjects = [...projects]
        .sort((a, b) => {
          // First check for updatedAt timestamp
          if (a.updatedAt && b.updatedAt) {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }
          // Then check for createdAt timestamp
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          // Finally fall back to startDate if neither timestamp is available
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        })
        .slice(0, 5); // Keep only the 5 most recent
      
      console.log('Setting recent projects from database timestamps:', 
        sortedProjects.map(p => `${p.name} (${p.updatedAt || p.createdAt || p.startDate})`));
      setRecentProjects(sortedProjects);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentProjects', JSON.stringify(sortedProjects));
      }
    }
  }, [projects]);

  // Load recent projects from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentProjects');
      if (saved) {
        try {
          setRecentProjects(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent projects from localStorage', e);
        }
      }
    }
  }, []);

  // We'll still log when a project is viewed for debugging purposes
  const handleProjectView = (project: Project) => {
    console.log('Project viewed:', project.name);
    // We no longer manually update recent projects since it's now based on database timestamps
  };

  // Update team members
  const handleUpdateTeamMembers = async (updatedTeamMembers: TeamMember[]) => {
    setTeamMembers(updatedTeamMembers);
    
    // Find the changed team member
    const changedMember = updatedTeamMembers.find(
      (m) => !teamMembers.some((existing) => existing.id === m.id) || 
      teamMembers.some((existing) => 
        existing.id === m.id && JSON.stringify(existing) !== JSON.stringify(m)
      )
    );

    // If we found a changed member, update it in Firebase
    if (changedMember) {
      // If it's a new member (not in the current list)
      if (!teamMembers.some(m => m.id === changedMember.id)) {
        try {
          // Remove id before adding to Firebase
          const { id, ...memberData } = changedMember;
          await addTeamMember(memberData as Omit<TeamMember, 'id'>);
          showToast('Team member added successfully', 'success');
        } catch (error) {
          console.error('Error adding team member:', error);
          showToast('Error adding team member', 'error');
        }
      } else {
        try {
          // Update existing member
          await updateTeamMember(changedMember.id, changedMember);
          showToast('Team member updated successfully', 'success');
        } catch (error) {
          console.error('Error updating team member:', error);
          showToast('Error updating team member', 'error');
        }
      }
    }

    // Check for deleted members
    const deletedMember = teamMembers.find(
      m => !updatedTeamMembers.some(updated => updated.id === m.id)
    );

    // If we found a deleted member, remove it from Firebase
    if (deletedMember) {
      try {
        await deleteTeamMember(deletedMember.id);
        showToast('Team member deleted successfully', 'info');
      } catch (error) {
        console.error('Error deleting team member:', error);
        showToast('Error deleting team member', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        recentProjects={recentProjects}
        upcomingDeadlines={upcomingDeadlines}
        onProjectSelect={handleProjectView}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-md pt-2 pb-2 px-8">
          {/* Stats Cards - Moved up by removing title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              label="Total Projects"
              value={projects.length}
              colorClass="text-blue-600"
            />
            <StatsCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="On Track"
              value={projects.filter(p => p.status === 'on-track').length}
              colorClass="text-green-600"
            />
            <StatsCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              label="At Risk / Delayed"
              value={projects.filter(p => p.status === 'at-risk' || p.status === 'delayed').length}
              colorClass="text-red-600"
            />
            <StatsCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              label="Completed"
              value={projects.filter(p => p.status === 'completed').length}
              colorClass="text-purple-600"
            />
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden px-8 py-2">
          {activeTab === 'dashboard' && (
            <div className="animate-slide-in h-full">
              <ProjectBoard 
                projects={projects}
                onUpdateProjects={handleUpdateProjects}
                teamMembers={teamMembers}
                onProjectSelect={handleProjectView}
              />
            </div>
          )}
          {activeTab === 'gantt' && (
            <div className="animate-slide-in h-full">
              <GanttChart projects={projects} />
            </div>
          )}
          {activeTab === 'teams' && (
            <div className="animate-slide-in h-full">
              <TeamSection 
                projects={projects}
                initialTeamMembers={teamMembers}
                onUpdateTeamMembers={handleUpdateTeamMembers}
                onUpdateProjects={handleUpdateProjects}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
