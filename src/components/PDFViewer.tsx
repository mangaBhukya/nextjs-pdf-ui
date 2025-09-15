"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log('entries----', entries);
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          console.log('visible--------------', visible)

        if (visible[0]) {
          const page = Number(visible[0].target.getAttribute("data-page"));
          setPageNumber(page);
          setInputValue(String(page));
          console.log('page---', page);
        }
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    const pages = containerRef.current?.querySelectorAll(".pdf-page");
    pages?.forEach((page) => observer.observe(page));

    return () => observer.disconnect();
  }, [numPages]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const inputHandler = (pageNo: number) => {
    if (pageNo >= 1 && pageNo <= numPages) {
      setPageNumber(pageNo);
      setPageNumber(pageNo);
      setInputValue(pageNo.toString());
      const pageElement = containerRef.current?.querySelector(
        `[data-page="${pageNo}"]`
      );
      pageElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setInputValue(pageNumber.toString());
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = "/sample-flyer.pdf";
    link.download = "sample-flyer.pdf";
    link.click();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 left-0 right-0 bg-white p-2 shadow-md flex items-center gap-2 z-10">
        <span>
          Page {pageNumber} of {numPages}
        </span>
        <input
          type="number"
          min={1}
          max={numPages}
          className="border p-1 w-16"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputHandler(Number(inputValue));
            }
          }}
          onBlur={() => inputHandler(Number(inputValue))}
        />
        {/* Zoom controls */}
        <div className="ml-4 flex gap-2">
          <button
            onClick={zoomOut}
            className="bg-gray-500 text-white px-2 py-1 rounded"
          >
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="bg-gray-500 text-white px-2 py-1 rounded"
          >
            +
          </button>
          <button
            onClick={resetZoom}
            className="bg-gray-500 text-white px-2 py-1 rounded"
          >
            Reset
          </button>
        </div>

        <button
          onClick={downloadPDF}
          className="ml-auto bg-blue-500 text-white px-3 py-1 rounded"
        >
          Download PDF
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll p-4 border"
      >
        <Document
          file="/sample-flyer.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {Array.from(new Array(numPages), (_, index) => {
            const pageNo = index + 1;
            return (
              <div
                key={pageNo}
                data-page={pageNo}
                className="pdf-page flex justify-center my-4"
              >
                <Page
                  pageNumber={pageNo}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
}
