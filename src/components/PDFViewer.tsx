import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import samplePdf from '../sample.pdf';

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer: React.FC = () => {
  const navigate = useNavigate();
  // In a real app, we would use the ID to fetch the specific PDF
  // const { id } = useParams(); 
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

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

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back to Documents
        </button>
        <div className="viewer-title">
           Project Specification
        </div>
        <div className="viewer-actions">
           {/* Placeholder for other actions */}
        </div>
      </div>

      <div className="document-wrapper">
        <Document
          file={samplePdf}
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
            Previous
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
