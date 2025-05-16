'use client';

import { useState } from 'react';
import { Task } from '../lib/types';

interface TaskCategory {
  id: string;
  name: string;
  color: string;
  tasks: string[]; // Task IDs
}

interface TaskCategoryManagerProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, completed: boolean) => void;
}

// Predefined colors for categories
const categoryColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
];

export default function TaskCategoryManager({ tasks, onTaskUpdate }: TaskCategoryManagerProps) {
  const [categories, setCategories] = useState<TaskCategory[]>([
    { id: '1', name: 'Documentation', color: 'bg-blue-500', tasks: [] },
    { id: '2', name: 'Field Work', color: 'bg-green-500', tasks: [] },
    { id: '3', name: 'Analysis', color: 'bg-yellow-500', tasks: [] },
    { id: '4', name: 'Review', color: 'bg-purple-500', tasks: [] },
  ]);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);

  // Add a new category
  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: TaskCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: selectedColor,
      tasks: [],
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setSelectedColor('bg-blue-500');
    setShowAddForm(false);
  };

  // Save edited category
  const saveCategory = () => {
    if (!editingCategoryId || !editedCategoryName.trim()) return;
    
    setCategories(categories.map(category => 
      category.id === editingCategoryId
        ? { ...category, name: editedCategoryName, color: selectedColor }
        : category
    ));
    
    setEditingCategoryId(null);
    setEditedCategoryName('');
  };

  // Delete a category
  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter(category => category.id !== categoryId));
    
    // Remove assignments for this category
    const newAssignments = { ...taskAssignments };
    Object.entries(newAssignments).forEach(([taskId, catId]) => {
      if (catId === categoryId) {
        delete newAssignments[taskId];
      }
    });
    setTaskAssignments(newAssignments);
  };

  // Handle drag start
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  // Handle drag over category
  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setIsDraggingOver(categoryId);
  };

  // Handle drop on category
  const handleDrop = (categoryId: string) => {
    if (!draggedTaskId) return;
    
    // Update task assignments
    setTaskAssignments({
      ...taskAssignments,
      [draggedTaskId]: categoryId,
    });
    
    setDraggedTaskId(null);
    setIsDraggingOver(null);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setIsDraggingOver(null);
  };

  // Get tasks assigned to a category
  const getCategoryTasks = (categoryId: string) => {
    const assignedTaskIds = Object.entries(taskAssignments)
      .filter(([_, catId]) => catId === categoryId)
      .map(([taskId]) => taskId);
    
    return tasks.filter(task => assignedTaskIds.includes(task.id));
  };

  // Get unassigned tasks
  const getUnassignedTasks = () => {
    const assignedTaskIds = Object.keys(taskAssignments);
    return tasks.filter(task => !assignedTaskIds.includes(task.id));
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Categories</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Category'}
          </button>
        </div>
        
        {showAddForm && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 animate-slide-in">
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {categoryColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full ${color} ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={addCategory}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Add
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div 
              key={category.id}
              className={`border dark:border-gray-700 rounded-lg overflow-hidden ${
                isDraggingOver === category.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, category.id)}
              onDrop={() => handleDrop(category.id)}
              onDragLeave={handleDragLeave}
            >
              <div className={`${category.color} h-2`} />
              <div className="p-3">
                {editingCategoryId === category.id ? (
                  <div className="animate-fade-in">
                    <input
                      type="text"
                      value={editedCategoryName}
                      onChange={(e) => setEditedCategoryName(e.target.value)}
                      className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
                    />
                    <div className="flex flex-wrap gap-2 mb-2">
                      {categoryColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-5 h-5 rounded-full ${color} ${
                            selectedColor === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                          }`}
                          aria-label={`Select ${color} color`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveCategory}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className="px-2 py-1 border text-xs rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setEditedCategoryName(category.name);
                          setSelectedColor(category.color);
                        }}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                        aria-label="Edit category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                        aria-label="Delete category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 space-y-2 min-h-20">
                  {getCategoryTasks(category.id).map(task => (
                    <div key={task.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => onTaskUpdate(task.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className={`ml-2 text-sm ${
                        task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {task.name}
                      </span>
                    </div>
                  ))}
                  
                  {getCategoryTasks(category.id).length === 0 && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-2">
                      Drag tasks here
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unassigned Tasks</h3>
        <div className="space-y-2">
          {getUnassignedTasks().map(task => (
            <div 
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task.id)}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-grab hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => onTaskUpdate(task.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600"
                />
                <span className={`ml-2 text-sm ${
                  task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {task.name}
                </span>
              </div>
              <div className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                Drag to assign
              </div>
            </div>
          ))}
          
          {getUnassignedTasks().length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              All tasks have been assigned to categories!
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 