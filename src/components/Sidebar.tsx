'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Project } from '../lib/types';

interface SidebarProps {
  activeTab: 'dashboard' | 'gantt' | 'teams';
  setActiveTab: (tab: 'dashboard' | 'gantt' | 'teams') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  recentProjects?: Project[];
  upcomingDeadlines?: Project[];
  onProjectSelect?: (project: Project) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleDarkMode,
  recentProjects = [],
  upcomingDeadlines = [],
  onProjectSelect = () => {}
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`transition-all duration-300 ease-in-out h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo and Header */}
      <div className="py-6 px-4 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#1A3671] to-[#2A4681] dark:from-gray-800 dark:to-gray-900 relative">
        <div className={`${isCollapsed ? 'w-14 h-14' : 'w-44 h-16'} bg-white dark:bg-gray-800 rounded-xl p-2 flex items-center justify-center shadow-md transition-all duration-300 border border-white/20 dark:border-gray-700/50`}>
          <img 
            src="/images/logo.png"
            alt="TraffMobility Logo"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Collapse toggle button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-10 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110 z-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 bg-pattern">
        <nav className="space-y-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#1A3671] to-[#2A4681] text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02]'
            } hover:shadow-md transition-all duration-300`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isCollapsed ? 'mx-auto' : 'mr-4'} ${activeTab === 'dashboard' ? 'animate-pulse' : ''}`}>
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            {!isCollapsed && <span className="font-medium">{activeTab === 'dashboard' && "👉 "}Dashboard</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('gantt')}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all ${
              activeTab === 'gantt'
                ? 'bg-gradient-to-r from-[#1A3671] to-[#2A4681] text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02]'
            } hover:shadow-md transition-all duration-300`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isCollapsed ? 'mx-auto' : 'mr-4'} ${activeTab === 'gantt' ? 'animate-pulse' : ''}`}>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            {!isCollapsed && <span className="font-medium">{activeTab === 'gantt' && "👉 "}Timeline</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('teams')}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-[#1A3671] to-[#2A4681] text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02]'
            } hover:shadow-md transition-all duration-300`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isCollapsed ? 'mx-auto' : 'mr-4'} ${activeTab === 'teams' ? 'animate-pulse' : ''}`}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {!isCollapsed && <span className="font-medium">{activeTab === 'teams' && "👉 "}Team Management</span>}
          </button>
        </nav>
      </div>
      
      {/* Recent Projects Section */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Recent Projects
          </h3>
          {recentProjects.length > 0 ? (
            <ul className="space-y-1">
              {recentProjects.map(project => (
                <li key={project.id} className="text-sm">
                  <button 
                    onClick={() => {
                      setActiveTab('dashboard');
                      onProjectSelect(project);
                    }}
                    className="w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span 
                      className={`w-2 h-2 rounded-full mr-2 ${
                        project.status === 'on-track' 
                          ? 'bg-green-500' 
                          : project.status === 'at-risk'
                            ? 'bg-yellow-500'
                            : project.status === 'delayed'
                              ? 'bg-red-500'
                              : 'bg-purple-500' // completed
                      }`}
                    ></span>
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              No recent projects. View a project to add it here.
            </p>
          )}
        </div>
      )}

      {/* Upcoming Deadlines */}
      {!isCollapsed && upcomingDeadlines.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Upcoming Deadlines
          </h3>
          <ul className="space-y-1">
            {upcomingDeadlines.map(project => {
              // Calculate days until deadline
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueDate = new Date(project.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              const timeDiff = dueDate.getTime() - today.getTime();
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
              
              // Determine deadline text and color
              let deadlineText = '';
              let deadlineColor = '';
              
              if (daysDiff === 0) {
                deadlineText = 'Today';
                deadlineColor = 'text-red-500';
              } else if (daysDiff === 1) {
                deadlineText = 'Tomorrow';
                deadlineColor = 'text-orange-500';
              } else if (daysDiff <= 3) {
                deadlineText = `${daysDiff} days`;
                deadlineColor = 'text-orange-400';
              } else {
                deadlineText = `${daysDiff} days`;
                deadlineColor = 'text-yellow-500';
              }
              
              return (
                <li key={project.id} className="text-sm">
                  <button 
                    onClick={() => {
                      setActiveTab('gantt');
                      onProjectSelect(project);
                    }}
                    className="w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className={`text-xs mr-2 ${deadlineColor}`}>{deadlineText}</span>
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Quick Links */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <button 
              onClick={() => {
                setActiveTab('dashboard');
                // Find the add new project button and click it
                setTimeout(() => {
                  const addButton = document.querySelector('button.bg-gradient-to-r.from-blue-600');
                  if (addButton) {
                    (addButton as HTMLButtonElement).click();
                  }
                }, 100);
              }}
              className="text-sm w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="text-sm w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View All Projects
            </button>
            <button 
              onClick={() => setActiveTab('gantt')}
              className="text-sm w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Timeline View
            </button>
          </div>
        </div>
      )}

      {/* Workspace Status */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Workspace Status
          </h3>
          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Storage</span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '37%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>API Usage</span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>System: Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
              <span>Last sync: 3 mins ago</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 px-4">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isCollapsed ? 'mx-auto' : 'mr-3'}>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isCollapsed ? 'mx-auto' : 'mr-3'}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );
} 