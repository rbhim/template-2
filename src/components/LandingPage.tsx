'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../lib/hooks/useAuth';
import SignInWithGoogle from './SignInWithGoogle';
import SignInWithMicrosoft from './SignInWithMicrosoft';

export default function LandingPage() {
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding and Info */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#1A3671] to-[#2A4681] text-white flex-col justify-center items-center p-10">
        <div className="max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">TraffMobility Engineering Inc.</h1>
            <p className="text-xl text-blue-100">Project Management Portal</p>
          </div>
          
          <div className="space-y-8 mt-12">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Project Tracking</h3>
                <p className="text-blue-100">Manage and track your projects from start to finish</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Timeline Management</h3>
                <p className="text-blue-100">Interactive Gantt charts with drag-to-resize timeline bars</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Team Coordination</h3>
                <p className="text-blue-100">Manage team members and assign them to projects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8">
          {/* Mobile logo - only visible on mobile */}
          <div className="text-center mb-8 md:hidden">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">TraffMobility Engineering Inc.</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Project Management Portal</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6">Sign In to Your Account</h2>
            
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
                {errorMessage}
              </div>
            )}
            
            {/* Sign-in options */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <SignInWithGoogle />
              </div>
              
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="flex justify-center">
                <SignInWithMicrosoft />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Only authorized users with @traffmobility.com emails can access this portal.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} TraffMobility Engineering Inc.</p>
            <p className="text-xs mt-1">All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
} 