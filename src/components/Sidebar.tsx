'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SidebarProps {
  activeTab: 'dashboard' | 'gantt' | 'teams';
  setActiveTab: (tab: 'dashboard' | 'gantt' | 'teams') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, toggleDarkMode }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`transition-all duration-300 ease-in-out h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-md flex flex-col ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo and Header */}
      <div className="py-8 px-4 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-[#1A3671] dark:bg-gray-800 relative">
        <div className={`${isCollapsed ? 'w-16 h-16' : 'w-44 h-16'} bg-white rounded-lg p-1 flex items-center justify-center`}>
          <img 
            src="/images/logo.png"
            alt="TraffMobility Logo"
            className="w-full h-full object-contain"
          />
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-3 p-2 rounded-full bg-white text-[#1A3671] hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3.5 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#1A3671] text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isCollapsed ? 'mx-auto' : 'mr-4'}>
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            {!isCollapsed && <span className="font-medium">Dashboard</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('gantt')}
            className={`w-full flex items-center px-4 py-3.5 rounded-lg transition-all ${
              activeTab === 'gantt'
                ? 'bg-[#1A3671] text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isCollapsed ? 'mx-auto' : 'mr-4'}>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            {!isCollapsed && <span className="font-medium">Timeline</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('teams')}
            className={`w-full flex items-center px-4 py-3.5 rounded-lg transition-all ${
              activeTab === 'teams'
                ? 'bg-[#1A3671] text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isCollapsed ? 'mx-auto' : 'mr-4'}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {!isCollapsed && <span className="font-medium">Team Management</span>}
          </button>
        </nav>
      </div>
      
      {/* Bottom Actions Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all ${
            isCollapsed ? '' : 'justify-between'
          } text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isCollapsed ? '' : 'mr-3'}>
              <circle cx="12" cy="12" r="5"></circle>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isCollapsed ? '' : 'mr-3'}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
          {!isCollapsed && <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </div>
  );
} 