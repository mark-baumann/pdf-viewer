
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdf from './sample.pdf';

function App() {

  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
  }

  const previousPage = () => {
    setPageNumber(prevPageNumber => prevPageNumber - 1);
  }

  const nextPage = () => {
    setPageNumber(prevPageNumber => prevPageNumber + 1);
  }

  return (
    <div className="app">
      <h4>Display a PDF in React - <a href="https://www.cluemediator.com" target="_blank" rel="noreferrer">Clue Mediator</a></h4>
      <div>
        <Document
          file={pdf}
          onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
        <p>Page {pageNumber} of {totalPages}</p>
      </div>
      <div>
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={previousPage}>
          Previous
        </button>
        <button
          type="button"
          disabled={pageNumber >= totalPages}
          onClick={nextPage}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;