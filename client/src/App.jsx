import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import ReviewPage from './components/ReviewPage';
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/review/:clientId" element={<ReviewPage />} />
      {/* Default route */}
      <Route path="/" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;