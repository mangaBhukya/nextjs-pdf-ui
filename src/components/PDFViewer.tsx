"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Download, RefreshCcw, ZoomIn, ZoomOut, FileText } from "lucide-react";
import Button from "./Button";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const handleResize = () => {
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    setScale((prev) => {
      if (mobile && prev > 0.7) return 0.7;
      if (!mobile && prev < 1.0) return 1.0;
      return prev;
    });
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          const page = Number(visible[0].target.getAttribute("data-page"));
          setPageNumber(page);
          setInputValue(String(page));
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

  const pdfFile = "/sample-flyer.pdf";
  const pdfName =
    pdfFile
      .split("/")
      .pop()
      ?.replace(/\.pdf$/i, "") || "";

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 left-0 right-0 bg-[#3c3c3c] p-2 shadow-md flex items-center gap-2 z-10 text-white hidden sm:flex">
        <FileText className="w-5 h-5 text-red-600 ml-5 text-white" />
        <span className="font-medium ml-1">{pdfName}</span>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <span>Page</span>
          <input
            type="number"
            min={1}
            max={numPages}
            className="bg-black p-1 w-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputHandler(Number(inputValue));
              }
            }}
            onBlur={() => inputHandler(Number(inputValue))}
          />
          <span>/ {numPages}</span>
          <div className="ml-4 flex gap-2">
            <div className="w-px h-6 bg-gray-300"></div>

            <Button onClick={zoomOut} title="Zoom Out">
              <ZoomOut className="w-5 h-5" />
            </Button>

            <span className="bg-black p-1 w-16">
              {Math.round(scale * 100)}%
            </span>

            <Button onClick={zoomIn} title="Zoom In">
              <ZoomIn className="w-5 h-5" />
            </Button>

            <Button onClick={resetZoom} title="Reset Zoom">
              <RefreshCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Button
          onClick={downloadPDF}
          className="ml-auto mr-10"
          title="Download PDF"
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll p-4 border bg-[#28292a]"
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

        <div className="fixed right-2 top-1/2 transform -translate-y-1/2 bg-[#3c3c3c] text-white px-2 py-1 rounded text-xs sm:hidden">
          {pageNumber} / {numPages}
        </div>
      </div>
    </div>
  );
}
