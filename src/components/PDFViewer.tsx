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
  };

  const toggleScrollLock = () => {
    setIsScrollLocked(prev => !prev);
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


  const zoomIn = () => updateScale(scale + 0.1);
  const zoomOut = () => updateScale(scale - 0.1);

  if (!file) return null;

  return (
    <div 
      ref={containerRef}
      className="viewer-container"
    >
      <div className="viewer-controls">
        <div className="toolbar">
          {/* Left: Back */}
          <div className="toolbar-section left">
            <button className="btn-icon" onClick={() => navigate('/')} title="Back">
              ←
            </button>
          </div>

          {/* Center: Navigation & Zoom */}
          <div className="toolbar-section center">
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

            <div className="vertical-divider"></div>

            <div className="control-group">
              <button onClick={zoomOut} className="btn-icon small">-</button>
              <span className="zoom-level">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="btn-icon small">+</button>
            </div>
          </div>

          {/* Right: Tools */}
          <div className="toolbar-section right">
            <button 
               className={`btn-icon tool ${isScrollLocked ? 'active' : ''}`}
               onClick={toggleScrollLock}
               title={isScrollLocked ? 'Unlock Scroll' : 'Lock Scroll'}
             >
               {isScrollLocked ? '🔒' : '🔓'}
             </button>
             
             <button 
               className="btn-icon tool"
               onClick={toggleFullscreen}
               title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
             >
               {isFullscreen ? '↙' : '↗'}
             </button>
          </div>
        </div>
      </div>

      <div 
        className={`document-wrapper ${isScrollLocked ? 'scroll-locked' : ''}`}
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
    </div>
  );
};

export default PDFViewer;
