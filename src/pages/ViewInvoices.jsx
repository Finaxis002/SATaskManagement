import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
// import axios from "axios";
import axios from '../utils/secureAxios'
import html2pdf from "html2pdf.js";
import Swal from "sweetalert2";
import InvoicePreview from "../Components/InvoicePreview";
import { FaTrash } from "react-icons/fa";
export default function ViewInvoices() {
   const [firms] = useState([
    { name: "Finaxis Business Consultancy", gstin: "GST5454" },
    { name: "Sharda Associates", gstin: "GST9876" },
    { name : "Kailash Real Estate", gstin: "GST9855"},
    { name : "Bhojpal Realities", gstin: "GST9878"}
  ]);
  console.log("ViewInvoices component rendered");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filterByFirm, setFilterByFirm] = useState([])
  
   const [selectedFirm, setSelectedFirm] = useState(null); 
   const [dateError, setDateError] = useState('');


 
  useEffect(() => {
    axios
      .get("/clients/details")
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
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching initial data...");

        // Fetch clients
        const clientsRes = await axios.get(
          "/clients/details"
        );
        console.log("Clients fetched:", clientsRes.data);
        setClients(clientsRes.data);

        // Fetch all invoices
        const invoicesRes = await axios.get(
          "/invoices"
        );
        console.log("All invoices fetched:", invoicesRes.data);
        
        const sortedInvoices = [...(invoicesRes.data || [])].sort(
          (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
        );
        console.log("Sorted invoices:", sortedInvoices);
        setInvoices(sortedInvoices);
         setFilteredInvoices(sortedInvoices);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch filtered invoices when client is selected
  // useEffect(() => {
  //    console.log("useEffect called. selectedClient:", selectedClient);
  //   if (!selectedClient) return; // do nothing if no client

  //   const fetchInvoicesByClient = async () => {
  //     try {
  //       console.log("Fetching invoices for client:", selectedClient);
  //       const res = await axios.get(
  //         `http://localhost:5000/api/invoices?clientId=${selectedClient.value}`
  //       );
  //       const filteredInvoices = res.data || [];
  //       const sortedInvoices = [...filteredInvoices].sort(
  //         (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
  //       );
  //       setInvoices(sortedInvoices);
  //     } catch (error) {
  //       console.error("Error fetching invoices for client:", error);
  //       setInvoices([]);
  //     }
  //   };
  //   fetchInvoicesByClient();
  // }, [selectedClient]);

  useEffect(() => {
    console.log("Selected client changed:", selectedClient);

    if (!selectedClient) {
      // When no client is selected, fetch all invoices again
      const fetchAllInvoices = async () => {
        try {
          console.log("Fetching all invoices...");
          const res = await axios.get(
            "/invoices"
          );
          const sortedInvoices = [...(res.data || [])].sort(
            (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
          );
          setInvoices(sortedInvoices);
        } catch (error) {
          console.error("Error fetching all invoices:", error);
          setInvoices([]);
        }
      };
      fetchAllInvoices();
      return;
    }

    // Rest of your client filtering logic...
    const fetchInvoicesByClient = async () => {
      try {
        console.log("Fetching invoices for client:", selectedClient);
        const res = await axios.get(
          `/invoices?clientId=${selectedClient.value}`
        );
        const filteredInvoices = res.data || [];
        const sortedInvoices = [...filteredInvoices].sort(
          (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
        );
        setInvoices(sortedInvoices);
      } catch (error) {
        console.error("Error fetching invoices for client:", error);
        setInvoices([]);
      }
    };
    fetchInvoicesByClient();
  }, [selectedClient]);

  useEffect(() => {
    if (!fromDate && !toDate) {
      setFilteredInvoices(invoices);
      return;
    }

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = invoices.filter((invoice) => {
      const invDate = new Date(invoice.invoiceDate);
      if (from && invDate < from) return false;
      if (to && invDate > to) return false;
      return true;
    });

    setFilteredInvoices(filtered);
  }, [fromDate, toDate, invoices]);

  const downloadInvoice = (invoice) => {
    console.log("Download button clicked for invoice:", invoice);
    setInvoiceToView(invoice);
    setShowInvoiceModal(true);
  };


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

  // delete invoice
  const handleDeleteInvoice = async (invoiceNumber) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete invoice ${invoiceNumber}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `/invoices/${invoiceNumber}`
        );
        setInvoices((prev) =>
          prev.filter((inv) => inv.invoiceNumber !== invoiceNumber)
        );
        Swal.fire("Deleted!", "Invoice has been deleted.", "success");
      } catch (error) {
        console.error("Failed to delete invoice", error);
        Swal.fire("Error", "Failed to delete invoice.", "error");
      }
    }
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

  // Firm options for the dropdown
  const firmOptions = firms.map((firm) => ({
    value: firm.name,
    label: firm.name,
  }));

  // Filter invoices when firm is selected
  useEffect(() => {
    if (!selectedFirm) {
      setFilteredInvoices(invoices); // No firm selected, show all invoices
      return;
    }

    const filtered = invoices.filter(
      (invoice) => invoice.selectedFirm.name === selectedFirm.value
    );
    setFilteredInvoices(filtered);
  }, [selectedFirm, invoices]);

  const handleFromDateChange = (e) => {
  const newFromDate = e.target.value;
  setFromDate(newFromDate);
  setDateError('');
  
  if (toDate && new Date(toDate) < new Date(newFromDate)) {
    setToDate('');
    setDateError('To Date was reset to ensure it comes after From Date');
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>View Invoices</h2>
      {/* <Select
        options={clientOptions}
        onChange={setSelectedClient}
        placeholder="Select client to filter invoices"
        isClearable
      />

       <Select
        options={firmOptions}
        onChange={setSelectedFirm}
        placeholder="Select firm to filter invoices"
        isClearable
      />

      <div className="flex flex-wrap items-center gap-6 mt-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div> */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <Select
                options={clientOptions}
                onChange={setSelectedClient}
                placeholder="All Clients"
                isClearable
                className="text-sm"
              />
            </div>

            {/* Firm Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Firm
              </label>
              <Select
                options={firmOptions}
                onChange={setSelectedFirm}
                placeholder="All Firms"
                isClearable
                className="text-sm"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

      <div
        style={{
          maxHeight: "500px", // Adjust height as needed
          overflowY: "auto",
          marginTop: "10px",
        }}
      >
        {isLoading ? (
          <div className="space-y-4 mt-6">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="animate-pulse flex space-x-6">
        <div className="rounded bg-gray-200 h-10 w-32"></div>
        <div className="rounded bg-gray-200 h-10 w-32"></div>
        <div className="rounded bg-gray-200 h-10 w-40"></div>
        <div className="rounded bg-gray-200 h-10 w-28"></div>
        <div className="rounded bg-gray-200 h-10 w-40"></div>
      </div>
    ))}
  </div>
        ) : (
          <table
            border="1"
            className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-6"
          >
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left border-b border-gray-300">
                  Invoice Number
                </th>
                <th className="py-3 px-4 text-left border-b border-gray-300">
                  Invoice Date
                </th>
                <th className="py-3 px-4 text-left border-b border-gray-300">
                  Client Name
                </th>
                <th className="py-3 px-4 text-left border-b border-gray-300">
                  Total Amount
                </th>
                <th className="py-3 px-4 text-left border-b border-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.invoiceNumber}
                  className="bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 border-b border-gray-200">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">
                    {new Date(inv.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">
                    {inv.customer.name}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">
                    ₹{Number(inv.totalAmount).toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() => downloadInvoice(inv)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(inv.invoiceNumber)}
                      className=" bg-[#f5a8a8] hover:bg-red-600 text-black px-3 py-1 rounded-md text-sm font-medium transition ml-10"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal for PDF preview and generation */}
      {showInvoiceModal && invoiceToView && (
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
              // padding: "20px",
              maxHeight: "90vh",
              overflowY: "scroll",
              width: "auto", // ✅ FIXED: No fixed maxWidth
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
               paddingBottom:"20px"
                
            }}
          >
            <div
              id="invoice-to-print"
              style={{
                width: "794px", // ✅ Strict A4 width
                backgroundColor: "#fff",
                // padding: "20px",
                boxSizing: "border-box",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontSize: 12,
                color: "#000",
               
              }}
            >
              {/* <InvoicePreview invoice={invoiceToView} /> */}
              <InvoicePreview
                selectedFirm={invoiceToView.selectedFirm}
                invoiceType={invoiceToView.invoiceType}
                invoiceNumber={invoiceToView.invoiceNumber}
                invoiceDate={invoiceToView.invoiceDate}
                placeOfSupply={invoiceToView.placeOfSupply}
                customer={invoiceToView.customer}
                items={invoiceToView.items}
              />
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
