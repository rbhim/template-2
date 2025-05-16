'use client';

import { useState } from 'react';
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
  teamMembers?: TeamMember[];
}

export default function ProjectBoard({ projects, onUpdateProjects, teamMembers = [] }: ProjectBoardProps) {
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
    onUpdateProjects([...projects, ...importedProjects]);
  };

  // Filter projects based on status and client type
  const filteredProjects = projects
    .filter(project => activeFilter === 'all' || project.status === activeFilter)
    .filter(project => activeClientTypeFilter === 'all' || project.clientType === activeClientTypeFilter);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import CSV
          </button>
          <button 
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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

      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('on-track')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === 'on-track' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              On Track
            </button>
            <button
              onClick={() => setActiveFilter('at-risk')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === 'at-risk' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              At Risk
            </button>
            <button
              onClick={() => setActiveFilter('delayed')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === 'delayed' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Delayed
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === 'completed' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Client Type Filter */}
        <div className="md:ml-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Type</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveClientTypeFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeClientTypeFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveClientTypeFilter('private')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeClientTypeFilter === 'private' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Private
            </button>
            <button
              onClick={() => setActiveClientTypeFilter('public')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeClientTypeFilter === 'public' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Public
            </button>
          </div>
        </div>

        <div className="md:ml-auto">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by</label>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSort('dueDate')}
              className={`px-3 py-1 rounded text-sm ${
                activeSort === 'dueDate' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Due Date
            </button>
            <button
              onClick={() => setActiveSort('name')}
              className={`px-3 py-1 rounded text-sm ${
                activeSort === 'name' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setActiveSort('priority')}
              className={`px-3 py-1 rounded text-sm ${
                activeSort === 'priority' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Priority
            </button>
          </div>
        </div>
      </div>

      {showNewProjectForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm">
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

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">On Track</h3>
          <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'on-track').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">At Risk / Delayed</h3>
          <p className="text-2xl font-bold text-red-600">
            {projects.filter(p => p.status === 'at-risk' || p.status === 'delayed').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
          <p className="text-2xl font-bold text-purple-600">{projects.filter(p => p.status === 'completed').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedProjects.map((project) => (
          <ProjectItem 
            key={project.id} 
            project={project}
            onUpdate={updateProject}
            onDelete={deleteProject}
            teamMembers={teamMembers}
          />
        ))}
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-10 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No projects match your current filters. Try changing your filter criteria or add a new project!</p>
        </div>
      )}
    </div>
  );
} 