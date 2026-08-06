import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import './App.css';

// Placeholder pages
const Dashboard = () => (
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
  </div>
);

const SyllabusManager = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Syllabus Manager</h1>
    <p className="text-gray-600">Manage your syllabus modules and progression.</p>
  </div>
);

const LessonPlanner = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Lesson Planner</h1>
    <p className="text-gray-600">Create and manage your lesson plans.</p>
  </div>
);

const ProgressionGrid = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Progression Grid</h1>
    <p className="text-gray-600">View and manage your progression sheets.</p>
  </div>
);

const AIGenerator = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">AI Generator</h1>
    <p className="text-gray-600">Generate lesson plans with AI assistance.</p>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p className="text-gray-600">Configure your preferences and settings.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/syllabus" element={<SyllabusManager />} />
            <Route path="/lesson-planner" element={<LessonPlanner />} />
            <Route path="/progression" element={<ProgressionGrid />} />
            <Route path="/ai-generator" element={<AIGenerator />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainLayout>
      </div>
    </BrowserRouter>
  );
}

export default App;