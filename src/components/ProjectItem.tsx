'use client';

import { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectPriority, TeamMember, Note } from '../lib/types';
import KanbanBoard from './KanbanBoard';
import ConfirmationDialog from './ConfirmationDialog';

interface ProjectItemProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
  teamMembers?: TeamMember[]; // All team members for lookup
}

// Status badge colors
const statusColors: Record<ProjectStatus, { bg: string, text: string }> = {
  'on-track': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-100' },
  'at-risk': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-100' },
  'delayed': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-100' },
  'completed': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-100' }
};

// Priority indicator colors
const priorityColors: Record<ProjectPriority, string> = {
  'high': 'bg-red-500',
  'medium': 'bg-yellow-500',
  'low': 'bg-blue-500'
};

export default function ProjectItem({ project, onUpdate, onDelete, teamMembers = [] }: ProjectItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [editedClient, setEditedClient] = useState(project.client);
  const [editedStartDate, setEditedStartDate] = useState(project.startDate);
  const [editedDueDate, setEditedDueDate] = useState(project.dueDate);
  const [editedStatus, setEditedStatus] = useState<ProjectStatus>(project.status || 'on-track');
  const [editedPriority, setEditedPriority] = useState<ProjectPriority>(project.priority || 'medium');
  const [editedTeam, setEditedTeam] = useState<string[]>(project.assignedTeam || []);
  
  // Note management states
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
  
  // Confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string>('');

  useEffect(() => {
    setEditedName(project.name);
    setEditedClient(project.client);
    setEditedStartDate(project.startDate);
    setEditedDueDate(project.dueDate);
    setEditedStatus(project.status || 'on-track');
    setEditedPriority(project.priority || 'medium');
    setEditedTeam(project.assignedTeam || []);
    
    // If there are assigned team members, default to the first one
    if (project.assignedTeam && project.assignedTeam.length > 0) {
      setSelectedAuthorId(project.assignedTeam[0]);
    } else {
      setSelectedAuthorId('');
    }
  }, [project]);

  const completedTasksCount = project.tasks.filter(task => task.completed).length;
  const progress = Math.round((completedTasksCount / project.tasks.length) * 100);
  
  const handleSaveEdit = () => {
    if (!editedName || !editedClient || !editedStartDate || !editedDueDate) return;
    
    onUpdate({
      ...project,
      name: editedName,
      client: editedClient,
      startDate: editedStartDate,
      dueDate: editedDueDate,
      status: editedStatus,
      priority: editedPriority,
      assignedTeam: editedTeam,
    });
    
    setIsEditing(false);
  };
  
  // Add a new note
  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    
    // Create new note with timestamp
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      timestamp: new Date().toISOString(),
      authorId: selectedAuthorId || undefined,
    };
    
    // Add to project notes
    const updatedNotes = [...(project.notes || []), newNote];
    
    onUpdate({
      ...project,
      notes: updatedNotes,
    });
    
    // Reset input
    setNewNoteContent('');
  };
  
  // Delete a note
  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = (project.notes || []).filter(note => note.id !== noteId);
    
    onUpdate({
      ...project,
      notes: updatedNotes,
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Use explicit formatting to avoid hydration errors
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    // If project is completed, always return 0
    if (project.status === 'completed') {
      return 0;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(project.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  const handleTaskUpdate = (taskId: string, completed: boolean) => {
    const updatedTasks = project.tasks.map(task => 
      task.id === taskId ? { ...task, completed } : task
    );
    
    onUpdate({
      ...project,
      tasks: updatedTasks,
    });
  };

  const handleTaskReorder = (taskId: string, newOrder: number) => {
    // Find the task to move
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const reorderedTasks = [...project.tasks];
    
    // Remove task from its current position
    const [taskToMove] = reorderedTasks.splice(taskIndex, 1);
    
    // Find index where it should be inserted based on new order
    const insertIndex = reorderedTasks.findIndex(t => t.order > newOrder);
    
    // If no task has a higher order, append at the end
    const newIndex = insertIndex === -1 ? reorderedTasks.length : insertIndex;
    
    // Insert task at new position
    reorderedTasks.splice(newIndex, 0, { ...taskToMove, order: newOrder });
    
    // Update orders for all tasks to be sequential
    const updatedTasks = reorderedTasks.map((task, idx) => ({
      ...task,
      order: idx + 1,
    }));
    
    onUpdate({
      ...project,
      tasks: updatedTasks,
    });
  };

  const handleAddTask = (taskName: string) => {
    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      completed: false,
      order: project.tasks.length + 1,
    };
    
    onUpdate({
      ...project,
      tasks: [...project.tasks, newTask],
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = project.tasks
      .filter(task => task.id !== taskId)
      .map((task, idx) => ({
        ...task,
        order: idx + 1, // Reorder remaining tasks
      }));
    
    onUpdate({
      ...project,
      tasks: updatedTasks,
    });
  };

  const handleToggleTeamMember = (memberId: string) => {
    if (editedTeam.includes(memberId)) {
      setEditedTeam(editedTeam.filter(id => id !== memberId));
    } else {
      setEditedTeam([...editedTeam, memberId]);
    }
  };

  const priorityLabel = (priority: ProjectPriority): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const statusLabel = (status: ProjectStatus): string => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get assigned team members
  const assignedTeamMembers = teamMembers.filter(
    member => project.assignedTeam?.includes(member.id)
  );
  
  // Find team member by ID
  const getTeamMemberById = (id: string | undefined) => {
    if (!id) return null;
    return teamMembers.find(member => member.id === id);
  };

  // Count notes
  const notesCount = project.notes?.length || 0;

  const handleTasksUpdate = (updatedTasks: any[]) => {
    onUpdate({
      ...project,
      tasks: updatedTasks,
    });
  };

  // New function to handle delete confirmation
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(project.id);
    setIsDeleteDialogOpen(false);
  };
  
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  // New function to handle note delete confirmation
  const handleDeleteNoteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setIsDeleteNoteDialogOpen(true);
  };

  const confirmNoteDelete = () => {
    const updatedNotes = (project.notes || []).filter(note => note.id !== noteToDelete);
    
    onUpdate({
      ...project,
      notes: updatedNotes,
    });
    setIsDeleteNoteDialogOpen(false);
  };
  
  const cancelNoteDelete = () => {
    setIsDeleteNoteDialogOpen(false);
    setNoteToDelete('');
  };

  return (
    <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md ${
      project.priority === 'high' ? 'border-l-4 border-l-red-500' : 
      project.priority === 'medium' ? 'border-l-4 border-l-yellow-500' : 
      project.priority === 'low' ? 'border-l-4 border-l-blue-500' : ''
    }`}>
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ConfirmationDialog
        isOpen={isDeleteNoteDialogOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={confirmNoteDelete}
        onCancel={cancelNoteDelete}
      />

      <div className="bg-gray-50 dark:bg-gray-700 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 w-full">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
              <input
                type="text"
                value={editedClient}
                onChange={(e) => setEditedClient(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={editedStartDate}
                onChange={(e) => setEditedStartDate(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value as ProjectStatus)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value as ProjectPriority)}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Team Members</label>
              <div className="max-h-40 overflow-y-auto border dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2">
                {teamMembers.length > 0 ? (
                  <div className="space-y-1">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`member-${member.id}`}
                          checked={editedTeam.includes(member.id)}
                          onChange={() => handleToggleTeamMember(member.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor={`member-${member.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {member.name} ({member.role})
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No team members available</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Type</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    checked={project.clientType === 'private'} 
                    onChange={() => {
                      const clientType = 'private';
                      setEditedTeam(editedTeam); // Just to trigger an update
                      onUpdate({
                        ...project,
                        clientType
                      });
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Private</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    checked={project.clientType === 'public'} 
                    onChange={() => {
                      const clientType = 'public';
                      setEditedTeam(editedTeam); // Just to trigger an update
                      onUpdate({
                        ...project,
                        clientType
                      });
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Public</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              {project.status && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                  {statusLabel(project.status)}
                </span>
              )}
              {project.priority && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                  <span className={`w-2 h-2 rounded-full ${priorityColors[project.priority]}`}></span>
                  {priorityLabel(project.priority)} Priority
                </span>
              )}
              {project.clientType && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  project.clientType === 'private' 
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100' 
                    : 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100'
                }`}>
                  {project.clientType === 'private' ? 'Private Client' : 'Public Client'}
                </span>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:gap-4 text-gray-600 dark:text-gray-300 text-sm mt-1">
              <div className="font-medium">{project.client}</div>
              <div className="flex flex-col md:flex-row md:items-center">
                {project.startDate && (
                  <div className="flex items-center">
                    <span className="hidden md:inline mx-2 text-gray-400 dark:text-gray-500">•</span>
                    <span className="font-medium">Start: {formatDate(project.startDate)}</span>
                  </div>
                )}
                {project.dueDate && (
                  <div className="flex items-center">
                    <span className="hidden md:inline mx-2 text-gray-400 dark:text-gray-500">•</span>
                    <span className="font-medium">Due: {formatDate(project.dueDate)}</span>
                    {project.status === 'completed' ? (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Completed
                      </span>
                    ) : (
                      <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                        daysRemaining < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 
                        daysRemaining < 7 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }`}>
                        {daysRemaining < 0 
                          ? `${Math.abs(daysRemaining)} days overdue` 
                          : daysRemaining === 0 
                            ? 'Due today'
                            : `${daysRemaining} days left`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Team members display */}
            {assignedTeamMembers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Team:</span>
                {assignedTeamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-4 h-4 rounded-full" 
                    />
                    <span className="text-gray-700 dark:text-gray-300">{member.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 self-end md:self-center">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(project.name);
                  setEditedClient(project.client);
                  setEditedStartDate(project.startDate);
                  setEditedDueDate(project.dueDate);
                  setEditedStatus(project.status || 'on-track');
                  setEditedPriority(project.priority || 'medium');
                  setEditedTeam(project.assignedTeam || []);
                }}
                className="px-3 py-1.5 border dark:border-gray-600 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mr-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${
                      progress >= 75 ? 'bg-green-600' : 
                      progress >= 50 ? 'bg-blue-600' : 
                      progress >= 25 ? 'bg-yellow-500' : 
                      'bg-red-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                title="Edit Project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                title="Delete Project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                title={isExpanded ? "Collapse tasks" : "Expand tasks"}
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t dark:border-gray-700">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
            </div>
            
            <KanbanBoard
              tasks={project.tasks}
              teamMembers={teamMembers}
              onTasksUpdate={handleTasksUpdate}
            />
          </div>
          
          {/* Notes Section with collapse toggle */}
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Notes {notesCount > 0 && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({notesCount})</span>}</h3>
              <button
                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                className="p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                title={isNotesExpanded ? "Collapse notes" : "Expand notes"}
              >
                {isNotesExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                )}
              </button>
            </div>
            
            {isNotesExpanded && (
              <>
                {/* Add note form with team member selection */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    
                    {/* Team member selector */}
                    <select
                      value={selectedAuthorId}
                      onChange={(e) => setSelectedAuthorId(e.target.value)}
                      className="p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">System</option>
                      {assignedTeamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Add Note
                    </button>
                  </div>
                  
                  {selectedAuthorId && (
                    <div className="flex items-center gap-1.5 text-xs ml-1 text-gray-500 dark:text-gray-400">
                      {getTeamMemberById(selectedAuthorId) && (
                        <>
                          <img 
                            src={getTeamMemberById(selectedAuthorId)!.avatar} 
                            alt={getTeamMemberById(selectedAuthorId)!.name} 
                            className="w-4 h-4 rounded-full"
                          />
                          <span>Posting as {getTeamMemberById(selectedAuthorId)!.name}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Notes list */}
                <div className="space-y-4">
                  {!project.notes || project.notes.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No notes yet</p>
                  ) : (
                    project.notes.map(note => {
                      const author = getTeamMemberById(note.authorId);
                      
                      return (
                        <div key={note.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {author && (
                                <img 
                                  src={author.avatar} 
                                  alt={author.name} 
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {author ? author.name : 'System'} • {formatDate(note.timestamp)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteNoteClick(note.id)}
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 