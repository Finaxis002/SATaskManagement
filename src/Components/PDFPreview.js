// components/PDFPreview.js
import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDFPreview = ({ url }) => {
  return (
    <div className="w-40 h-52 overflow-hidden border rounded shadow-sm">
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.13.216/build/pdf.worker.min.js`}>
        <Viewer fileUrl={url} defaultScale={1.5} />
      </Worker>
    </div>
  );
};

export default PDFPreview;
