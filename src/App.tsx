import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentGrid from './components/DocumentGrid';
import PDFViewer from './components/PDFViewer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<DocumentGrid />} />
          <Route path="/view/:id" element={<PDFViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;