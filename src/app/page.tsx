"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("../components/PDFViewer"), {
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <PDFViewer />
    </div>
  );
}
