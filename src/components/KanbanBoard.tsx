'use client';

import { useState, useEffect, useRef } from 'react';
import { Task, TeamMember } from '../lib/types';
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
}

export default function KanbanBoard({ tasks, teamMembers, onTasksUpdate, onAddTask, onDeleteTask, searchTerm = '' }: KanbanBoardProps) {
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [draggedOverTask, setDraggedOverTask] = useState<KanbanTask | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null);
  const [dragDirection, setDragDirection] = useState<'above' | 'below' | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null);

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

  // Update original tasks when kanban tasks change
  const updateOriginalTasks = (updatedKanbanTasks: KanbanTask[]) => {
    const updatedTasks = updatedKanbanTasks.map(kanbanTask => ({
      ...kanbanTask,
      completed: kanbanTask.status === 'completed'
    }));
    
    onTasksUpdate(updatedTasks);
  };

  // Handle dragging start
  const handleDragStart = (task: KanbanTask, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedTask(task);
    setIsDragging(true);
    
    // Set drag image (optional enhancement)
    if (e.dataTransfer.setDragImage) {
      const dragImage = document.createElement('div');
      dragImage.classList.add('drag-ghost');
      dragImage.textContent = task.name;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.opacity = '0.8';
      dragImage.style.background = '#4a5568';
      dragImage.style.color = 'white';
      dragImage.style.padding = '8px 12px';
      dragImage.style.borderRadius = '4px';
      dragImage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 20, 20);
      
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };

  // Handle dragging end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedOverColumn(null);
    setDraggedOverTask(null);
    setDragDirection(null);
    setDraggedTask(null);
  };

  // Handle dragging over a task
  const handleDragOverTask = (e: React.DragEvent<HTMLDivElement>, overTask: KanbanTask) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to column

    if (!draggedTask || draggedTask.id === overTask.id) return;
    
    setDraggedOverColumn(overTask.status);
    setDraggedOverTask(overTask);
    
    // Determine if dragging above or below the task
    const rect = e.currentTarget.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const isAbove = e.clientY < middleY;
    setDragDirection(isAbove ? 'above' : 'below');
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
    e.preventDefault();
    setDraggedOverColumn(status);
    
    // If we're over the column but not over a task, clear the draggedOverTask
    if (!e.currentTarget.contains(e.target as Node) || e.currentTarget === e.target) {
      setDraggedOverTask(null);
      setDragDirection(null);
    }
  };

  // Handle dropping on a task
  const handleDropOnTask = (e: React.DragEvent<HTMLDivElement>, dropTarget: KanbanTask) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the event from bubbling to the column handler
    
    if (!draggedTask) return;
    
    // Get all tasks in the column
    const columnTasks = kanbanTasks.filter(task => task.status === dropTarget.status);
    
    // If dragging from a different column
    if (draggedTask.status !== dropTarget.status) {
      // Handle moving from one column to another plus reordering
      const updatedTasks = kanbanTasks.map(task => {
        if (task.id === draggedTask.id) {
          return { 
            ...task, 
            status: dropTarget.status,
            statusTimestamp: new Date().toISOString() // Add timestamp when status changes
          };
        }
        return task;
      });
      
      // Re-order the tasks after the status change
      const tasksWithUpdatedOrder = reorderTasks(
        updatedTasks, 
        draggedTask.id, 
        dropTarget.id, 
        dragDirection || 'below'
      );
      
      setKanbanTasks(tasksWithUpdatedOrder);
      updateOriginalTasks(tasksWithUpdatedOrder);
    } else {
      // Handle reordering within the same column
      const reorderedTasks = reorderTasks(
        kanbanTasks, 
        draggedTask.id, 
        dropTarget.id, 
        dragDirection || 'below'
      );
      
      setKanbanTasks(reorderedTasks);
      updateOriginalTasks(reorderedTasks);
    }
    
    // Reset drag state
    setIsDragging(false);
    setDraggedOverColumn(null);
    setDraggedOverTask(null);
    setDragDirection(null);
    setDraggedTask(null);
  };

  // Helper function to reorder tasks
  const reorderTasks = (
    tasks: KanbanTask[], 
    draggedId: string, 
    targetId: string, 
    direction: 'above' | 'below'
  ): KanbanTask[] => {
    // Don't reorder if it's the same task
    if (draggedId === targetId) return tasks;
    
    const result = [...tasks];
    const draggedTaskIndex = result.findIndex(task => task.id === draggedId);
    if (draggedTaskIndex < 0) return tasks;
    
    // Remove the dragged task
    const [removed] = result.splice(draggedTaskIndex, 1);
    
    // Find the target and insert the dragged task
    const targetIndex = result.findIndex(task => task.id === targetId);
    if (targetIndex < 0) return tasks;
    
    // Insert either before or after the target
    const insertIndex = direction === 'above' ? targetIndex : targetIndex + 1;
    result.splice(insertIndex, 0, removed);
    
    // Update the order property based on the new positions
    return result.map((task, index) => ({
      ...task,
      order: index + 1
    }));
  };

  // Handle dropping in a column
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    
    // If we're dropping on a task, let the task handler take care of it
    if (draggedOverTask) return;
    
    if (draggedTask) {
      // Only add timestamp if status is changing
      const isStatusChange = draggedTask.status !== status;
      
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
      
      // When dropping in a column (not on a task), add to the end of that column
      const tasksInTargetColumn = updatedTasks.filter(t => t.status === status);
      const maxOrder = Math.max(0, ...tasksInTargetColumn.map(t => t.order));
      
      const finalUpdatedTasks = updatedTasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, order: maxOrder + 1 } 
          : task
      );
      
      setKanbanTasks(finalUpdatedTasks);
      updateOriginalTasks(finalUpdatedTasks);
      setIsDragging(false);
      setDraggedOverColumn(null);
      setDraggedTask(null);
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

  // Get tasks for a specific column
  const getTasksByStatus = (status: TaskStatus) => {
    return kanbanTasks.filter(task => task.status === status);
  };

  // Get team member by ID
  const getTeamMember = (id?: string) => {
    if (!id) return null;
    return teamMembers.find(member => member.id === id);
  };

  // Add a helper function to format the timestamp
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

  // Handle task deletion after confirmation
  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    
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
    
    const handleAssignToMember = (memberId: string) => {
      const updatedTasks = kanbanTasks.map(t => 
        t.id === task.id ? { ...t, assignedTo: memberId } : t
      );
      setKanbanTasks(updatedTasks);
      updateOriginalTasks(updatedTasks);
      setIsMenuOpen(false);
    };

    // Show confirmation dialog for task deletion
    const handleDeleteClick = () => {
      if (onDeleteTask) {
        // If the parent provided a delete task handler, use it
        onDeleteTask(task.id);
        setIsMenuOpen(false);
        return;
      }
      
      // Otherwise handle internally
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

    return (
      <div 
        className={`bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm mb-2 border 
          ${isBeingDragged ? 'opacity-50 border-transparent' : 
            isDraggedOver && dragDirection === 'above' ? 'border-t-2 border-t-blue-500 border-b-transparent border-x-transparent' :
            isDraggedOver && dragDirection === 'below' ? 'border-b-2 border-b-blue-500 border-t-transparent border-x-transparent' :
            'border-transparent hover:border-blue-400'}
          hover:shadow-md transition-all duration-150
          group`}
        draggable
        onDragStart={(e) => handleDragStart(task, e)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOverTask(e, task)}
        onDragLeave={handleDragLeaveTask}
        onDrop={(e) => handleDropOnTask(e, task)}
      >
        {/* Insert drop indicator if needed */}
        {isDraggedOver && dragDirection === 'above' && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 transform -translate-y-1/2"></div>
        )}
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 w-full">
            {/* Drag handle indicator */}
            <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 cursor-move">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            
            {/* Rest of the task card content */}
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex-grow">{task.name}</h4>
            
            <div className="relative" ref={menuRef}>
              <button 
                className="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <p className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium">Assign to:</p>
                    {teamMembers.map(member => (
                      <button 
                        key={member.id} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleAssignToMember(member.id)}
                      >
                        <img src={member.avatar} alt={member.name} className="h-5 w-5 rounded-full mr-2" />
                        {member.name}
                      </button>
                    ))}
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={handleDeleteClick}
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
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {/* Assigned team member */}
          {assignedMember && (
            <div className="flex items-center">
              <div className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                <img src={assignedMember.avatar} alt={assignedMember.name} className="h-5 w-5 rounded-full" />
                <span className="ml-1.5 text-xs text-gray-600 dark:text-gray-400">{assignedMember.name}</span>
              </div>
            </div>
          )}
          
          {/* Status timestamp */}
          {task.statusTimestamp && (
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
        
        {/* Insert drop indicator if needed */}
        {isDraggedOver && dragDirection === 'below' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transform translate-y-1/2"></div>
        )}
      </div>
    );
  };

  // Column component
  const Column = ({ status, title, count }: { status: TaskStatus, title: string, count: number }) => {
    const tasks = getTasksByStatus(status);
    const isAdding = addingToColumn === status;
    const isOver = draggedOverColumn === status;
    
    // Custom colors for each column
    const getColorClasses = () => {
      switch (status) {
        case 'todo':
          return {
            header: 'text-gray-700 dark:text-gray-300',
            bgNormal: 'bg-gray-100 dark:bg-gray-750',
            bgHover: 'bg-gray-200 dark:bg-gray-700',
          };
        case 'in-progress':
          return {
            header: 'text-blue-700 dark:text-blue-300',
            bgNormal: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20',
            bgHover: 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30',
          };
        case 'review':
          return {
            header: 'text-yellow-700 dark:text-yellow-300',
            bgNormal: 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20',
            bgHover: 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30',
          };
        case 'completed':
          return {
            header: 'text-green-700 dark:text-green-300',
            bgNormal: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20',
            bgHover: 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30',
          };
      }
    };
    
    const colors = getColorClasses();
    
    return (
      <div className="flex-1 min-w-[250px] max-w-[350px]">
        <div className={`flex items-center justify-between mb-3 ${colors?.header}`}>
          <h3 className="text-md font-semibold flex items-center">
            {title} <span className="ml-2 bg-white dark:bg-gray-700 shadow-sm text-xs px-2 py-0.5 rounded-full">{count}</span>
          </h3>
          <button 
            onClick={() => setAddingToColumn(status)}
            className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        {isAdding && (
          <div className="mb-3 flex">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Task name..."
              className="flex-1 p-2 border dark:border-gray-600 rounded-l bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              autoFocus
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
          className={`h-full min-h-[200px] p-2 rounded-md border-2 transition-colors duration-200
            ${isOver ? `${colors?.bgHover} border-2 border-blue-400` : `${colors?.bgNormal} border-transparent`}
          `}
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
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-4">No tasks</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message={taskToDelete ? `Are you sure you want to delete "${taskToDelete.name}"? This action cannot be undone.` : "Are you sure you want to delete this task?"}
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
      />

      <div className="flex flex-col md:flex-row gap-4 pb-2 overflow-x-auto min-h-[500px]">
        {/* Todo Column */}
        <Column status="todo" title="To Do" count={getTasksByStatus('todo').length} />
        
        {/* In Progress Column */}
        <Column status="in-progress" title="In Progress" count={getTasksByStatus('in-progress').length} />
        
        {/* Review Column */}
        <Column status="review" title="Review" count={getTasksByStatus('review').length} />
        
        {/* Completed Column */}
        <Column status="completed" title="Completed" count={getTasksByStatus('completed').length} />
      </div>
      
      {/* Quick help text */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Drag tasks between columns to update their status
      </div>
    </div>
  );
} 