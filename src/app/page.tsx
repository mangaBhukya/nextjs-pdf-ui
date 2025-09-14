"use client";

import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Home() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    console.log("numPages---", numPages);
  }

  const inputHandler = (pageNo: number) => {
    if (pageNo >= 1 && pageNo <= numPages) {
      setPageNumber(pageNo);
      const pageElement = containerRef.current?.querySelector(
        `[data-page="${pageNo}"]`
      );
      pageElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <>
      <p>
        Page {pageNumber} of {numPages}
      </p>
      <div className="relative">
        <input
          className="absolute top-[150px] border p-1"
          value={pageNumber}
          onChange={(e) => setPageNumber(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputHandler(Number(pageNumber));
            }
          }}
          onBlur={() => inputHandler(Number(pageNumber))}
        />
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-scroll p-4 border">
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
                <Page pageNumber={pageNo} />
              </div>
            );
          })}
        </Document>
      </div>
    </>
  );
}
