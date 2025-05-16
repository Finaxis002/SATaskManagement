import jsPDF from "jspdf";

export const generateInvoicePDF = ({
  selectedFirm,
  invoiceType,
  invoiceNumber,
  invoiceDate,
  customer,
  items,
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const rowHeight = 8;
  let y = margin;

  // Helper to draw table cell with optional bold and center
  const drawCell = (x, y, w, h, text, align = "left", bold = false) => {
    if (bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    doc.rect(x, y, w, h);
    if (align === "center") {
      doc.text(text, x + w / 2, y + h / 2 + 2, { align: "center" });
    } else {
      doc.text(text, x + 2, y + h / 2 + 2);
    }
  };

  // HEADER (centered)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FINAXIS", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Business Consultancy Pvt. Ltd.", pageWidth / 2, y, { align: "center" });
  y += 8;

  // Table header with GSTIN and Invoice Type side by side
  const colWidth = (pageWidth - 2 * margin) / 2;
  const leftX = margin;
  const rightX = margin + colWidth;

  // Draw top header with GSTIN left, invoice type right
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  drawCell(leftX, y, colWidth, rowHeight, `GSTIN: ${selectedFirm.gstin}`, "center", true);
  drawCell(rightX, y, colWidth, rowHeight, invoiceType, "center", true);
  y += rowHeight;

  // Subheader with Client Details / Company Details
  drawCell(leftX, y, colWidth, rowHeight, "CLIENT DETAILS", "center", true);
  drawCell(rightX, y, colWidth, rowHeight, "COMPANY DETAILS", "center", true);
  y += rowHeight;

  // Client Details keys & values
  const clientDetails = [
    ["Name", customer.name],
    ["Address", customer.address],
    ["GSTIN", customer.gstin],
    ["Place of Supply", "Gujarat"],
  ];

  // Company Details keys & values (No Place of Supply here)
  const companyDetails = [
    ["Name", selectedFirm.name],
    ["Address", selectedFirm.address],
    ["Contact No.", selectedFirm.phone],
    ["Invoice No.", invoiceNumber],
    ["Invoice Date", invoiceDate],
  ];

  // Draw client details on left, company on right
  let maxLines = Math.max(clientDetails.length, companyDetails.length);
  for (let i = 0; i < maxLines; i++) {
    // Left side
    if (i < clientDetails.length) {
      const [key, val] = clientDetails[i];
      drawCell(leftX, y, colWidth, rowHeight, `${key}: ${val}`);
    } else {
      drawCell(leftX, y, colWidth, rowHeight, "");
    }
    // Right side
    if (i < companyDetails.length) {
      const [key, val] = companyDetails[i];
      drawCell(rightX, y, colWidth, rowHeight, `${key}: ${val}`);
    } else {
      drawCell(rightX, y, colWidth, rowHeight, "");
    }
    y += rowHeight;
  }

  // Items Table Header
  const itemCols = ["Sr. No.", "Description of Services", "SAC CODE", "Unit(s)", "Rate", "Amount"];
  const colWidths = [15, 80, 25, 15, 25, 25];
  let x = margin;
  doc.setFont("helvetica", "bold");
  for (let i = 0; i < itemCols.length; i++) {
    drawCell(x, y, colWidths[i], rowHeight, itemCols[i], "center", true);
    x += colWidths[i];
  }
  y += rowHeight;

  // Minimum table height: say 10 rows (including empty rows)
  const minRows = 10;
  const rowsCount = Math.max(items.length, minRows);

  doc.setFont("helvetica", "normal");
  for (let i = 0; i < rowsCount; i++) {
    x = margin;
    if (i < items.length) {
      const item = items[i];
      const amount = item.qty * item.rate;
      const row = [
        String(i + 1),
        item.description,
        item.hsn,
        String(item.qty),
        `₹${item.rate.toFixed(2)}`,
        `₹${amount.toFixed(2)}`,
      ];
      for (let j = 0; j < row.length; j++) {
        drawCell(x, y, colWidths[j], rowHeight, row[j]);
        x += colWidths[j];
      }
    } else {
      // Empty row with borders only
      for (let j = 0; j < itemCols.length; j++) {
        drawCell(x, y, colWidths[j], rowHeight, "");
        x += colWidths[j];
      }
    }
    y += rowHeight;
  }

  // "Total in Rupees" row spanning all columns
  doc.setFont("helvetica", "bold");
  drawCell(margin, y, pageWidth - 2 * margin, rowHeight, "Total in Rupees", "left", true);
  y += rowHeight;

  // Add empty row for spacing
  drawCell(margin, y, pageWidth - 2 * margin, rowHeight, "");
  y += rowHeight;

  // Bottom two-column table
  // Left column width and right column width
  const bottomLeftW = (pageWidth - 2 * margin) * 0.5;
  const bottomRightW = (pageWidth - 2 * margin) * 0.5;
  const bottomRowHeight = rowHeight;

  // Left column text lines
  const leftTexts = [
    "Total Amount in Words:",
    "Rupees Only",
    "Bank Details",
    `Account Name: ${selectedFirm.name}`,
    `Account Number: ${selectedFirm.bank.account}`,
    `Bank Name: ${selectedFirm.bank.name}`,
    `IFSC Code: ${selectedFirm.bank.ifsc}`,
  ];

  // Right column subdivided in two cols (labels and values)
  const rightLabels = [
    "Taxable Value",
    "Add: IGST(18%)",
    "Add: CGST (9%)",
    "Add: SGST (9%)",
    "Total Amount",
  ];

  // Let's assume amounts zero for now (you can pass actual values)
  const rightValues = ["-", "-", "-", "-", "-"];

  // Draw left column (7 rows)
  doc.setFont("helvetica", "normal");
  let leftY = y;
  leftTexts.forEach((text) => {
    drawCell(margin, leftY, bottomLeftW, bottomRowHeight, text);
    leftY += bottomRowHeight;
  });

  // Draw right column subdivided into 2
//   const rightX = margin + bottomLeftW;
  const rightCol1W = bottomRightW * 0.4;
  const rightCol2W = bottomRightW * 0.6;
  let rightY = y;

  rightLabels.forEach((label, idx) => {
    drawCell(rightX, rightY, rightCol1W, bottomRowHeight, label);
    drawCell(rightX + rightCol1W, rightY, rightCol2W, bottomRowHeight, rightValues[idx]);
    rightY += bottomRowHeight;
  });

  // Save PDF
  doc.save("Finaxis_ProformaInvoice.pdf");
};
