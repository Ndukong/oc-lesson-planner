import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`${className} bg-white border-r border-gray-200 flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
            <span className="text-xl">LP</span>
          </div>
          <h2 className={`text-xl font-bold text-gray-800 ${isCollapsed ? 'hidden' : 'block'}`}>
            Lesson Planner
          </h2>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav className="mt-6 space-y-1">
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `
            flex items-center px-4 py-2 text-sm font-medium 
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
            rounded-lg ${isCollapsed ? 'justify-center' : ''}
          `}
          activeClassName="bg-indigo-50 text-indigo-600"
        >
          <svg className={`h-5 w-5 mr-3 ${isCollapsed ? 'hidden' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4zm1-4a1 1 0 10-2 0v4a1 1 0 102 0V9zm5-5a1 1 0 00-1 1v2a1 1 0 102 0V6a1 1 0 00-1-1zM7 8a1 1 0 01-2 0v6a1 1 0 112 0V8zm5-4a1 1 0 00-1 1v2a1 1 0 102 0V4a1 1 0 00-1-1zm4 4a1 1 0 01-2 0v2a1 1 0 112 0v-2z" clipRule="evenodd" />
          </svg>
          <span className={`${isCollapsed ? 'hidden' : 'block'`}>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/syllabus" 
          className={({ isActive }) => `
            flex items-center px-4 py-2 text-sm font-medium 
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
            rounded-lg ${isCollapsed ? 'justify-center' : ''}
          `}
          activeClassName="bg-indigo-50 text-indigo-600"
        >
          <svg className={`h-5 w-5 mr-3 ${isCollapsed ? 'hidden' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2v4a2 2 0 002-2v-2a2 2 0 012-2V6a2 2 0 012-2v-2a2 2 0 00-2-2H4zm2 6a2 2 0 01-2 2 2 2 0 01-2-2V8a2 2 0 012-2 2 2 0 012 2v2zm6-4a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2 2 2 0 012 2v2zm4 4a2 2 0 01-2 2 2 2 0 01-2-2v-2a2 2 0 012-2 2 2 0 012 2v2z" clipRule="evenodd" />
          </svg>
          <span className={`${isCollapsed ? 'hidden' : 'block'`}>Syllabus</span>
        </NavLink>

        <NavLink 
          to="/lesson-planner" 
          className={({ isActive }) => `
            flex items-center px-4 py-2 text-sm font-medium 
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
            rounded-lg ${isCollapsed ? 'justify-center' : ''}
          `}
          activeClassName="bg-indigo-50 text-indigo-600"
        >
          <svg className={`h-5 w-5 mr-3 ${isCollapsed ? 'hidden' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v1a1 1 0 100 2V4a1 1 0 001-1h2a1 1 0 001 1v1a2 2 0 002 2v4a2 2 0 012 2v1a2 2 0 100-4v-1a2 2 0 00-2-2V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1a2 2 0 00-2 2v1a1 1 0 100-2zm3 1a1 1 0 100 2h1a1 1 0 100-2H9zm10-1a2 2 0 012 2v1a2 2 0 11-4 0V3a1 1 0 100-2h1a1 1 0 010 2v2a2 2 0 01-2-2 2 2 0 012-2z" clipRule="evenodd" />
          </svg>
          <span className={`${isCollapsed ? 'hidden' : 'block'`}>Lesson Planner</span>
        </NavLink>

        <NavLink 
          to="/progression" 
          className={({ isActive }) => `
            flex items-center px-4 py-2 text-sm font-medium 
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
            rounded-lg ${isCollapsed ? 'justify-center' : ''}
          `}
          activeClassName="bg-indigo-50 text-indigo-600"
        >
          <svg className={`h-5 w-5 mr-3 ${isCollapsed ? 'hidden' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2v4a2 2 0 002-2v-2a2 2 0 012-2V6a2 2 0 012-2v-2a2 2 0 00-2-2H4zm2 6a2 2 0 01-2 2 2 2 0 01-2-2V8a2 2 0 012-2 2 2 0 012 2v2zm6-4a2 2 0 01-2 2 2 2 0 012-2v2a2 2 0 01-2 2zm4 4a2 2 0 01-2 2 2 2 0 01-2-2v-2a2 2 0 012-2 2 2 0 012 2v2z" clipRule="evenodd" />
          </svg>
          <span className={`${isCollapsed ? 'hidden' : 'block'`}>Progression</span>
        </NavLink>

        <NavLink 
          to="/ai-generator" 
          className={({ isActive }) => `
            flex items-center px-4 py-2 text-sm font-medium 
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
            rounded-lg ${isCollapsed ? 'justify-center' : ''}
          `}
          activeClassName="bg-indigo-50 text-indigo-600"
        >
          <svg className={`h-5 w-5 mr-3 ${isCollapsed ? 'hidden' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 9.5a.5.5 0 01-.5.5h-3.79a1 1 0 00-.89.42l-.8 1A1 1 0 0011 13h2a1 1 0 001-1v-3.5a1 1 0 00-.29-.71l-1.22-.61A1 1 0 009 8.5V6a1 1 0 011-1h3.5a1 1 0 011 1v2.5a1 1 0 00.29.71l1.22.61a1 1 0 00.71.29zM9 17a2 2 0 100-4 2 2 0 000 4zm6-6a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className={`${isCollapsed ? 'hidden' : 'block'`}>AI Generator</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `
            flex items-center px-4 py-2 text-sm font-medium 
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
            rounded-lg ${isCollapsed ? 'justify-center' : ''}
          `}
          activeClassName="bg-indigo-50 text-indigo-600"
        >
          <svg className={`h-5 w-5 mr-3 ${isCollapsed ? 'hidden' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.828V13a1 1 0 01-2 0V5.828l-2.293 2.293a1 1 0 01-1.414-1.414l6-6a1 1 0 010-1.414zM2 9a2 2 0 000 4h16a2 2 0 000-4H2z" clipRule="evenodd" />
          </svg>
          <span className={`${isCollapsed ? 'hidden' : 'block'`}>Settings</span>
        </NavLink>
      </nav>

      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-flex items-center justify-center">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className={`font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Teacher Name</h3>
            <p className={`text-sm text-gray-500 ${isCollapsed ? 'hidden' : 'block'}`}>Secondary School</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const SidebarContent: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <Sidebar />
    </div>
  );
};