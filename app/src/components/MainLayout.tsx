import React from 'react';
import { Sidebar, SidebarContent } from './Sidebar';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';

export const MainLayout: React.FC = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar className="w-64">
        <SidebarContent />
      </Sidebar>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Lesson Planner</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search lessons, subjects..." 
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="relative">
                  <button className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="mr-2">+ New Lesson</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <span className="mr-2">Export</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v1a1 1 0 001 1h12a1 1 0 001-1V5a2 2 0 00-2-2H4zm5 6a1 1 0 01-2 0V7a1 1 0 012 0v2zm5 0a1 1 0 01-2 0V7a1 1 0 012 0v2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="relative">
                    <button className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a2 2 0 012-2h8.586l1.293-1.293a1 1 0 111.414 1.414L12.414 9H15a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12 4a1 1 0 01-1 1h-3.586l-.293.293a1 1 0 11-1.414-1.414L11 9.586V7a1 1 0 012 0z" clipRule="evenodd" />
                      </svg>
                      Profile
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};