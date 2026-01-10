import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.state?.file;
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  
  // 1. Load Zoom from localStorage or default to 1.0
  const [scale, setScale] = useState(() => {
    const savedScale = localStorage.getItem('pdf-viewer-zoom');
    return savedScale ? parseFloat(savedScale) : 1.0;
  });

  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!file) {
      navigate('/');
    }
  }, [file, navigate]);

  // Handle Fullscreen Change Events (Native API)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

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

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const elem = containerRef.current as any;
    const doc = document as any;

    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err: any) => console.log(err));
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
    resetControlsTimer();
  };

  const toggleScrollLock = () => {
    setIsScrollLocked(prev => !prev);
    resetControlsTimer();
  };

  // 3. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') changePage(-1);
      if (e.key === 'ArrowRight') changePage(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changePage]);

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
      ref={containerRef}
      className="viewer-container"
    >
      {/* Header removed as requested */}

      <div 
        className={`document-wrapper ${isScrollLocked ? 'scroll-locked' : ''}`}
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
        {/* Back Button */}
        <button className="btn-icon" onClick={() => navigate('/')} title="Back">
          ←
        </button>

        <div className="control-divider"></div>

        {/* Navigation */}
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

        <div className="control-divider"></div>

        {/* Zoom */}
        <div className="control-group zoom-group">
          <button onClick={zoomOut} className="btn-icon" title="Zoom Out">-</button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="btn-icon" title="Zoom In">+</button>
        </div>

        <div className="control-divider"></div>

        {/* Tools */}
        <div className="control-group">
           <button 
             className={`btn-icon ${isScrollLocked ? 'active-tool' : ''}`}
             onClick={toggleScrollLock}
             title={isScrollLocked ? "Unlock Scroll" : "Lock Scroll"}
           >
             {isScrollLocked ? '🔒' : '🔓'}
           </button>
           <button 
             className="btn-icon"
             onClick={toggleFullscreen}
             title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
             style={{ marginLeft: '8px' }}
           >
             {isFullscreen ? '↙' : '↗'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default PDFViewer;