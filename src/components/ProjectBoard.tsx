'use client';

import { useState, useEffect } from 'react';
import ProjectItem from './ProjectItem';
import { Project, Task, ProjectStatus, ProjectPriority, TeamMember } from '../lib/types';
import CSVImport from './CSVImport';

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

interface ProjectBoardProps {
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
  teamMembers: TeamMember[];
  onProjectSelect?: (project: Project) => void;
}

export default function ProjectBoard({ projects, onUpdateProjects, teamMembers, onProjectSelect = () => {} }: ProjectBoardProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectDueDate, setNewProjectDueDate] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>('on-track');
  const [newProjectPriority, setNewProjectPriority] = useState<ProjectPriority>('medium');
  const [clientType, setClientType] = useState<'private' | 'public'>('private');
  const [customTaskName, setCustomTaskName] = useState('');
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'all'>('all');
  const [activeSort, setActiveSort] = useState<'dueDate' | 'name' | 'priority'>('dueDate');
  const [activeClientTypeFilter, setActiveClientTypeFilter] = useState<'all' | 'private' | 'public'>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const addCustomTask = () => {
    if (!customTaskName.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      name: customTaskName,
      completed: false,
      order: customTasks.length + 1,
    };
    
    setCustomTasks([...customTasks, newTask]);
    setCustomTaskName('');
  };

  const removeCustomTask = (taskId: string) => {
    setCustomTasks(customTasks.filter(task => task.id !== taskId).map((task, index) => ({
      ...task,
      order: index + 1,
    })));
  };

  const addNewProject = () => {
    if (!newProjectName || !newProjectClient || !newProjectStartDate || !newProjectDueDate) return;
    
    // Use default tasks for private clients, custom tasks for public clients
    const projectTasks = clientType === 'private' 
      ? DEFAULT_TASKS.map(task => ({...task}))
      : customTasks.length > 0 
        ? customTasks 
        : [{ id: '1', name: 'Define project scope', completed: false, order: 1 }];
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      client: newProjectClient,
      clientType: clientType,
      startDate: newProjectStartDate,
      dueDate: newProjectDueDate,
      status: newProjectStatus,
      priority: newProjectPriority,
      tasks: projectTasks,
      notes: [],
      assignedTeam: [],
    };
    
    onUpdateProjects([...projects, newProject]);
    setNewProjectName('');
    setNewProjectClient('');
    setNewProjectStartDate('');
    setNewProjectDueDate('');
    setNewProjectStatus('on-track');
    setNewProjectPriority('medium');
    setClientType('private');
    setCustomTasks([]);
    setShowNewProjectForm(false);
  };

  const updateProject = (updatedProject: Project) => {
    onUpdateProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
  };

  const deleteProject = (projectId: string) => {
    onUpdateProjects(projects.filter(project => project.id !== projectId));
  };

  const handleImportProjects = (importedProjects: Project[]) => {
    // When importing projects via CSV, we need to ensure they get unique IDs
    // that will be replaced with Firebase IDs later in the parent component
    const projectsWithUniqueIds = importedProjects.map(project => ({
      ...project,
      id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    onUpdateProjects([...projects, ...projectsWithUniqueIds]);
  };

  // Filter projects based on status, client type, and search term
  const filteredProjects = projects
    .filter(project => activeFilter === 'all' || project.status === activeFilter)
    .filter(project => activeClientTypeFilter === 'all' || project.clientType === activeClientTypeFilter)
    .filter(project => {
      if (!searchTerm.trim()) return true;
      
      const term = searchTerm.toLowerCase().trim();
      return (
        project.name.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term) ||
        (project.tasks.some(task => task.name.toLowerCase().includes(term))) ||
        // Also search in status and priority
        (project.status?.toLowerCase().includes(term)) ||
        (project.priority?.toLowerCase().includes(term)) ||
        // Search in milestones if any
        (project.milestones?.some(milestone => 
          milestone.name.toLowerCase().includes(term)
        )) ||
        // Search in notes if any
        (project.notes?.some(note => 
          note.content.toLowerCase().includes(term)
        ))
      );
    });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (activeSort === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (activeSort === 'name') {
      return a.name.localeCompare(b.name);
    } else if (activeSort === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityValues[a.priority || 'medium'];
      const bPriority = priorityValues[b.priority || 'medium'];
      return bPriority - aPriority;
    }
    return 0;
  });

  // Handle keyboard shortcuts
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear search on Escape key
    if (e.key === 'Escape') {
      setSearchTerm('');
    }
    
    // Focus on search input with Ctrl+F or Command+F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault(); // Prevent browser's find feature
    }
  };

  // Focus search on keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input on Ctrl+F or Command+F
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault(); // Prevent browser's find feature
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">Projects</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowImportModal(true)}
              className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 shadow hover:shadow-md"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import CSV
          </button>
          <button 
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            {showNewProjectForm ? 'Cancel' : 'Add New Project'}
          </button>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <CSVImport
          onImportProjects={handleImportProjects}
          onClose={() => setShowImportModal(false)}
        />
      )}

        {/* Filter Toggle Button - Moved here */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {showFilters ? 'Hide Search & Filters' : 'Show Search & Filters'}
          </button>

          {/* Active filter indicators (only shown when filters are collapsed) */}
          {!showFilters && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {searchTerm && (
                <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 flex items-center">
                  <span>Search: {searchTerm}</span>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {activeFilter !== 'all' && (
                <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                  Status: {activeFilter === 'on-track' ? 'On Track' : 
                          activeFilter === 'at-risk' ? 'At Risk' : 
                          activeFilter === 'delayed' ? 'Delayed' : 'Completed'}
                </span>
              )}
              {activeClientTypeFilter !== 'all' && (
                <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100">
                  Client: {activeClientTypeFilter === 'private' ? 'Private' : 'Public'}
                </span>
              )}
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                Sort: {activeSort === 'dueDate' ? 'Due Date' : 
                      activeSort === 'name' ? 'Name' : 'Priority'}
              </span>
            </div>
          )}
        </div>

        {/* Filter and Sort Controls with Search - Now Collapsible */}
        <div 
          id="filter-panel"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showFilters 
              ? 'max-h-[1000px] opacity-100 mt-4' 
              : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          {/* Search Bar - Moved inside collapsible panel */}
          <div className="w-full max-w-md mx-auto md:mx-0 mb-4 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                id="project-search"
                type="search"
                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all"
                placeholder="Search projects by name, client, task, status, priority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Search projects"
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
            {/* Keyboard shortcut hint */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Press Ctrl+F (or ⌘+F on Mac) to search, Esc to clear
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === 'all' 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('on-track')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === 'on-track' 
                      ? 'bg-green-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              On Track
            </button>
            <button
              onClick={() => setActiveFilter('at-risk')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === 'at-risk' 
                      ? 'bg-yellow-500 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              At Risk
            </button>
            <button
              onClick={() => setActiveFilter('delayed')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === 'delayed' 
                      ? 'bg-red-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Delayed
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === 'completed' 
                      ? 'bg-purple-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Client Type Filter */}
        <div className="md:ml-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Type</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveClientTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeClientTypeFilter === 'all' 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveClientTypeFilter('private')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeClientTypeFilter === 'private' 
                      ? 'bg-indigo-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Private
            </button>
            <button
              onClick={() => setActiveClientTypeFilter('public')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeClientTypeFilter === 'public' 
                      ? 'bg-teal-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Public
            </button>
          </div>
        </div>

        <div className="md:ml-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</label>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSort('dueDate')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSort === 'dueDate' 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Due Date
            </button>
            <button
              onClick={() => setActiveSort('name')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSort === 'name' 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setActiveSort('priority')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSort === 'priority' 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Priority
            </button>
          </div>
        </div>
      </div>
        </div>

        {/* Show search results count when searching */}
        {searchTerm && showFilters && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 animate-fade-in">
            Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;
          </div>
        )}

      {showNewProjectForm && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm mt-6">
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Create New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
              <input
                type="text"
                value={newProjectClient}
                onChange={(e) => setNewProjectClient(e.target.value)}
                className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Type</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    checked={clientType === 'private'} 
                    onChange={() => setClientType('private')}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Private Client</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    checked={clientType === 'public'} 
                    onChange={() => setClientType('public')}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Public Client</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={newProjectStartDate}
                onChange={(e) => setNewProjectStartDate(e.target.value)}
                className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={newProjectDueDate}
                onChange={(e) => setNewProjectDueDate(e.target.value)}
                className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={newProjectStatus}
                onChange={(e) => setNewProjectStatus(e.target.value as ProjectStatus)}
                className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={newProjectPriority}
                onChange={(e) => setNewProjectPriority(e.target.value as ProjectPriority)}
                className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          {/* Custom tasks section for public clients */}
          {clientType === 'public' && (
            <div className="mt-4 p-4 border dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700">
              <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Define Custom Tasks</h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customTaskName}
                  onChange={(e) => setCustomTaskName(e.target.value)}
                  placeholder="Enter task name"
                  className="flex-1 p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addCustomTask}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
              
              {/* Task list */}
              <div className="max-h-60 overflow-y-auto">
                {customTasks.length === 0 ? (
                  <p className="text-sm italic text-gray-500 dark:text-gray-400">No custom tasks defined yet. Add tasks above.</p>
                ) : (
                  <ul className="space-y-2">
                    {customTasks.map((task, index) => (
                      <li key={task.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                        <div className="flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-xs mr-2">
                            {index + 1}
                          </span>
                          <span className="text-gray-900 dark:text-white">{task.name}</span>
                        </div>
                        <button 
                          onClick={() => removeCustomTask(task.id)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={addNewProject}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}

        <div 
          className="grid grid-cols-1 gap-6 mt-6 overflow-y-auto" 
          style={{ maxHeight: showFilters ? 'calc(100vh - 400px)' : 'calc(100vh - 250px)' }}
        >
        {sortedProjects.map((project) => (
          <ProjectItem 
            key={project.id} 
            project={project}
            onUpdate={updateProject}
            onDelete={deleteProject}
            teamMembers={teamMembers}
              searchTerm={searchTerm}
              onProjectSelect={onProjectSelect}
          />
        ))}
      </div>

      {sortedProjects.length === 0 && (
          <div className="text-center py-10 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mt-6">
          <p className="text-gray-500 dark:text-gray-400">No projects match your current filters. Try changing your filter criteria or add a new project!</p>
        </div>
      )}
      </div>
    </div>
  );
} 