import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { upload } from '@vercel/blob/client';

interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

const DocumentGrid: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<BlobFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/blobs');
      if (response.ok) {
        const data = await response.json();
        // Filter for PDFs if needed, though list returns all blobs
        setDocuments(data.filter((doc: any) => doc.pathname.endsWith('.pdf')));
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      // Navigate to view it immediately
      navigate(`/view/uploaded`, { state: { file: newBlob.url, name: file.name } });
    } catch (error) {
      console.error('Upload failed:', error);
      const fileUrl = URL.createObjectURL(file);
      navigate(`/view/uploaded`, { state: { file: fileUrl, name: file.name } });
    }
    // No finally/setIsUploading(false) needed because we navigate away
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
      
      {loading ? (
        <div className="loading-state">Loading documents...</div>
      ) : documents.length > 0 ? (
        <div className="grid">
          {documents.map((doc) => (
            <div 
              key={doc.url} 
              className="card"
              onClick={() => navigate(`/view/${encodeURIComponent(doc.pathname)}`, { state: { file: doc.url, name: doc.pathname } })}
            >
              <div className="card-preview">
                <span className="pdf-icon">PDF</span>
              </div>
              <div className="card-info">
                <h3>{doc.pathname}</h3>
                <div className="meta">
                  <span>{formatDate(doc.uploadedAt)}</span>
                  <span>{formatSize(doc.size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h2>No Documents Found</h2>
          <p>Upload a PDF file to get started.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentGrid;
