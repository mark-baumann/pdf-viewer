import React from 'react';
import { useNavigate } from 'react-router-dom';

const DocumentGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      navigate(`/view/uploaded`, { state: { file: fileUrl, name: file.name } });
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>PDF Viewer</h1>
        <div className="upload-section">
          <label className="btn-upload">
            Upload PDF
            <input 
              type="file" 
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </header>
      
      <div className="empty-state">
        <div className="empty-icon">📄</div>
        <h2>No Document Selected</h2>
        <p>Please upload a PDF file to view it.</p>
      </div>
    </div>
  );
};

export default DocumentGrid;