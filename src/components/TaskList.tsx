'use client';

import { useState } from 'react';
import { Task } from '../lib/types';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, completed: boolean) => void;
  onTaskReorder: (taskId: string, newOrder: number) => void;
  onTaskAdd: (taskName: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function TaskList({ 
  tasks, 
  onTaskUpdate, 
  onTaskReorder,
  onTaskAdd,
  onTaskDelete 
}: TaskListProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    
    onTaskAdd(newTaskName.trim());
    setNewTaskName('');
  };

  const handleSaveEditTask = (taskId: string) => {
    if (!editingTaskName.trim()) return;
    
    // Find the task
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Create an updated task with the new name
    const updatedTask = {
      ...tasks[taskIndex],
      name: editingTaskName.trim(),
    };
    
    // Get its current status and apply that too
    onTaskUpdate(taskId, updatedTask.completed);
    
    // Reset editing state
    setEditingTaskId(null);
    setEditingTaskName('');
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;
    
    const draggedTaskIndex = sortedTasks.findIndex(t => t.id === draggedTaskId);
    const targetTaskIndex = sortedTasks.findIndex(t => t.id === targetTaskId);
    
    if (draggedTaskIndex === -1 || targetTaskIndex === -1) return;
    
    // If dragging downward, place after the target
    const newOrder = targetTaskIndex > draggedTaskIndex 
      ? sortedTasks[targetTaskIndex].order + 0.5 
      : sortedTasks[targetTaskIndex].order - 0.5;
      
    // Update the order
    onTaskReorder(draggedTaskId, newOrder);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-4">
      {/* Task List */}
      <div className="space-y-2">
        {sortedTasks.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300 text-sm italic">No tasks for this project yet.</p>
        ) : (
          <ul className="space-y-2">
            {sortedTasks.map((task) => (
              <li 
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                onDragOver={(e) => handleDragOver(e, task.id)}
                onDragEnd={handleDragEnd}
                className={`border dark:border-gray-700 rounded p-3 ${
                  task.completed ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                } flex items-center justify-between group transition-all duration-200 ${
                  draggedTaskId === task.id ? 'shadow-md scale-[1.02]' : ''
                }`}
              >
                {editingTaskId === task.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTaskName}
                      onChange={(e) => setEditingTaskName(e.target.value)}
                      className="flex-1 p-1.5 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEditTask(task.id)}
                      className="p-1 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400"
                      title="Save"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="p-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      title="Cancel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => onTaskUpdate(task.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${task.completed ? 'opacity-100' : 'opacity-0'}`}>
                          <svg className="h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className={`${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} font-medium transition-colors duration-300`}>
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditingTaskName(task.name);
                        }}
                        className="p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => onTaskDelete(task.id)}
                        className="p-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                      <div 
                        className="p-1 text-gray-500 dark:text-gray-400 cursor-grab"
                        title="Drag to reorder"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18h6"></path>
                          <path d="M9 12h6"></path>
                          <path d="M9 6h6"></path>
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add New Task */}
      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddTask();
          }}
        />
        <button
          onClick={handleAddTask}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
} 