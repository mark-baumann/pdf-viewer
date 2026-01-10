import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // 1. Load Zoom from localStorage or default to 1.0
  const [scale, setScale] = useState(() => {
    const savedScale = localStorage.getItem('pdf-viewer-zoom');
    return savedScale ? parseFloat(savedScale) : 1.0;
  });

  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!file) {
      navigate('/');
    }
  }, [file, navigate]);

  // Helper to save zoom
  const updateScale = (newScale: number) => {
    const clamped = Math.min(Math.max(newScale, 0.5), 3.0);
    setScale(clamped);
    localStorage.setItem('pdf-viewer-zoom', clamped.toString());
    resetControlsTimer();
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = useCallback((offset: number) => {
    setPageNumber(prev => {
      const newPage = prev + offset;
      if (numPages && (newPage < 1 || newPage > numPages)) return prev;
      return newPage;
    });
    resetControlsTimer();
  }, [numPages]);

  // 3. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') changePage(-1);
      if (e.key === 'ArrowRight') changePage(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changePage]);

  // 3. Swipe Navigation Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    // Swipe Threshold: 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        changePage(1); // Swipe Left -> Next Page
      } else {
        changePage(-1); // Swipe Right -> Prev Page
      }
    }
    touchStartRef.current = null;
  };

  // 2. Auto-hide Controls Logic
  const showControls = () => {
    setControlsVisible(true);
    resetControlsTimer();
  };

  const hideControls = () => {
    setControlsVisible(false);
  };

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Auto-hide after 3 seconds of inactivity
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const toggleControls = () => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  };

  // Setup initial timer on mount
  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);


  const zoomIn = () => updateScale(scale + 0.1);
  const zoomOut = () => updateScale(scale - 0.1);

  if (!file) return null;

  return (
    <div 
      className="viewer-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`viewer-header ${controlsVisible ? 'visible' : 'hidden'}`}>
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="viewer-title">
           {fileName}
        </div>
        <div className="viewer-actions"></div>
      </div>

      <div 
        className="document-wrapper" 
        onClick={toggleControls}
      >
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

      <div 
        className={`viewer-controls ${controlsVisible ? 'visible' : 'hidden'}`}
        // Stop clicks on controls from toggling visibility
        onClick={(e) => { e.stopPropagation(); resetControlsTimer(); }}
      >
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
            onClick={() => changePage(-1)}
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
            onClick={() => changePage(1)}
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
