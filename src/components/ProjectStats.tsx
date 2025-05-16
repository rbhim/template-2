'use client';

import { useEffect, useRef } from 'react';
import { Project, ProjectStatus } from '../lib/types';

interface ProjectStatsProps {
  projects: Project[];
}

// Simple color scales for charts
const statusColors = {
  'on-track': '#10B981', // green-500
  'at-risk': '#F59E0B', // yellow-500
  'delayed': '#EF4444', // red-500
  'completed': '#8B5CF6', // purple-500
};

export default function ProjectStats({ projects }: ProjectStatsProps) {
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);

  // Project status counts
  const statusCounts = projects.reduce((counts: Record<ProjectStatus, number>, project) => {
    const status = project.status || 'on-track';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {} as Record<ProjectStatus, number>);

  // Calculate completion rates
  const projectCompletionRates = projects.map(project => {
    const completedTasks = project.tasks.filter(task => task.completed).length;
    const totalTasks = project.tasks.length;
    return {
      name: project.name,
      completion: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      status: project.status || 'on-track'
    };
  });

  // Sort projects by completion rate for the bar chart
  const sortedProjects = [...projectCompletionRates]
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 5); // Only show top 5

  // Render donut chart for status distribution
  useEffect(() => {
    if (!donutChartRef.current) return;

    const ctx = donutChartRef.current.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, donutChartRef.current.width, donutChartRef.current.height);

    const centerX = donutChartRef.current.width / 2;
    const centerY = donutChartRef.current.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const innerRadius = radius * 0.6; // For donut hole

    // Calculate total for percentages
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return;

    // Draw the donut chart
    let startAngle = 0;
    Object.entries(statusCounts).forEach(([status, count]) => {
      const sliceAngle = (count / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      
      // Fill with status color
      ctx.fillStyle = statusColors[status as ProjectStatus] || '#CBD5E1'; // gray-300 as fallback
      ctx.fill();
      
      // Move to next slice
      startAngle += sliceAngle;
    });

    // Draw center circle for donut hole
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw total count in center
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#1F2937'; // gray-800
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY);
    
    // Draw "Projects" text below the number
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#6B7280'; // gray-500
    ctx.fillText('Projects', centerX, centerY + 20);

  }, [projects, statusCounts]);

  // Render bar chart for top 5 projects by completion
  useEffect(() => {
    if (!barChartRef.current) return;

    const ctx = barChartRef.current.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, barChartRef.current.width, barChartRef.current.height);

    const chartWidth = barChartRef.current.width;
    const chartHeight = barChartRef.current.height;
    const barWidth = Math.min(40, (chartWidth - 80) / sortedProjects.length);
    const maxBarHeight = chartHeight - 60;
    const barGap = 20;

    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(50, 10);
    ctx.lineTo(50, chartHeight - 30);
    ctx.lineTo(chartWidth - 10, chartHeight - 30);
    ctx.strokeStyle = '#E5E7EB'; // gray-200
    ctx.stroke();

    // Draw y-axis labels (percentages)
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#6B7280'; // gray-500
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    // Draw 0%, 25%, 50%, 75%, 100% markers
    for (let i = 0; i <= 100; i += 25) {
      const y = chartHeight - 30 - (i / 100) * maxBarHeight;
      ctx.fillText(`${i}%`, 45, y);
      
      // Draw light horizontal grid lines
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(chartWidth - 10, y);
      ctx.strokeStyle = '#F3F4F6'; // gray-100
      ctx.stroke();
    }

    // Draw bars and labels
    sortedProjects.forEach((project, index) => {
      const x = 60 + index * (barWidth + barGap);
      const barHeight = (project.completion / 100) * maxBarHeight;
      const y = chartHeight - 30 - barHeight;
      
      // Draw bar
      ctx.fillStyle = statusColors[project.status as ProjectStatus] || '#CBD5E1';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw project name label (truncated if needed)
      ctx.save();
      ctx.translate(x + barWidth / 2, chartHeight - 15);
      ctx.rotate(-Math.PI / 4); // Rotate text for better fit
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#374151'; // gray-700
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      // Truncate long names
      let name = project.name;
      if (name.length > 15) {
        name = name.substring(0, 13) + '...';
      }
      
      ctx.fillText(name, 0, 0);
      ctx.restore();
      
      // Draw completion percentage on top of bar
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#1F2937'; // gray-800
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${Math.round(project.completion)}%`, x + barWidth / 2, y - 5);
    });

  }, [sortedProjects]);

  // Calculate task completion statistics
  const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const completedTasks = projects.reduce((sum, project) => 
    sum + project.tasks.filter(task => task.completed).length, 0);
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate upcoming deadlines (projects due in the next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const upcomingDeadlines = projects.filter(project => {
    const dueDate = new Date(project.dueDate);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Status Distribution</h3>
        <div className="flex items-center justify-center h-64">
          <canvas 
            ref={donutChartRef} 
            width={240} 
            height={240} 
            className="mx-auto"
          ></canvas>
        </div>
        <div className="flex flex-wrap justify-center mt-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: statusColors[status as ProjectStatus] }}
              ></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}: {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Completion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Completion Rates</h3>
        <div className="h-64">
          <canvas 
            ref={barChartRef} 
            width={500} 
            height={240} 
            className="mx-auto"
          ></canvas>
        </div>
      </div>

      {/* Task Completion Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Task Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</p>
            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Completion</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{taskCompletionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                taskCompletionRate >= 75 ? 'bg-green-600' : 
                taskCompletionRate >= 50 ? 'bg-blue-600' : 
                taskCompletionRate >= 25 ? 'bg-yellow-500' : 
                'bg-red-600'
              }`}
              style={{ width: `${taskCompletionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Most Common Task Statuses</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Not Started</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {totalTasks - completedTasks}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
              <span className="text-sm font-medium text-green-600">
                {completedTasks}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Deadlines (Next 30 Days)</h3>
        
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-3">
            {upcomingDeadlines.map(project => {
              const dueDate = new Date(project.dueDate);
              const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={project.id} className="flex justify-between items-center p-2 border-b dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{project.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Due: {project.dueDate}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    daysLeft <= 7 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                    daysLeft <= 14 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {daysLeft} days left
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">No upcoming deadlines in the next 30 days</p>
        )}
      </div>
    </div>
  );
} 