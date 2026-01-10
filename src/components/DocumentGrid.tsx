import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { upload } from '@vercel/blob/client';

const DocumentGrid: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Attempt to upload to Vercel Blob
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      navigate(`/view/uploaded`, { state: { file: newBlob.url, name: file.name } });
    } catch (error) {
      console.error('Upload failed:', error);
      // Fallback to local object URL if upload fails (e.g. running locally without env vars)
      const fileUrl = URL.createObjectURL(file);
      navigate(`/view/uploaded`, { state: { file: fileUrl, name: file.name } });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>PDF Viewer</h1>
        <div className="upload-section">
          <label className={`btn-upload ${isUploading ? 'disabled' : ''}`}>
            {isUploading ? 'Uploading...' : 'Upload PDF'}
            <input 
              type="file" 
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
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
