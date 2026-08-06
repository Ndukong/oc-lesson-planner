import React, { useState } from 'react';

const LessonPlanner = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [objectives, setObjectives] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Lesson plan saved!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lesson Planner</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded">
          Save Lesson Plan
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Physics"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Newton's Laws of Motion"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Learning Objectives (one per line)</label>
          <textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="• Students will be able to explain Newton's three laws of motion..."
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">Activities & Procedures</label>
          <textarea
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the lesson activities, materials needed, and timing..."
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">Assessment & Evaluation</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="How will you assess student understanding? What homework or assignments will be given?"
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">Reflection</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="What worked well? What could be improved for next time?"
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded">
            Save Lesson Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonPlanner;