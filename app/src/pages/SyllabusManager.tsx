import React from 'react';

const SyllabusManager = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Syllabus Manager</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded">
          Add Module
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Sample syllabus modules */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">Form 1 - Mechanics</h3>
              <p className="text-sm text-gray-500">Duration: 4 weeks • 8 periods/week</p>
            </div>
            <div className="flex space-x-2">
              <button className="text-xs text-indigo-600 hover:text-indigo-800">View</button>
              <button className="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
              <button className="text-xs text-red-600 hover:text-red-800">Delete</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">Form 2 - Waves</h3>
              <p className="text-sm text-gray-500">Duration: 3 weeks • 6 periods/week</p>
            </div>
            <div className="flex space-x-2">
              <button className="text-xs text-indigo-600 hover:text-indigo-800">View</button>
              <button className="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
              <button className="text-xs text-red-600 hover:text-red-800">Delete</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">Form 3 - Electricity</h3>
              <p className="text-sm text-gray-500">Duration: 5 weeks • 6 periods/week</p>
            </div>
            <div className="flex space-x-2">
              <button className="text-xs text-indigo-600 hover:text-indigo-800">View</button>
              <button className="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
              <button className="text-xs text-red-600 hover:text-red-800">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusManager;