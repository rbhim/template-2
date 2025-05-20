'use client';

import { useState, useEffect, useRef } from 'react';
import { Task, TeamMember, Note } from '../lib/types';
import ConfirmationDialog from './ConfirmationDialog';

// Task status options
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';

// Extended task type that includes status
interface KanbanTask extends Task {
  status: TaskStatus;
  assignedTo?: string; // Team member ID
  statusTimestamp?: string; // Timestamp of when status was last changed
}

interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTasksUpdate: (updatedTasks: Task[]) => void;
  onAddTask?: (taskName: string) => void;
  onDeleteTask?: (taskId: string) => void;
  searchTerm?: string;
  projectNotes?: Note[]; // Add project notes
  onAddNote?: (content: string, authorId?: string) => void; // Add note handler
  onDeleteNote?: (noteId: string) => void; // Delete note handler
}

export default function KanbanBoard({ 
  tasks, 
  teamMembers, 
  onTasksUpdate, 
  onAddTask, 
  onDeleteTask, 
  searchTerm = '',
  projectNotes = [],
  onAddNote,
  onDeleteNote
}: KanbanBoardProps) {
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [draggedOverTask, setDraggedOverTask] = useState<KanbanTask | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null);
  const [dragDirection, setDragDirection] = useState<'above' | 'below' | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  
  // Project notes state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  
  // Confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null);
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string>('');
  
  // Reference to the KanbanBoard container
  const kanbanRef = useRef<HTMLDivElement>(null);

  // Initialize kanban tasks from regular tasks
  useEffect(() => {
    const initialKanbanTasks: KanbanTask[] = tasks.map(task => {
      // Determine status based on existing status or completed property
      let status: TaskStatus = 'todo';
      
      if (task.status) {
        status = task.status as TaskStatus;
      } else if (task.completed) {
        status = 'completed';
      }
      
      return {
        ...task,
        status
      };
    });
    setKanbanTasks(initialKanbanTasks);
  }, [tasks]);

  // Handle full screen toggle
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    
    // Apply/remove fullscreen class to body to prevent scrolling
    if (!isFullScreen) {
      document.body.classList.add('kanban-fullscreen-mode');
    } else {
      document.body.classList.remove('kanban-fullscreen-mode');
    }
    
    // Scroll to top when entering fullscreen
    if (!isFullScreen) {
      window.scrollTo(0, 0);
    }
  };
  
  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        toggleFullScreen();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Clean up when component unmounts
      document.body.classList.remove('kanban-fullscreen-mode');
    };
  }, [isFullScreen]);

  // Handle adding a new note
  const handleAddNote = () => {
    if (!newNoteContent.trim() || !onAddNote) return;
    
    onAddNote(newNoteContent, selectedAuthorId || undefined);
    setNewNoteContent('');
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      
      // Format date: Jan 15, 2023 3:45 PM
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      return '';
    }
  };

  // Find team member by ID
  const getTeamMemberById = (id: string | undefined) => {
    if (!id) return null;
    return teamMembers.find(member => member.id === id);
  };

  // Handle note deletion with confirmation
  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
    setIsDeleteNoteDialogOpen(true);
  };

  // Confirm note deletion
  const confirmDeleteNote = () => {
    if (!noteToDelete || !onDeleteNote) return;
    
    onDeleteNote(noteToDelete);
    setIsDeleteNoteDialogOpen(false);
    setNoteToDelete('');
  };

  // Cancel note deletion
  const cancelDeleteNote = () => {
    setIsDeleteNoteDialogOpen(false);
    setNoteToDelete('');
  };

  // Render notes section when in full-screen mode
  const renderNotesSection = () => {
    if (!isFullScreen) return null;
    
    const notesCount = projectNotes.length;
    
    return (
      <div className="mt-6 pt-6 border-t dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
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
            {onAddNote && (
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
                    {teamMembers.map(member => (
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
                
                {/* Show posting information */}
                <div className="flex items-center gap-1.5 text-xs ml-1 text-gray-500 dark:text-gray-400">
                  {selectedAuthorId ? (
                    getTeamMemberById(selectedAuthorId) && (
                      <>
                        <img 
                          src={getTeamMemberById(selectedAuthorId)!.avatar} 
                          alt={getTeamMemberById(selectedAuthorId)!.name} 
                          className="w-4 h-4 rounded-full"
                        />
                        <span>Posting as {getTeamMemberById(selectedAuthorId)!.name}</span>
                      </>
                    )
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Posting as System</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Notes list */}
            <div className="space-y-4 pb-6">
              {!projectNotes || projectNotes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">No notes yet</p>
              ) : (
                projectNotes.map(note => {
                  const author = getTeamMemberById(note.authorId);
                  
                  return (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {author ? (
                            <img 
                              src={author.avatar} 
                              alt={author.name} 
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {author ? author.name : 'System'} • {formatTimestamp(note.timestamp)}
                          </span>
                        </div>
                        {onDeleteNote && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                          </button>
                        )}
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
    );
  };

  // Update original tasks when kanban tasks change
  const updateOriginalTasks = (updatedKanbanTasks: KanbanTask[]) => {
    // Map the updated Kanban tasks back to original task format
    // while preserving all original fields and IDs
    const updatedTasks = updatedKanbanTasks.map(kanbanTask => {
      // Find the original task to preserve its fields
      const originalTask = tasks.find(t => t.id === kanbanTask.id);
      
      if (!originalTask) {
        console.warn(`Task with ID ${kanbanTask.id} not found in original tasks`);
      }
      
      // Create the updated task, preserving original structure but avoiding undefined values
      const updatedTask: Task = {
        // Required fields for Task type
        id: kanbanTask.id,
        name: kanbanTask.name || (originalTask?.name || ''),
        completed: kanbanTask.status === 'completed',
        order: (typeof kanbanTask.order !== 'undefined' && kanbanTask.order !== null) 
          ? kanbanTask.order 
          : (originalTask?.order || 0),
        status: kanbanTask.status,
      };
      
      // Only include these optional fields if they are defined
      if (kanbanTask.assignedTo) {
        updatedTask.assignedTo = kanbanTask.assignedTo;
      }
      
      console.log(`Prepared task ${updatedTask.id} for Firebase:`, updatedTask);
      return updatedTask;
    });
    
    console.log('Updating tasks with IDs:', updatedTasks.map(t => t.id).join(', '));
    onTasksUpdate(updatedTasks);
  };

  // Handle dragging start
  const handleDragStart = (task: KanbanTask, e: React.DragEvent<HTMLDivElement>) => {
    // Set the task being dragged in state
    setDraggedTask(task);
    setIsDragging(true);
    
    // Set data transfer for compatibility with browsers
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      
      // Essential data for drag/drop operation
      e.dataTransfer.setData('text/plain', task.id);
      
      // Create a simple drag image
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const ghostElement = document.createElement('div');
        
        // Style the ghost element for better visual feedback
        ghostElement.style.width = `${rect.width}px`;
        ghostElement.style.height = `${rect.height}px`;
        ghostElement.style.backgroundColor = '#ffffff';
        ghostElement.style.border = '2px solid #3b82f6';
        ghostElement.style.borderRadius = '6px';
        ghostElement.style.boxShadow = '0 5px 10px rgba(0,0,0,0.2)';
        ghostElement.style.position = 'absolute';
        ghostElement.style.top = '-1000px';
        ghostElement.style.opacity = '0.8';
        ghostElement.style.padding = '10px';
        ghostElement.style.transform = 'rotate(3deg)';
        ghostElement.textContent = task.name;
        ghostElement.style.display = 'flex';
        ghostElement.style.alignItems = 'center';
        ghostElement.style.justifyContent = 'center';
        ghostElement.style.fontWeight = 'bold';
        
        document.body.appendChild(ghostElement);
        e.dataTransfer.setDragImage(ghostElement, 20, 20);
        
        setTimeout(() => {
          document.body.removeChild(ghostElement);
        }, 0);
      } catch (error) {
        console.log('Custom drag image not supported');
      }
    }
    
    // Immediately apply visual feedback
    document.body.classList.add('is-dragging-task');
    e.currentTarget.classList.add('task-being-dragged');
  };

  // Handle dragging end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Reset all drag-related state
    setIsDragging(false);
    setDraggedOverColumn(null);
    setDraggedOverTask(null);
    setDragDirection(null);
    setDraggedTask(null);
    
    // Clean up visual feedback
    document.body.classList.remove('is-dragging-task');
    document.querySelectorAll('.task-being-dragged').forEach(el => {
      el.classList.remove('task-being-dragged');
    });
    
    // Force cursor back to default by applying and removing a class
    document.body.classList.add('drag-ended');
    
    // Add a small delay before removing the class to ensure browsers register the change
    setTimeout(() => {
      document.body.classList.remove('drag-ended');
    }, 150);
    
    // Ensure the drop effect is completed
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  // Handle dragging over a task
  const handleDragOverTask = (e: React.DragEvent<HTMLDivElement>, overTask: KanbanTask) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to column

    if (!draggedTask || draggedTask.id === overTask.id) return;
    
    setDraggedOverColumn(overTask.status);
    setDraggedOverTask(overTask);
    
    // Determine if dragging above or below the task with a more sensitive threshold
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const heightThreshold = rect.height * 0.5; // Middle point of task card
    
    const isAbove = offsetY < heightThreshold;
    setDragDirection(isAbove ? 'above' : 'below');
    
    // Set data transfer effect
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  // Handle dragging leave a task
  const handleDragLeaveTask = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're not entering a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverTask(null);
      setDragDirection(null);
    }
  };

  // Handle dragging over a column
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    // Always prevent default to allow dropping
    e.preventDefault();
    e.stopPropagation();
    
    // Set the drop effect
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    
    // Set the column being dragged over
    setDraggedOverColumn(status);
    
    // If this is a column (not a task), clear task-specific states
    if (e.currentTarget.hasAttribute('data-kanban-column')) {
      setDraggedOverTask(null);
      setDragDirection(null);
    }
  };

  // Handle dropping on a task
  const handleDropOnTask = (e: React.DragEvent<HTMLDivElement>, dropTarget: KanbanTask) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If no task is being dragged, do nothing
    if (!draggedTask) return;
    
    // Get all tasks in the target column
    const tasksInSameColumn = kanbanTasks.filter(t => t.status === dropTarget.status);
    
    // Calculate new tasks array based on drop position
    let updatedTasks = [...kanbanTasks];
    
    // If task is from a different column, change its status
    if (draggedTask.status !== dropTarget.status) {
      updatedTasks = updatedTasks.map(task => {
        if (task.id === draggedTask.id) {
          return {
            ...task,
            status: dropTarget.status,
            // Add timestamp when status changes
            statusTimestamp: new Date().toISOString()
          };
        }
        return task;
      });
    }
    
    // Remove the dragged task from its current position
    const draggedTaskWithoutOrder = updatedTasks.find(t => t.id === draggedTask.id);
    if (!draggedTaskWithoutOrder) return;
    
    const tasksWithoutDragged = updatedTasks.filter(t => t.id !== draggedTask.id);
    
    // Find the target task index in the column
    const targetIndex = tasksInSameColumn.findIndex(t => t.id === dropTarget.id);
    
    // Determine where to insert the dragged task based on drag direction
    const insertAtIndex = dragDirection === 'above' ? targetIndex : targetIndex + 1;
    
    // Reorder all tasks in the column, taking into account the insertion
    const columnTasks = tasksInSameColumn.filter(t => t.id !== draggedTask.id);
    
    // Insert dragged task at the correct position in the column
    columnTasks.splice(insertAtIndex, 0, {
      ...draggedTaskWithoutOrder,
      status: dropTarget.status
    });
    
    // Create the final updated tasks array with proper order values
    const finalUpdatedTasks = tasksWithoutDragged.map(task => {
      // Only update tasks in the target column
      if (task.status === dropTarget.status) {
        // Find this task's new position in the reordered column
        const columnIndex = columnTasks.findIndex(t => t.id === task.id);
        // If not found in column (shouldn't happen), keep original
        if (columnIndex === -1) return task;
        // Otherwise set order based on position
        return { ...task, order: columnIndex + 1 };
      }
      return task;
    });
    
    // Add the dragged task with its new order
    finalUpdatedTasks.push({
      ...draggedTaskWithoutOrder,
      status: dropTarget.status,
      order: columnTasks.findIndex(t => t.id === draggedTaskWithoutOrder.id) + 1
    });
    
    // Update state
    setKanbanTasks(finalUpdatedTasks);
    updateOriginalTasks(finalUpdatedTasks);
    
    // Reset drag state
    setDraggedTask(null);
    setDraggedOverColumn(null);
    setDraggedOverTask(null);
    setDragDirection(null);
    setIsDragging(false);
    
    // Force cursor back to default by applying and removing a class
    document.body.classList.add('drag-ended');
    
    // Clean up visual feedback
    document.body.classList.remove('is-dragging-task');
    document.querySelectorAll('.task-being-dragged').forEach(el => {
      el.classList.remove('task-being-dragged');
    });
    
    // Add a small delay before removing the class to ensure browsers register the change
    setTimeout(() => {
      document.body.classList.remove('drag-ended');
    }, 150);
  };

  // Handle dropping in a column
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    // Always prevent default
    e.preventDefault();
    e.stopPropagation();
    
    // If dropped on a task, let the task handler handle it
    if (draggedOverTask) return;
    
    // If we have a task being dragged
    if (draggedTask) {
      // Only add timestamp if status is changing
      const isStatusChange = draggedTask.status !== status;
      
      // Update the task's status
      const updatedTasks = kanbanTasks.map(task => 
        task.id === draggedTask.id 
          ? { 
              ...task, 
              status,
              // Add timestamp when status changes
              statusTimestamp: isStatusChange ? new Date().toISOString() : task.statusTimestamp
            } 
          : task
      );
      
      // Add to the end of the column
      const tasksInTargetColumn = updatedTasks.filter(t => t.status === status);
      const maxOrder = Math.max(0, ...tasksInTargetColumn.map(t => t.order || 0));
      
      const finalUpdatedTasks = updatedTasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, order: maxOrder + 1 } 
          : task
      );
      
      // Update the state
      setKanbanTasks(finalUpdatedTasks);
      updateOriginalTasks(finalUpdatedTasks);
      
      // Reset drag state
      setDraggedTask(null);
      setDraggedOverColumn(null);
      setIsDragging(false);
      
      // Force cursor back to default by applying and removing a class
      document.body.classList.add('drag-ended');
      
      // Clean up visual feedback
      document.body.classList.remove('is-dragging-task');
      document.querySelectorAll('.task-being-dragged').forEach(el => {
        el.classList.remove('task-being-dragged');
      });
    
      // Add a small delay before removing the class to ensure browsers register the change
      setTimeout(() => {
        document.body.classList.remove('drag-ended');
      }, 150);
    }
  };

  // Add a new task
  const handleAddTask = (status: TaskStatus) => {
    if (!newTaskName.trim()) return;
    
    if (onAddTask) {
      // If the parent provided an add task handler, use it
      onAddTask(newTaskName);
      setNewTaskName('');
      setAddingToColumn(null);
      return;
    }
    
    // Otherwise handle internally
    const newTask: KanbanTask = {
      id: Date.now().toString(),
      name: newTaskName,
      completed: status === 'completed',
      order: kanbanTasks.length + 1,
      status,
      statusTimestamp: new Date().toISOString() // Add timestamp when task is created
    };
    
    const updatedTasks = [...kanbanTasks, newTask];
    setKanbanTasks(updatedTasks);
    updateOriginalTasks(updatedTasks);
    setNewTaskName('');
    setAddingToColumn(null);
  };

  // Get tasks for a specific column, sorted by order
  const getTasksByStatus = (status: TaskStatus) => {
    return kanbanTasks
      .filter(task => task.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Get team member by ID
  const getTeamMember = (id?: string) => {
    if (!id) return null;
    return teamMembers.find(member => member.id === id);
  };

  // Handle task deletion after confirmation
  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    
    if (onDeleteTask) {
      // If parent provided a delete handler, use it after confirmation
      onDeleteTask(taskToDelete.id);
    } else {
      // Otherwise handle internally
      // Filter out the task to delete
      const updatedTasks = kanbanTasks.filter(t => t.id !== taskToDelete.id);
      
      // Update the order of remaining tasks in the same column
      const reorderedTasks = updatedTasks
        .map((t, idx) => {
          // Only reorder tasks in the same column as the deleted task
          if (t.status === taskToDelete.status) {
            return { ...t, order: idx + 1 };
          }
          return t;
        });
      
      setKanbanTasks(reorderedTasks);
      updateOriginalTasks(reorderedTasks);
    }
    
    // Reset dialog state
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const cancelDeleteTask = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  // Task card component
  const TaskCard = ({ task }: { task: KanbanTask }) => {
    const assignedMember = getTeamMember(task.assignedTo);
    const isBeingDragged = draggedTask?.id === task.id;
    const isDraggedOver = draggedOverTask?.id === task.id;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Updated handler to change task stage directly from menu
    const handleMoveToStage = (newStatus: TaskStatus) => {
      // Don't do anything if it's already in this stage
      if (task.status === newStatus) {
        setIsMenuOpen(false);
        return;
      }
      
      // Update the task with the new status
      const updatedTasks = kanbanTasks.map(t => 
        t.id === task.id 
          ? { 
              ...t, 
              status: newStatus,
              // Add timestamp when status changes
              statusTimestamp: new Date().toISOString()
            } 
          : t
      );
      
      setKanbanTasks(updatedTasks);
      updateOriginalTasks(updatedTasks);
      setIsMenuOpen(false);
    };

    // Show confirmation dialog for task deletion
    const handleDeleteClick = () => {
      // Always show confirmation dialog first, regardless of how delete will be processed
      setTaskToDelete(task);
      setIsDeleteDialogOpen(true);
      setIsMenuOpen(false);
    };

    // Close menu when clicking outside
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Simpler implementation without relying on complex class states
    return (
      <div 
        className={`task-card bg-white dark:bg-gray-800 p-3 ${isCompactView ? 'py-2' : ''} rounded-md shadow-sm mb-2 border 
          ${isBeingDragged ? 'opacity-70 shadow-lg border-blue-500 scale-105 rotate-2' : 
            isDraggedOver && dragDirection === 'above' ? 'border-t-2 border-t-blue-500 border-b-transparent border-x-transparent' :
            isDraggedOver && dragDirection === 'below' ? 'border-b-2 border-b-blue-500 border-t-transparent border-x-transparent' :
            'border-transparent hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'}
          transition-all duration-150 select-none group relative`}
        draggable="true"
        onDragStart={(e) => handleDragStart(task, e)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOverTask(e, task)}
        onDragLeave={handleDragLeaveTask}
        onDrop={(e) => handleDropOnTask(e, task)}
        style={{ cursor: 'grab' }}
      >
        {/* Insert drop indicator if needed */}
        {isDraggedOver && dragDirection === 'above' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 transform -translate-y-1/2 rounded-full"></div>
        )}
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 w-full">
            {/* Task name - main content */}
            <h4 className={`text-sm font-medium text-gray-900 dark:text-white flex-grow ${isCompactView ? 'truncate max-w-[180px]' : ''}`}>{task.name}</h4>
            
            <div className="relative" ref={menuRef}>
              <button 
                className="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                style={{ cursor: 'pointer' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <p className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium">Move to:</p>
                    
                    {/* Stage options instead of team members */}
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${task.status === 'todo' ? 'bg-gray-100 dark:bg-gray-600 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToStage('todo');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      To Do
                    </button>
                    
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${task.status === 'in-progress' ? 'bg-gray-100 dark:bg-gray-600 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToStage('in-progress');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h.01M16 10a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      In Progress
                    </button>
                    
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${task.status === 'review' ? 'bg-gray-100 dark:bg-gray-600 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToStage('review');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Review
                    </button>
                    
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${task.status === 'completed' ? 'bg-gray-100 dark:bg-gray-600 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToStage('completed');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer area with assigned member and status timestamp */}
        {(!isCompactView || assignedMember) && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {/* Assigned team member - keep this in case there are already assigned members */}
          {assignedMember && (
            <div className="flex items-center">
              <div className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                <img src={assignedMember.avatar} alt={assignedMember.name} className="h-5 w-5 rounded-full" />
                <span className="ml-1.5 text-xs text-gray-600 dark:text-gray-400">{assignedMember.name}</span>
              </div>
            </div>
          )}
          
            {/* Status timestamp - only show in normal view */}
            {task.statusTimestamp && !isCompactView && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span title={`Moved to ${task.status} on ${formatTimestamp(task.statusTimestamp)}`}>
                {formatTimestamp(task.statusTimestamp)}
              </span>
            </div>
          )}
        </div>
        )}
        
        {/* Insert drop indicator if needed */}
        {isDraggedOver && dragDirection === 'below' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 transform translate-y-1/2 rounded-full"></div>
        )}
      </div>
    );
  };

  // Column component
  const Column = ({ status, title, count }: { status: TaskStatus, title: string, count: number }) => {
    const tasks = getTasksByStatus(status);
    const isAdding = addingToColumn === status;
    const isOver = draggedOverColumn === status;
    const canAddTasks = status === 'todo'; // Only allow adding tasks in the Todo column
    
    // Custom colors for each column
    const getColorClasses = () => {
      switch (status) {
        case 'todo':
          return {
            header: 'text-gray-700 dark:text-gray-300',
            bgNormal: 'bg-gray-100 dark:bg-gray-750',
            bgHover: 'bg-gray-200 dark:bg-gray-700',
            badge: 'bg-gray-200 dark:bg-gray-600',
          };
        case 'in-progress':
          return {
            header: 'text-blue-700 dark:text-blue-300',
            bgNormal: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20',
            bgHover: 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30',
            badge: 'bg-blue-100 dark:bg-blue-800',
          };
        case 'review':
          return {
            header: 'text-yellow-700 dark:text-yellow-300',
            bgNormal: 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20',
            bgHover: 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30',
            badge: 'bg-yellow-100 dark:bg-yellow-800',
          };
        case 'completed':
          return {
            header: 'text-green-700 dark:text-green-300',
            bgNormal: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20',
            bgHover: 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30',
            badge: 'bg-green-100 dark:bg-green-800',
          };
      }
    };
    
    const colors = getColorClasses();
    
    return (
      <div className={`flex-1 min-w-[250px] ${isFullScreen ? '' : 'max-w-[350px]'} flex flex-col`}>
        <div className={`column-header flex items-center justify-between mb-2 ${colors?.header} ${isFullScreen ? `${colors?.bgNormal} py-2 px-2 rounded-t` : ''}`}>
          <h3 className="text-md font-semibold flex items-center">
            {title} 
            <span className={`ml-2 ${colors?.badge} shadow-sm text-xs px-2 py-0.5 rounded-full`}>
              {count}
            </span>
          </h3>
          
          {/* Only show add button in Todo column */}
          {canAddTasks && (
            <button 
              onClick={() => setAddingToColumn(status)}
              className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center"
              title="Add Task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
        
        {isAdding && canAddTasks && (
          <div className="mb-2 flex px-2">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Task name..."
              className="kanban-add-task-input flex-1 p-2 border dark:border-gray-600 rounded-l bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              autoFocus
              onKeyDown={(e) => {
                // Submit on Enter key
                if (e.key === 'Enter' && newTaskName.trim()) {
                  handleAddTask(status);
                }
                // Cancel on Escape key
                else if (e.key === 'Escape') {
                  setAddingToColumn(null);
                  setNewTaskName('');
                }
              }}
            />
            <button
              onClick={() => handleAddTask(status)}
              className="bg-blue-600 text-white px-3 rounded-r"
            >
              Add
            </button>
            <button
              onClick={() => setAddingToColumn(null)}
              className="ml-1 text-gray-500 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div 
          className={`${isFullScreen ? 'flex-1' : 'h-full min-h-[200px]'} p-2 rounded-md border-2 transition-colors duration-200
            ${isOver ? `${colors?.bgHover} border-2 border-blue-400` : `${colors?.bgNormal} border-transparent`}
          `}
          data-kanban-column={status}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeaveTask}
          onDrop={(e) => handleDrop(e, status)}
        >
          {isDragging && tasks.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md h-20 flex items-center justify-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Drop here</p>
            </div>
          )}
          
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {tasks.length === 0 && !isDragging && (
            <div className="flex flex-col items-center justify-center h-20 mt-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center">No tasks</p>
              {/* Only show Add task link in the Todo column */}
              {canAddTasks && (
                <button 
                  onClick={() => setAddingToColumn(status)}
                  className="mt-2 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  + Add task
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`kanban-board-container ${isFullScreen ? 'fullscreen' : ''}`} ref={kanbanRef}>
      {/* Confirmation Dialog for task deletion */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message={taskToDelete ? `Are you sure you want to delete "${taskToDelete.name}"? This action cannot be undone.` : "Are you sure you want to delete this task?"}
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
      />
      
      {/* Confirmation Dialog for note deletion */}
      <ConfirmationDialog
        isOpen={isDeleteNoteDialogOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={confirmDeleteNote}
        onCancel={cancelDeleteNote}
      />

      {/* Header with controls */}
      <div className={`flex justify-between items-center mb-4 ${isFullScreen ? 'sticky top-0 z-10 bg-white dark:bg-gray-900 py-2' : ''}`}>
        <h2 className="text-lg font-semibold">Task Board</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCompactView(!isCompactView)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isCompactView ? "Switch to Normal View" : "Switch to Compact View"}
          >
            {isCompactView ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <span className="hidden md:inline">Normal View</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="hidden md:inline">Compact View</span>
              </>
            )}
          </button>
          
          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
            title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {isFullScreen ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 3H2m20 18H2M5 7v10M19 7v10" />
                </svg>
                <span className="hidden md:inline">Exit Full Screen</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                <span className="hidden md:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content container that scrolls as one unit in fullscreen mode */}
      <div className={`${isFullScreen ? 'flex-grow' : ''}`}>
        {/* Task columns */}
        <div className={`flex flex-col md:flex-row gap-4 pb-4 ${isFullScreen ? 'h-auto' : 'min-h-[500px]'} ${isCompactView ? 'compact-view' : ''}`}>
          {/* Todo Column */}
          <Column status="todo" title="To Do" count={getTasksByStatus('todo').length} />
          
          {/* In Progress Column */}
          <Column status="in-progress" title="In Progress" count={getTasksByStatus('in-progress').length} />
          
          {/* Review Column */}
          <Column status="review" title="Review" count={getTasksByStatus('review').length} />
          
          {/* Completed Column */}
          <Column status="completed" title="Completed" count={getTasksByStatus('completed').length} />
        </div>
        
        {/* Notes section in full-screen mode */}
        {isFullScreen && renderNotesSection()}
      </div>
      
      {/* Quick help text - hide in fullscreen */}
      {!isFullScreen && (
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
          Drag tasks directly to move them between columns
      </div>
      )}

      <style jsx global>{`
        /* Fullscreen mode styles */
        .kanban-fullscreen-mode {
          overflow: auto !important;
          padding-right: 0 !important;
          margin: 0 !important;
        }
        
        .kanban-board-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          background: white;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        
        .dark .kanban-board-container.fullscreen {
          background: #1a202c;
        }
        
        /* Compact view styles */
        .compact-view .task-card {
          padding: 0.5rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
} 