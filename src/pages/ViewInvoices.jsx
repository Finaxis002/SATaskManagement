// import React, { useEffect, useState, useRef } from "react";
// import Select from "react-select";
// import axios from "axios";
// import html2pdf from "html2pdf.js";

// export default function ViewInvoices() {
//   const [clients, setClients] = useState([]);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [invoices, setInvoices] = useState([]);

//   const [invoiceToDownload, setInvoiceToDownload] = useState(null);
//   const pdfRef = useRef();

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/clients/details")
//       .then((res) => {
//         console.log("Clients fetched:", res.data); // Log clients fetched
//         setClients(res.data);
//       })
//       .catch(console.error);
//   }, []);

//   const clientOptions = clients.map((client) => ({
//     value: client._id,
//     label: client.name,
//   }));

//   useEffect(() => {
//     if (!selectedClient) {
//       setInvoices([]);
//       return;
//     }
//     axios
//       .get(
//         `http://localhost:5000/api/invoices?clientId=${selectedClient.value}`
//       )
//       .then((res) => {
//         console.log(
//           `Invoices fetched for clientId=${selectedClient.value}:`,
//           res.data
//         ); // Log invoices fetched
//         setInvoices(res.data);
//       })
//       .catch(console.error);
//   }, [selectedClient]);

// //   useEffect(() => {
// //     if (!invoiceToDownload || !pdfRef.current) return;

// //     console.log("Preparing to download invoice PDF for:", invoiceToDownload);

// //     // Increase delay to 500ms or use requestIdleCallback
// //     setTimeout(() => {
// //       const opt = {
// //         margin: 1,
// //         filename: `${invoiceToDownload.invoiceNumber}.pdf`,
// //         image: { type: "jpeg", quality: 0.98 },
// //         html2canvas: { scale: 2 },
// //         jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
// //       };

// //       html2pdf()
// //         .set(opt)
// //         .from(pdfRef.current)
// //         .save()
// //         .then(() => {
// //           setInvoiceToDownload(null);
// //         });
// //     }, 500);
// //   }, [invoiceToDownload]);
// useEffect(() => {
//   if (!invoiceToDownload || !pdfRef.current) return;

//   console.log("Preparing to download invoice PDF for:", invoiceToDownload);

//   const element = pdfRef.current;

//   // Temporarily position the element for rendering
//   element.style.left = "0";

//   const opt = {
//     margin: 1,
//     filename: `${invoiceToDownload.invoiceNumber}.pdf`,
//     image: { type: "jpeg", quality: 0.98 },
//     html2canvas: {
//       scale: 2,
//       logging: true, // Enable logging for debugging
//       useCORS: true,
//       windowWidth: 800 // Match your invoice width
//     },
//     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//   };

//   // Generate PDF
//   html2pdf()
//     .set(opt)
//     .from(element)
//     .save()
//     .then(() => {
//       // Move element back off-screen
//       element.style.left = "100vw";
//       setInvoiceToDownload(null);
//     })
//     .catch(error => {
//       console.error("PDF generation error:", error);
//       element.style.left = "100vw";
//       setInvoiceToDownload(null);
//     });

// }, [invoiceToDownload]);

//   const downloadInvoice = (invoice) => {
//     console.log("Download button clicked for invoice:", invoice);
//     setInvoiceToDownload(invoice);
//   };

//   const InvoicePreview = ({ invoice }) => {
//     if (!invoice) return null;

//     return (
//       <div
//         ref={pdfRef}
//         style={{
//           width: "800px",
//           padding: 20,
//           fontFamily: "'Arial Black', Arial, sans-serif",
//           fontSize: 12,
//           color: "#000",
//           backgroundColor: "#fff",
//           border: "1px solid #000",
//         //   position: "absolute",
//         //   top: "-9999px",
//         //   left: "-9999px",
//         //   visibility: "hidden", // <-- changed from opacity: 0
//         //   pointerEvents: "none",
//         //   overflow: "visible",
//         //   zIndex: -1,
//         }}
//       >
//         <h1>Invoice: {invoice.invoiceNumber}</h1>
//         <p>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>

//         <h2>Client Details</h2>
//         <p>Name: {invoice.customer.name}</p>
//         <p>Address: {invoice.customer.address}</p>
//         <p>GSTIN: {invoice.customer.GSTIN}</p>

//         <h2>Items</h2>
//         <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
//           <thead>
//             <tr>
//               <th>Description</th>
//               <th>HSN</th>
//               <th>Qty</th>
//               <th>Rate</th>
//               <th>Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.items.map((item, idx) => (
//               <tr key={idx}>
//                 <td>{item.description}</td>
//                 <td>{item.hsn || ""}</td>
//                 <td>{item.qty}</td>
//                 <td>₹{item.rate.toFixed(2)}</td>
//                 <td>₹{(item.qty * item.rate).toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <h3>Total Amount: ₹{invoice.totalAmount.toFixed(2)}</h3>
//       </div>
//     );
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>View Invoices</h2>
//       <Select
//         options={clientOptions}
//         onChange={setSelectedClient}
//         placeholder="Select client to filter invoices"
//         isClearable
//       />
//       <table
//         border="1"
//         style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}
//       >
//         <thead>
//           <tr>
//             <th>Invoice Number</th>
//             <th>Invoice Date</th>
//             <th>Client Name</th>
//             <th>Total Amount</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {invoices.length === 0 && (
//             <tr>
//               <td colSpan="5" style={{ textAlign: "center" }}>
//                 No invoices found
//               </td>
//             </tr>
//           )}
//           {invoices.map((inv) => (
//             <tr key={inv.invoiceNumber}>
//               <td>{inv.invoiceNumber}</td>
//               <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
//               <td>{inv.customer.name}</td>
//               <td>₹{inv.totalAmount.toFixed(2)}</td>
//               <td>
//                 <button onClick={() => downloadInvoice(inv)}>
//                   Download PDF
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Render invoice preview hidden for PDF */}
//       <InvoicePreview invoice={invoiceToDownload} />
//     </div>
//   );
// }

///////////////////////////////////////
import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import axios from "axios";
import html2pdf from "html2pdf.js";

export default function ViewInvoices() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);

  useEffect(() => {
    axios
      .get("https://sataskmanagementbackend.onrender.com/api/clients/details")
      .then((res) => {
        console.log("Clients fetched:", res.data);
        setClients(res.data);
      })
      .catch(console.error);
  }, []);

  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: client.name,
  }));

  useEffect(() => {
    if (!selectedClient) {
      setInvoices([]);
      return;
    }
    axios
      .get(
        `https://sataskmanagementbackend.onrender.com/api/invoices?clientId=${selectedClient.value}`
      )
      .then((res) => {
        console.log(
          `Invoices fetched for clientId=${selectedClient.value}:`,
          res.data
        );
        setInvoices(res.data);
      })
      .catch(console.error);
  }, [selectedClient]);

  const downloadInvoice = (invoice) => {
    console.log("Download button clicked for invoice:", invoice);
    setInvoiceToView(invoice);
    setShowInvoiceModal(true);
  };

  //   const handleGeneratePDF = () => {
  //   const element = document.getElementById('invoice-modal-content');
  //   if (!element) return;

  //   // Save original styles to restore later
  //   const originalHeight = element.style.height;
  //   const originalMaxHeight = element.style.maxHeight;
  //   const originalOverflow = element.style.overflow;

  //   // Expand element fully for capture
  //   element.style.height = 'auto';
  //   element.style.maxHeight = 'none';
  //   element.style.overflow = 'visible';

  //   const opt = {
  //     margin: 0,
  //     filename: `${invoiceToView.invoiceNumber}.pdf`,
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: {
  //       scale: 3,
  //       dpi: 300,
  //       letterRendering: true,
  //       useCORS: true,
  //       // Remove width / windowWidth settings so it can detect automatically
  //     },
  //     jsPDF: {
  //       unit: "mm",
  //       format: "a4",
  //       orientation: "portrait"
  //     }
  //   };

  //   html2pdf()
  //     .set(opt)
  //     .from(element)
  //     .save()
  //     .then(() => {
  //       setShowInvoiceModal(false);

  //       // Restore original styles
  //       element.style.height = originalHeight;
  //       element.style.maxHeight = originalMaxHeight;
  //       element.style.overflow = originalOverflow;
  //     })
  //     .catch(error => {
  //       console.error("PDF generation error:", error);
  //       // Restore styles even if error
  //       element.style.height = originalHeight;
  //       element.style.maxHeight = originalMaxHeight;
  //       element.style.overflow = originalOverflow;
  //     });
  // };

  // const handleGeneratePDF = () => {
  //   const element = document.getElementById('invoice-to-print');
  //   if (!element) return;

  //   // Save original styles
  //   const originalHeight = element.style.height;
  //   const originalMaxHeight = element.style.maxHeight;
  //   const originalOverflow = element.style.overflow;
  //   const originalWidth = element.style.width;

  //   // Expand fully for capture
  //   element.style.height = 'auto';
  //   element.style.maxHeight = 'none';
  //   element.style.overflow = 'visible';
  //   element.style.width = '794px'; // A4 width in px at 96dpi

  //   const opt = {
  //     margin: [10, 10, 10, 10], // 10 mm margins on all sides
  //     filename: `${invoiceToView.invoiceNumber}.pdf`,
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: {
  //       scale: 3,
  //       dpi: 300,
  //       letterRendering: true,
  //       useCORS: true,
  //     },
  //     jsPDF: {
  //       unit: "mm",
  //       format: "a4",
  //       orientation: "portrait",
  //     },
  //   };

  //   html2pdf()
  //     .set(opt)
  //     .from(element)
  //     .save()
  //     .then(() => {
  //       setShowInvoiceModal(false);

  //       // Restore styles
  //       element.style.height = originalHeight;
  //       element.style.maxHeight = originalMaxHeight;
  //       element.style.overflow = originalOverflow;
  //       element.style.width = originalWidth;
  //     })
  //     .catch(error => {
  //       console.error("PDF generation error:", error);

  //       // Restore styles even if error
  //       element.style.height = originalHeight;
  //       element.style.maxHeight = originalMaxHeight;
  //       element.style.overflow = originalOverflow;
  //       element.style.width = originalWidth;
  //     });
  // };

  const handleGeneratePDF = () => {
    const element = document.getElementById("invoice-to-print");
    if (!element) return;

    // Save original styles
    const originalHeight = element.style.height;
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    const originalWidth = element.style.width;

    // Expand fully for capture
    element.style.height = "auto";
    element.style.maxHeight = "none";
    element.style.overflow = "visible";
    element.style.width = "794px"; // A4 width in px at 96dpi

    // const opt = {
    //   margin: [10, 10, 10, 10], // 10 mm margins on all sides
    //   filename: `${invoiceToView.invoiceNumber}.pdf`,
    //   image: { type: "jpeg", quality: 0.98 },
    //   html2canvas: {
    //     scale: 3,
    //     dpi: 300,
    //     letterRendering: true,
    //     useCORS: true,
    //     scrollY: -window.scrollY,
    //   },
    //   jsPDF: {
    //     unit: "mm",
    //     format: "a4",
    //     orientation: "portrait",
    //   },
    // };
    const opt = {
      margin: 0,
      filename: `${invoiceToView.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "px",
        format: [794, 1123], // A4 portrait in px
        orientation: "portrait",
      },
    };
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setShowInvoiceModal(false);

        // Restore styles
        element.style.height = originalHeight;
        element.style.maxHeight = originalMaxHeight;
        element.style.overflow = originalOverflow;
        element.style.width = originalWidth;
      })
      .catch((error) => {
        console.error("PDF generation error:", error);

        // Restore styles even if error
        element.style.height = originalHeight;
        element.style.maxHeight = originalMaxHeight;
        element.style.overflow = originalOverflow;
        element.style.width = originalWidth;
      });
  };

  const InvoicePreview = ({ invoice }) => {
    if (!invoice) return null;

    // Calculate amounts like in InvoiceForm
    const totalAmount = invoice.items.reduce(
      (sum, item) => sum + item.qty * item.rate,
      0
    );
    const taxableValue = totalAmount;
    const igstRate = 0.18;
    const cgstRate = 0.09;
    const sgstRate = 0.09;

    const isLocalSupply = () => {
      const place = (invoice.placeOfSupply || "")
        .toLowerCase()
        .replace(/\s+/g, "");
      return place === "mp" || place === "madhyapradesh";
    };

    const igstAmount = isLocalSupply() ? 0 : taxableValue * igstRate;
    const cgstAmount = isLocalSupply() ? taxableValue * cgstRate : 0;
    const sgstAmount = isLocalSupply() ? taxableValue * sgstRate : 0;
    const totalTax = igstAmount + cgstAmount + sgstAmount;
    const totalAmountWithTax = taxableValue + totalTax;

    return (
      <div
        style={{
          width: "730px", // slightly less than PDF printable width
          margin: "0 auto", // center horizontally to avoid shifts
          boxSizing: "border-box",
          padding: 20,
          border: "1px solid #000",
          backgroundColor: "#fff",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: 12,
          color: "#000",
        }}
      >
        {/* Blue top border */}
        <div
          style={{
            borderTop: "20px solid #82C8E5",
            marginTop: "-20px",
          }}
        ></div>

        {/* Company header */}
        <div
          style={{
            paddingBottom: 10,
            marginBottom: 15,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  color: "#1A2B59",
                  lineHeight: 1.1,
                  textAlign: "center",
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                {invoice.selectedFirm?.name || "Company Name"}
              </div>
            </div>
          </div>
        </div>

        {/* Main invoice table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid black",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th
                colSpan={3}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                GSTIN: {invoice.selectedFirm?.gstin || "GSTIN"}
              </th>
              <th
                colSpan={3}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {invoice.invoiceType || "Tax Invoice"}
              </th>
            </tr>

            <tr>
              <th
                colSpan={3}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                CLIENT DETAILS
              </th>
              <th
                colSpan={3}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                COMPANY DETAILS
              </th>
            </tr>

            <tr>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "Bold",
                  width: "15%",
                }}
              >
                Name
              </td>
              <td
                colSpan={2}
                style={{ border: "1px solid black", padding: 6, width: "35%",fontWeight: "Bold", }}
              >
                {invoice.customer.name}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                  width: "15%",
                }}
              >
                Name
              </td>
              <td colSpan={2} style={{ border: "1px solid black", padding: 6 ,fontWeight: "Bold",}}>
                {invoice.selectedFirm?.name || "Company Name"}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                }}
              >
                Address
              </td>
              <td colSpan={2} style={{ border: "1px solid black", padding: 6 ,fontWeight: "Bold",}}>
                {invoice.customer.address}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                }}
              >
                Address
              </td>
              <td colSpan={2} style={{ border: "1px solid black", padding: 6 ,fontWeight: "Bold",}}>
                {invoice.selectedFirm?.address || "Company Address"}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                }}
              >
                GSTIN
              </td>
              <td colSpan={2} style={{ border: "1px solid black", padding: 6 ,fontWeight: "Bold",}}>
                {invoice.customer.GSTIN}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                }}
              >
                Contact No.
              </td>
              <td colSpan={2} style={{ border: "1px solid black", padding: 6 ,fontWeight: "Bold",}}>
                {invoice.selectedFirm?.phone || "Phone Number"}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                }}
              >
                Place of Supply
              </td>
              <td colSpan={2} style={{ border: "1px solid black", padding: 6 ,fontWeight: "Bold",}}>
                {invoice.placeOfSupply || "State"}
              </td>
              <td
                colSpan={3}
                style={{ border: "1px solid black", padding: 0, width: "50%" }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: 6,
                          fontWeight: "bold",
                          width: "50%",
                          borderRight: " 1px solid black",
                          borderBottom: "1px solid black",
                        }}
                      >
                        Invoice No.
                      </td>
                      <td
                        style={{
                          fontWeight: "Bold",
                          padding: 6,
                          width: "50%",
                          borderBottom: "1px solid black",
                        }}
                      >
                        {invoice.invoiceNumber}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: 6,
                          fontWeight: "bold",
                          borderRight: "1px solid black",
                        }}
                      >
                        Invoice Date
                      </td>
                      <td style={{ fontWeight: "Bold",
                          padding: 6,}}>
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th
                style={{
                  border: "1px solid black",
                  padding: 6,
                  width: "5%",
                  fontWeight: "bold",
                }}
              >
                Sr. No.
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: 6,
                  width: "50%",
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Description of Services
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: 6,
                  width: "15%",
                  fontWeight: "bold",
                }}
              >
                SAC CODE
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: 6,
                  width: "10%",
                  fontWeight: "bold",
                }}
              >
                Unit(s)
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: 6,
                  width: "10%",
                  fontWeight: "bold",
                }}
              >
                Rate
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: 6,
                  width: "10%",
                  fontWeight: "bold",
                }}
              >
                Amount
              </th>
            </tr>

            {invoice.items.map((item, idx) => {
              const amount = item.qty * item.rate;
              return (
                <tr key={idx}>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "center",
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td style={{ border: "1px solid black", padding: 6 }}>
                    {item.description}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "center",
                    }}
                  >
                    {item.hsn || "9971"}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "center",
                    }}
                  >
                    {item.qty}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "right",
                    }}
                  >
                    ₹{item.rate.toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "right",
                    }}
                  >
                    ₹{amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}

            {/* Empty rows if needed */}
            {[...Array(Math.max(0, 3 - invoice.items.length))].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td
                  style={{ border: "1px solid black", padding: 6, height: 25 }}
                  colSpan={6}
                />
              </tr>
            ))}

            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                Total in Rupees
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: 6,
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                ₹{totalAmount.toFixed(2)}
              </td>
            </tr>

            {/* Footer section */}
            <tr>
              <td colSpan={3} style={{ border: "1px solid black", padding: 0 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          fontSize: 10,
                        }}
                      >
                        Total Amount in Words
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontSize: 10,
                          fontWeight: "Bold",
                        }}
                      >
                        {numberToWordsIndian(taxableValue)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontWeight: "light",
                          fontSize: 10,
                          fontWeight: "Bold",
                        }}
                      >
                        Bank Details
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: 6, fontSize: 10 }}>
                        Bank Name:{" "}
                        {invoice.selectedFirm?.bank?.name || "Bank Name"} <br />
                        Account Number:{" "}
                        {invoice.selectedFirm?.bank?.account ||
                          "Account Number"}{" "}
                        <br />
                        IFSC Code:{" "}
                        {invoice.selectedFirm?.bank?.ifsc || "IFSC Code"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              <td colSpan={3} style={{ border: "1px solid black", padding: 0 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontSize: 10,
                          textAlign: "right",
                        }}
                      >
                        Taxable Value
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontSize: 10,
                          textAlign: "right",
                        }}
                      >
                        ₹{taxableValue.toFixed(2)}
                      </td>
                    </tr>

                    {isLocalSupply() ? (
                      <>
                        <tr>
                          <td
                            style={{
                              borderBottom: "1px solid black",
                              padding: 6,
                              fontSize: 10,
                              textAlign: "right",
                            }}
                          >
                            Add: CGST (9%)
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid black",
                              padding: 6,
                              fontSize: 10,
                              textAlign: "right",
                            }}
                          >
                            ₹{cgstAmount.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              borderBottom: "1px solid black",
                              padding: 6,
                              fontSize: 10,
                              textAlign: "right",
                            }}
                          >
                            Add: SGST (9%)
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid black",
                              padding: 6,
                              fontSize: 10,
                              textAlign: "right",
                            }}
                          >
                            ₹{sgstAmount.toFixed(2)}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td
                          style={{
                            borderBottom: "1px solid black",
                            padding: 6,
                            fontSize: 10,
                            textAlign: "right",
                          }}
                        >
                          Add: IGST (18%)
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid black",
                            padding: 6,
                            fontSize: 10,
                            textAlign: "right",
                          }}
                        >
                          ₹{igstAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontSize: 10,
                          textAlign: "right",
                        }}
                      >
                        Total Amount
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontSize: 10,
                          textAlign: "right",
                        }}
                      >
                        ₹{totalAmountWithTax.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <p
          style={{
            fontSize: 10,
            marginTop: 10,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          This is a system generated invoice and does not require any signature.
        </p>

        <div
          style={{
            borderTop: "20px solid #82C8E5",
            marginTop: 20,
            paddingTop: 10,
          }}
        ></div>

        <div
          style={{
            borderTop: "20px solid #000",
            marginTop: -10,
            paddingTop: 0,
            textAlign: "center",
          }}
        ></div>
      </div>
    );
  };

  function numberToWordsIndian(num) {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const numberToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " and " + numberToWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          numberToWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + numberToWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          numberToWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + numberToWords(n % 100000) : "")
        );
      return (
        numberToWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + numberToWords(n % 10000000) : "")
      );
    };

    const [rupees, paise] = num.toFixed(2).split(".");
    const rupeeWords = numberToWords(parseInt(rupees));
    const paiseWords =
      paise !== "00" ? ` and ${numberToWords(parseInt(paise))} Paise` : "";
    return rupeeWords + paiseWords + " Rupees Only";
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>View Invoices</h2>
      <Select
        options={clientOptions}
        onChange={setSelectedClient}
        placeholder="Select client to filter invoices"
        isClearable
      />
      <table
        border="1"
        style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px" }}>
              Invoice Number
            </th>
            <th style={{ textAlign: "left", padding: "8px" }}>Invoice Date</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Client Name</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Total Amount</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "8px" }}>
                No invoices found
              </td>
            </tr>
          )}
          {invoices.map((inv) => (
            <tr key={inv.invoiceNumber}>
              <td style={{ textAlign: "left", padding: "8px" }}>
                {inv.invoiceNumber}
              </td>
              <td style={{ textAlign: "left", padding: "8px" }}>
                {new Date(inv.invoiceDate).toLocaleDateString()}
              </td>
              <td style={{ textAlign: "left", padding: "8px" }}>
                {inv.customer.name}
              </td>
              <td style={{ textAlign: "left", padding: "8px" }}>
                ₹{inv.totalAmount.toFixed(2)}
              </td>
              <td>
                <button onClick={() => downloadInvoice(inv)}>
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for PDF preview and generation */}
      {showInvoiceModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >

          <div
            id="invoice-modal-content"
            style={{
              backgroundColor: "white",
              padding: "20px",
              maxHeight: "90vh",
              overflowY: "scroll",
              width: "auto", // ✅ FIXED: No fixed maxWidth
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              id="invoice-to-print"
              style={{
                width: "794px", // ✅ Strict A4 width
                backgroundColor: "#fff",
                padding: "20px",
                boxSizing: "border-box",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontSize: 12,
                color: "#000",
              }}
            >
              <InvoicePreview invoice={invoiceToView} />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleGeneratePDF}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1a73e8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                style={{
                  marginLeft: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
