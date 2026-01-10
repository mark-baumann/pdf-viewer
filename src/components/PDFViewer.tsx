import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.state?.file;
  const fileName = location.state?.name || 'Document';
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (!file) {
      navigate('/');
    }
  }, [file, navigate]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  if (!file) return null;

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="viewer-title">
           {fileName}
        </div>
        <div className="viewer-actions">
           {/* Placeholder for other actions */}
        </div>
      </div>

      <div className="document-wrapper">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="loading">Loading PDF...</div>}
          className="pdf-document"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            className="pdf-page"
          />
        </Document>
      </div>

      <div className="viewer-controls">
        <div className="control-group">
          <button 
            onClick={zoomOut} 
            className="btn-icon"
            title="Zoom Out"
          >
            -
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button 
            onClick={zoomIn} 
            className="btn-icon"
            title="Zoom In"
          >
            +
          </button>
        </div>

        <div className="control-divider"></div>

        <div className="control-group">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={previousPage}
            className="btn-nav"
          >
            ←
          </button>
          <span className="page-info">
            {pageNumber} / {numPages || '--'}
          </span>
          <button
            type="button"
            disabled={pageNumber >= (numPages || 0)}
            onClick={nextPage}
            className="btn-nav"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;