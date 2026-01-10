import React from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data to simulate a library
// In a real app, this would come from an API or file system
const documents = [
  { id: '1', title: 'Project Specification', date: '2023-10-24', size: '2.4 MB' },
  { id: '2', title: 'Q4 Financial Report', date: '2023-11-01', size: '1.1 MB' },
  { id: '3', title: 'Design Guidelines', date: '2023-09-15', size: '5.6 MB' },
  { id: '4', title: 'User Manual v2.0', date: '2023-12-10', size: '3.2 MB' },
  { id: '5', title: 'Meeting Notes', date: '2024-01-05', size: '0.5 MB' },
  { id: '6', title: 'Contract Draft', date: '2024-01-08', size: '0.8 MB' },
];

const DocumentGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <header className="header">
        <h1>My Documents</h1>
        <p className="subtitle">{documents.length} files available</p>
      </header>
      
      <div className="grid">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="card"
            onClick={() => navigate(`/view/${doc.id}`)}
          >
            <div className="card-preview">
              <span className="pdf-icon">PDF</span>
            </div>
            <div className="card-info">
              <h3>{doc.title}</h3>
              <div className="meta">
                <span>{doc.date}</span>
                <span>{doc.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentGrid;
