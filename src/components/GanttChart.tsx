'use client';

import { useState, useEffect } from 'react';
import { Project } from '../lib/types';

interface GanttChartProps {
  projects: Project[];
}

export default function GanttChart({ projects }: GanttChartProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dateHeaders, setDateHeaders] = useState<Date[]>([]);

  // Prepare the date headers based on the selected time range
  useEffect(() => {
    const headers: Date[] = [];
    const start = new Date(startDate);
    
    if (timeRange === 'month') {
      // Show days in a month
      start.setDate(1); // Start from the 1st of the month
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      
      for (let i = 0; i < daysInMonth; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        headers.push(date);
      }
    } else if (timeRange === 'quarter') {
      // Show weeks in a quarter
      start.setDate(1);
      for (let i = 0; i < 12; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i * 7); // Weekly intervals
        headers.push(date);
      }
    } else {
      // Show months in a year
      start.setDate(1);
      start.setMonth(0); // Start from January
      for (let i = 0; i < 12; i++) {
        const date = new Date(start);
        date.setMonth(start.getMonth() + i);
        headers.push(date);
      }
    }
    
    setDateHeaders(headers);
  }, [timeRange, startDate]);

  // Get the earliest and latest dates from all projects
  const earliestDate = new Date(Math.min(
    ...projects.map(p => new Date(p.dueDate).getTime())
  ));
  
  const latestDate = new Date(Math.max(
    ...projects.map(p => new Date(p.dueDate).getTime())
  ));

  // Helper function to get day of the month suffix (1st, 2nd, 3rd, etc.)
  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format the date header based on the time range
  const formatDateHeader = (date: Date) => {
    if (timeRange === 'month') {
      const day = date.getDate();
      return `${day}${getDaySuffix(day)}`;
    } else if (timeRange === 'quarter') {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      return date.toLocaleString('default', { month: 'short' });
    }
  };

  // Calculate position and width for a project bar
  const getProjectBarStyle = (project: Project) => {
    const projectDate = new Date(project.dueDate);
    
    // For simplicity, we're just using the due date for position
    // In a real app, you'd use both start and end dates
    
    // Find the closest date header for positioning
    const closestHeaderIndex = dateHeaders.findIndex(date => 
      date.getTime() >= projectDate.getTime()
    );
    
    const position = closestHeaderIndex !== -1 
      ? closestHeaderIndex / dateHeaders.length * 100 
      : 90; // Default to near end if not found
    
    // Calculate completion based on tasks
    const completedTasks = project.tasks.filter(t => t.completed).length;
    const completion = project.tasks.length > 0 
      ? (completedTasks / project.tasks.length) * 100 
      : 0;
    
    // Calculate color based on status
    let barColor = '';
    switch(project.status) {
      case 'on-track': barColor = 'bg-green-500'; break;
      case 'at-risk': barColor = 'bg-yellow-500'; break;
      case 'delayed': barColor = 'bg-red-500'; break;
      case 'completed': barColor = 'bg-purple-500'; break;
      default: barColor = 'bg-blue-500';
    }
    
    return {
      left: `${Math.min(position, 95)}%`,
      width: '5%', // Fixed width for simplicity
      completion,
      barColor
    };
  };

  // Navigate to previous/next time period
  const navigatePrevious = () => {
    const newDate = new Date(startDate);
    if (timeRange === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (timeRange === 'quarter') {
      newDate.setMonth(newDate.getMonth() - 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setStartDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(startDate);
    if (timeRange === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (timeRange === 'quarter') {
      newDate.setMonth(newDate.getMonth() + 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setStartDate(newDate);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 animate-fade-in shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Timeline</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={navigatePrevious}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {timeRange === 'month' 
              ? startDate.toLocaleString('default', { month: 'long', year: 'numeric' })
              : timeRange === 'quarter'
                ? `Q${Math.floor(startDate.getMonth() / 3) + 1} ${startDate.getFullYear()}`
                : startDate.getFullYear().toString()
            }
          </span>

          <button 
            onClick={navigateNext}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          
          <div className="ml-4 border-l pl-4 dark:border-gray-600">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'month' | 'quarter' | 'year')}
              className="text-sm border rounded p-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date Headers */}
      <div className="mb-2 mt-6 overflow-x-auto">
        <div className="min-w-full flex border-b dark:border-gray-700 pb-2">
          <div className="w-1/4 pr-2 text-sm font-medium text-gray-500 dark:text-gray-400">Project</div>
          <div className="w-3/4 flex">
            {dateHeaders.map((date, index) => (
              <div key={index} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
                {formatDateHeader(date)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Bars */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {projects.map(project => {
            const { left, width, completion, barColor } = getProjectBarStyle(project);
            
            return (
              <div key={project.id} className="flex items-center h-10 mb-2">
                <div className="w-1/4 pr-2 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                  {project.name}
                </div>
                <div className="w-3/4 relative h-6">
                  {/* Project Bar */}
                  <div 
                    className={`absolute h-6 rounded ${barColor} opacity-80 transition-all duration-300 shadow-sm`}
                    style={{ left, width }}
                    title={`${project.name}: Due ${project.dueDate}`}
                  >
                    {/* Completion Overlay */}
                    <div 
                      className="h-full bg-white dark:bg-gray-900 opacity-60 rounded"
                      style={{ width: `${100 - completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>On Track</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
          <span>At Risk</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span>Delayed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
} 