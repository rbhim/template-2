'use client';

import { useState, useEffect, useRef } from 'react';
import { Project, ProjectStatus, ProjectPriority } from '../lib/types';
import { format } from 'date-fns';

interface GanttChartProps {
  projects: Project[];
}

export default function GanttChart({ projects }: GanttChartProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dateHeaders, setDateHeaders] = useState<Date[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [zoomedProjectId, setZoomedProjectId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showTodayLine, setShowTodayLine] = useState(true);
  const [todayLineHeight, setTodayLineHeight] = useState(0);

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
    const projectStartDate = new Date(project.startDate);
    const projectEndDate = new Date(project.dueDate);
    
    // Find the position based on start date
    const startIndex = dateHeaders.findIndex(date => 
      date.getTime() >= projectStartDate.getTime()
    );
    
    // Find the position based on end date
    const endIndex = dateHeaders.findIndex(date => 
      date.getTime() >= projectEndDate.getTime()
    );
    
    // Calculate positions as percentages of the timeline
    const startPosition = startIndex !== -1 
      ? startIndex / dateHeaders.length * 100 
      : 0; // Default to start if not found
    
    const endPosition = endIndex !== -1 
      ? endIndex / dateHeaders.length * 100 
      : 95; // Default to near end if not found
    
    // Calculate width based on duration
    const barWidth = Math.max(endPosition - startPosition, 3); // Minimum 3% width for visibility
    
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
      left: `${Math.min(startPosition, 95)}%`,
      width: `${Math.min(barWidth, 95)}%`,
      completion,
      barColor
    };
  };

  // Calculate the position of today's date on the timeline
  const getTodayPosition = () => {
    const today = new Date();
    
    // Find the index of the date header closest to today
    const todayIndex = dateHeaders.findIndex(date => 
      date.getTime() >= today.getTime()
    );
    
    // Calculate position as percentage
    return todayIndex !== -1 
      ? todayIndex / dateHeaders.length * 100 
      : null; // Return null if today is not in the visible range
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

  // Helper to update project dates (simulate for demo)
  const handleBarDrag = (projectId: string, newStart: Date, newEnd: Date) => {
    // For demo: just log or update local state if needed
    // In real app, call onUpdateProject
  };

  // Zoom to a specific project's timeline
  const zoomToProject = (projectId: string | null) => {
    // If null, reset to default view
    if (projectId === null) {
      setZoomedProjectId(null);
      setStartDate(new Date()); // Reset to current month
      setTimeRange('month'); // Reset to month view
      return;
    }
    
    // Find the project to zoom to
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.dueDate);
    
    // Calculate the duration in days
    const durationDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Choose an appropriate time range based on duration
    if (durationDays <= 31) {
      setTimeRange('month');
      
      // Set start date to the beginning of the project's month
      const startOfMonth = new Date(projectStart);
      startOfMonth.setDate(1);
      setStartDate(startOfMonth);
    } else if (durationDays <= 90) {
      setTimeRange('quarter');
      
      // Set start date to the beginning of the quarter
      const quarterStart = new Date(projectStart);
      quarterStart.setDate(1);
      quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3); // Round to quarter start
      setStartDate(quarterStart);
    } else {
      setTimeRange('year');
      
      // Set start date to the beginning of the year
      const yearStart = new Date(projectStart);
      yearStart.setMonth(0);
      yearStart.setDate(1);
      setStartDate(yearStart);
    }
    
    setZoomedProjectId(projectId);
    
    // Expand the project if it's not already expanded
    if (expandedProjectId !== projectId) {
      setExpandedProjectId(projectId);
    }
  };

  // Helper to render project bar (with drag/resize, tooltip)
  const renderProjectBar = (project: Project, isTask = false, parentPosition?: string) => {
    const { left, width, completion, barColor } = getProjectBarStyle(project);
    
    // Task bars should be positioned relative to the parent project's timeframe
    const positionStyle = parentPosition ? { left: parentPosition, width: '100%' } : { left, width };
    
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const chartRect = chartRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      
      // Calculate tooltip position
      const top = rect.top - chartRect.top + rect.height + 8; // 8px below the bar
      const left = rect.left - chartRect.left + (rect.width / 2);
      
      setTooltipPosition({ top, left });
      setHoveredProjectId(project.id);
    };
    
    const isZoomed = zoomedProjectId === project.id;
    
    return (
      <div
        className={`absolute h-6 rounded ${barColor} opacity-80 transition-all duration-300 shadow-sm cursor-default group ${isTask ? 'h-4' : 'h-6'} z-20 
          ${isZoomed ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''}`}
        style={positionStyle}
        title={project.name}
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHoveredProjectId(null)}
        role="region"
        aria-label={`Project timeline for ${project.name}`}
      >
        {/* Progress overlay */}
        <div
          className="h-full bg-white dark:bg-gray-900 opacity-60 rounded"
          style={{ width: `${100 - completion}%` }}
        ></div>
        {/* Progress label */}
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-900 dark:text-white">
          {Math.round(completion)}%
        </span>
        
        {/* Only show zoom buttons on main project bars, not tasks */}
        {!isTask && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isZoomed ? (
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  zoomToProject(null);
                }}
                className="bg-gray-700/70 hover:bg-gray-600 text-white p-1 rounded"
                title="Reset timeline view"
                aria-label="Reset timeline view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18v18H3z" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  zoomToProject(project.id);
                }}
                className="bg-blue-600/70 hover:bg-blue-500 text-white p-1 rounded"
                title="Zoom to this project's timeline"
                aria-label="Zoom to this project's timeline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 8L20 8 20 17" />
                  <path d="M4 4L20 20" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Drag/resize handles (visual only for demo) */}
        <div className="absolute left-0 top-0 h-full w-2 bg-black/10 cursor-ew-resize rounded-l group-hover:bg-blue-400" />
        <div className="absolute right-0 top-0 h-full w-2 bg-black/10 cursor-ew-resize rounded-r group-hover:bg-blue-400" />
      </div>
    );
  };

  // Apply filters to projects
  const filteredProjects = projects
    .filter(project => {
      // Apply status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }
      
      // Apply priority filter
      if (priorityFilter !== 'all' && project.priority !== priorityFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        return (
          project.name.toLowerCase().includes(query) ||
          project.client.toLowerCase().includes(query)
        );
      }
      
      return true;
    });

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  // Update today line height when projects change or when scrolling
  useEffect(() => {
    const updateTodayLineHeight = () => {
      if (chartRef.current) {
        const chartHeight = chartRef.current.scrollHeight;
        setTodayLineHeight(chartHeight);
      }
    };

    // Initial update
    updateTodayLineHeight();

    // Update when scrolling (in case of dynamic height changes)
    const handleScroll = () => updateTodayLineHeight();
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.addEventListener('scroll', handleScroll);
    }

    // Add resize observer to handle container size changes
    if (chartElement && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(updateTodayLineHeight);
      resizeObserver.observe(chartElement);
      return () => {
        if (chartElement) {
          chartElement.removeEventListener('scroll', handleScroll);
        }
        resizeObserver.disconnect();
      };
    }
    
    return () => {
      if (chartElement) {
        chartElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [filteredProjects, expandedProjectId]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 animate-fade-in shadow-md">
      {/* Timeline header with navigation & time range selector */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Project Timeline</h3>
          {zoomedProjectId && (
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <span>Zoomed to: </span>
              <span className="font-medium ml-1">
                {projects.find(p => p.id === zoomedProjectId)?.name}
              </span>
              <button 
                onClick={() => zoomToProject(null)}
                className="ml-2 flex items-center text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-0.5 rounded"
              >
                Reset View
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          
          <div className="ml-2 border-l pl-2 dark:border-gray-600">
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

          {/* Toggle Today Line button */}
          <button
            onClick={() => setShowTodayLine(!showTodayLine)}
            className={`ml-2 flex items-center text-sm ${
              showTodayLine ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            } hover:underline`}
            title={showTodayLine ? "Hide Today Line" : "Show Today Line"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="12" y1="2" x2="12" y2="22"></line>
            </svg>
            Today Line
          </button>
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Active filter indicators (only shown when filters are collapsed) */}
        {!showFilters && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {searchQuery && (
              <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 flex items-center">
                <span>Search: {searchQuery}</span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                Status: {statusFilter === 'on-track' ? 'On Track' : 
                        statusFilter === 'at-risk' ? 'At Risk' : 
                        statusFilter === 'delayed' ? 'Delayed' : 'Completed'}
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100">
                Priority: {priorityFilter === 'high' ? 'High' : 
                         priorityFilter === 'medium' ? 'Medium' : 'Low'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search & Filter Panel */}
      <div 
        id="filter-panel"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters 
            ? 'max-h-[1000px] opacity-100 mb-4' 
            : 'max-h-0 opacity-0 mt-0 mb-0'
        }`}
      >
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg animate-fade-in">
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or client..."
                  className="w-full pl-8 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2 top-3 text-gray-400">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as ProjectPriority | 'all')}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="self-end">
              <button
                onClick={clearFilters}
                className="p-2 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                disabled={searchQuery === '' && statusFilter === 'all' && priorityFilter === 'all'}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProjects.length} of {projects.length} projects
            {(searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <span> (filtered)</span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline content */}
      <div 
        ref={chartRef} 
        className="relative overflow-auto mt-4"
        style={{ 
          maxHeight: showFilters ? 'calc(100vh - 350px)' : 'calc(100vh - 220px)', 
          scrollbarWidth: 'thin' 
        }}
      >
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
        <div className="overflow-x-auto overflow-y-auto relative" style={{ maxHeight: '60vh' }} ref={chartRef}>
          {/* Today's vertical line */}
          {showTodayLine && (() => {
            const todayPosition = getTodayPosition();
            if (todayPosition !== null) {
              return (
                <div 
                  className="absolute top-0 left-0 w-full pointer-events-none z-10"
                  style={{ 
                    paddingLeft: '25%', // Account for the left label column
                    height: '100%'
                  }}
                >
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-blue-600 dark:border-blue-500"
                    style={{ 
                      left: `${todayPosition * 0.75}%`, // Adjust for the label column (25% width)
                      height: todayLineHeight || '100%',
                      pointerEvents: 'none'
                    }}
                    aria-label="Current date"
                  >
                    <div className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-1 py-0.5 rounded absolute top-0 -translate-x-1/2">
                      Today
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          <div className="min-w-full">
            {filteredProjects.map((project, projectIndex) => {
              const isExpanded = expandedProjectId === project.id;
              const taskHeight = 32; // Height for each task bar
              const taskMargin = 8; // Margin between tasks
              const totalTasks = project.tasks.length;
              
              // Calculate total row height including expanded tasks and spacing
              const expandedHeight = isExpanded ? 
                (taskHeight + taskMargin) * totalTasks + 60 : 0;
                
              // Base project row height plus expanded height if needed
              const rowHeight = 50 + expandedHeight;
              
              return (
                <div key={project.id} className="project-row mb-3 pb-3 relative" style={{ minHeight: rowHeight }}>
                  <div className="flex items-center mb-2">
                    <div className="w-1/4 pr-2 truncate text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <button
                        className="mr-2 text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                        onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                        aria-label={isExpanded ? 'Collapse tasks' : 'Expand tasks'}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                      {project.name}
                    </div>
                    <div className="w-3/4 relative h-10">
                      {renderProjectBar(project)}
                    </div>
                  </div>
                  
                  {/* Space between project and tasks when expanded */}
                  {isExpanded && <div className="h-4"></div>}
                  
                  {/* Show tasks as sub-bars if expanded */}
                  {isExpanded && (
                    <div className="tasks-container px-8 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks</span>
                      </div>
                      
                      {/* Tasks */}
                      {project.tasks.map((task, index) => (
                        <div 
                          key={task.id} 
                          className="flex items-center mb-2.5"
                          style={{ height: taskHeight }}
                        >
                          <div className="w-1/4 pr-2 truncate text-sm text-gray-600 dark:text-gray-400">
                            {task.name}
                          </div>
                          <div className="w-3/4 relative" style={{ height: taskHeight - 8 }}>
                            {renderProjectBar({
                              ...project,
                              id: project.id + '-' + task.id,
                              name: task.name,
                              startDate: project.startDate,
                              dueDate: project.dueDate,
                              tasks: [task],
                              status: task.completed ? 'completed' : 'on-track',
                            }, true)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Floating Tooltip - positioned absolutely within chart container */}
          {hoveredProjectId && (
            <div 
              className="absolute bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg p-3 text-xs w-64 animate-fade-in z-[100]"
              style={{ 
                top: `${tooltipPosition.top}px`, 
                left: `${tooltipPosition.left}px`,
                transform: 'translateX(-50%)',
                minWidth: '12rem', 
                maxWidth: '18rem', 
                whiteSpace: 'normal' 
              }}
            >
              {(() => {
                const project = projects.find(p => {
                  // Check if it's a main project or a task
                  if (p.id === hoveredProjectId) return true;
                  // Check if it's a task (format: projectId-taskId)
                  if (hoveredProjectId.includes('-')) {
                    const [projectId, taskId] = hoveredProjectId.split('-');
                    return p.id === projectId;
                  }
                  return false;
                });
                
                if (!project) return null;
                
                // If it's a task (format: projectId-taskId)
                if (hoveredProjectId.includes('-')) {
                  const [projectId, taskId] = hoveredProjectId.split('-');
                  const task = project.tasks.find(t => t.id === taskId);
                  
                  if (task) {
                    return (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">{task.name}</div>
                        <div className="mb-1.5 font-medium">
                          {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.dueDate), 'MMM d, yyyy')}
                        </div>
                        <div>Status: <span className="font-medium">{task.completed ? 'Completed' : 'In Progress'}</span></div>
                        <div>Project: {project.name}</div>
                        <div>Client: {project.client}</div>
                      </>
                    );
                  }
                }
                
                // Regular project tooltip
                return (
                  <>
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">{project.name}</div>
                    <div className="mb-1.5 font-medium">
                      {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.dueDate), 'MMM d, yyyy')}
                    </div>
                    <div>Status: <span className="font-medium">{project.status}</span></div>
                    <div>Client: {project.client}</div>
                    <div>Progress: {Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100) || 0}%</div>
                    <div>Tasks: {project.tasks.length}</div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex flex-wrap items-center gap-y-2">
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
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center ml-4 pl-4 border-l dark:border-gray-600">
            <div className="h-3 border-l-2 border-blue-600 dark:border-blue-500 mr-1"></div>
            <span>Current Date</span>
          </div>
        </div>
        <div className="text-xs text-right">
          <span className="text-blue-600 dark:text-blue-400">Tip:</span> Hover over a project and click the zoom icon <span className="inline-block mx-1 p-0.5 bg-blue-600/70 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M11 8L20 8 20 17" />
              <path d="M4 4L20 20" />
            </svg>
          </span> to focus on it.
        </div>
      </div>
    </div>
  );
} 