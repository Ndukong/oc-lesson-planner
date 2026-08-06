import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Today's Schedule</h3>
          <p className="text-gray-600">No classes scheduled</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Upcoming Evaluations</h3>
          <p className="text-gray-600">None scheduled</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Lesson Completion</h3>
          <p className="text-gray-600">85% of lessons planned</p>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button className="bg-white rounded-lg shadow hover:bg-indigo-50 p-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 9.586V7a1 1 0 00-2 0v2.586l-.293-.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Create Lesson Plan</h3>
                <p className="text-sm text-gray-500">Start planning your next lesson</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white rounded-lg shadow hover:bg-indigo-50 p-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2v4a2 2 0 002-2v-2a2 2 0 012-2V6a2 2 0 012-2v-2a2 2 0 00-2-2H4zm2 6a2 2 0 01-2 2 2 2 0 01-2-2V8a2 2 0 012-2 2 2 0 012 2v2zm6-4a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2 2 2 0 012 2v2zm4 4a2 2 0 01-2 2 2 2 0 01-2-2v-2a2 2 0 012-2 2 2 0 012 2v2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">View Syllabus</h3>
                <p className="text-sm text-gray-500">Browse curriculum modules</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white rounded-lg shadow hover:bg-indigo-50 p-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">AI Assistant</h3>
                <p className="text-sm text-gray-500">Get help with lesson planning</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;