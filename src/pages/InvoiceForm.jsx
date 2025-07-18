import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import "../css/InvoiceForm.css";
import axios from '../utils/secureAxios';
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import InvoicePage from "../Components/invoice/InvoicePage";
const ITEMS_PER_PAGE = 8;
const firms = [
  {
    name: "Finaxis Business Consultancy",
    subtitle: "Business Consultancy",
    gstin: "GST5454",
    address: "Vidhya Nagar, Bhopal",
    email: "finaxis@gmail.com",
    phone: "25666566",
    bank: {
      name: "HDFC",
      accountName: "Anugrah Sharda",
      account: "45555415656",
      ifsc: "HDFC4555",
    },
  },
  {
    name: "Sharda Associates",
    subtitle: "Associates",
    gstin: "GST9876",
    address: "Indrapuri, Bhopal",
    email: "sharda@gmail.com",
    phone: "7894561230",
    bank: {
      name: "SBI",
      accountName: " Anunay Sharda",
      account: "1234567890",
      ifsc: "SBIN0001234",
    },
  },
  {
    name: "Kailash Real Estate",
    subtitle: "Real Estate",
    gstin: "GST1122",
    address: "MP Nagar, Bhopal",
    email: "kailashre@gmail.com",
    phone: "7569341285",
    bank: { name: "ICICI", account: "0987654321", ifsc: "ICIC0005678" },
  },
  {
    name: "Bhojpal Realities",
    subtitle: "Realities",
    gstin: "GST3344",
    address: "Arera Colony, Bhopal",
    email: "bhojpalr@gmail.com",
    phone: "8652349871",
    bank: { name: "Axis", account: "111222333", ifsc: "UTIB0000123" },
  },
];

const invoiceTypes = ["Proforma Invoice", "Tax Invoice", "Invoice"];

// const generateInvoiceNumber = () => {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let id = "FN";
//   for (let i = 0; i < 6; i++) {
//     id += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return id;
// };

export default function InvoiceForm() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedFirm, setSelectedFirm] = useState(firms[0]);
  const [invoiceType, setInvoiceType] = useState(invoiceTypes[0]);
  const [isFinalized, setIsFinalized] = useState(false);

  // Preview invoice number - does not change DB
  const previewInvoiceNumber = async () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    try {
      const res = await axios.get(
        "/invoices/preview-serial",
        {
          params: {
            firm: selectedFirm.name,
            type: invoiceType,
            year,
            month,
          },
        }
      );
      setInvoiceNumber(res.data.invoiceNumber);
    } catch (error) {
      console.error("Error previewing invoice number", error);
    }
  };

  // Finalize invoice number - increments DB (call only when saving)
  const finalizeInvoiceNumber = async () => {
    if (isFinalized && invoiceNumber) return invoiceNumber;
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    try {
      const res = await axios.post(
        "/invoices/finalize-serial",
        {
          firm: selectedFirm.name,
          type: invoiceType,
          year,
          month,
        }
      );
      setInvoiceNumber(res.data.invoiceNumber);
      setIsFinalized(true);
      return res.data.invoiceNumber;
    } catch (error) {
      console.error("Error finalizing invoice number", error);
      throw error;
    }
  };

  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [placeOfSupply, setPlaceOfSupply] = useState("Gujarat");
  const isLocalSupply = () => {
    const place = placeOfSupply.toLowerCase().replace(/\s+/g, "");
    return place === "mp" || place === "madhyapradesh";
  };
  const [customer, setCustomer] = useState({
    __id: "",
    name: "",
    address: "",
    GSTIN: "",
    mobile: "",
    emailId: "",
  });
  const [clients, setClients] = useState([]);
  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: `${client.name}${
      client.businessName ? ` (${client.businessName})` : ""
    }`,
  }));

  const [items, setItems] = useState([
    {
      id: uuidv4(),
      description: "Project Report",
      hsn: "9971",
      qty: 1,
      rate: 1000,
      gst: 0,
    },
  ]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [imagesReady, setImagesReady] = useState(false);

  const invoiceRef = useRef();
  const isSharda = selectedFirm.name === "Sharda Associates";

  const offsetPage1 = 0;
  const offsetPage2 = ITEMS_PER_PAGE;

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        console.log("Fetching clients..."); // Debug log
        const response = await axios.get(
          "/clients/details"
        );
        console.log("Clients fetched:", response.data); // Debug log
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        // Add error state if needed
      }
    };

    fetchClients();
  }, []);

  const [selectedClientOption, setSelectedClientOption] = useState(null);

  useEffect(() => {
    if (!selectedClientOption) {
      setCustomer({
        _id: "",
        name: "",
        address: "",
        GSTIN: "",
        mobile: "",
        emailId: "",
      });
      setItems([]);
      return;
    }

    const fetchTasks = async () => {
      const client = clients.find((c) => c._id === selectedClientOption.value);
      if (!client) return;

      setCustomer({
        _id: client._id,
        name: client.name,
        address: client.address || "",
        GSTIN: client.GSTIN || "",
        mobile: client.mobile || "",
        emailId: client.emailId || "",
      });

      try {
        let url = `/tasks/by-client-name/${encodeURIComponent(
          client.name
        )}`;
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        const response = await axios.get(url);
        const tasks = response.data || [];
        const taskItems = tasks.map((task) => ({
          id: uuidv4(),
          description: task.taskName || task.workDesc || "Task",
          hsn: "9971",
          qty: 1,
          rate: 1000,
          gst: 0,
        }));
        setItems(taskItems.length ? taskItems : []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchTasks();
  }, [selectedClientOption, fromDate, toDate]);

  useEffect(() => {
    if (selectedFirm && invoiceType) {
      previewInvoiceNumber();
    }
  }, [selectedFirm, invoiceType]);

  // Handle client selection

  const handleClientChange = async (selectedOption) => {
    if (!selectedOption) {
      setCustomer({
        _id: "",
        name: "",
        address: "",
        GSTIN: "",
        mobile: "",
        emailId: "",
      });
      setItems([]); // Clear items if no client is selected
      return;
    }

    const clientId = selectedOption.value;
    const client = clients.find((c) => c._id === clientId);
    if (!client) return;

    setCustomer({
      _id: client._id,
      name: client.name,
      address: client.address || "",
      GSTIN: client.GSTIN || "",
      mobile: client.mobile || "",
      emailId: client.emailId || "",
    });

    try {
      let url = `/tasks/by-client-name/${encodeURIComponent(
        client.name
      )}`;

      // Add query params for date filtering only if dates are selected
      const params = new URLSearchParams();
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      const tasks = response.data || [];

      const taskItems = tasks.map((task) => ({
        id: uuidv4(),
        description: task.taskName || task.workDesc || "Task",
        hsn: "9971", // default HSN for professional services
        qty: 1,
        rate: 1000,
        gst: 0,
      }));

      setItems(taskItems.length ? taskItems : []);
    } catch (error) {
      console.error("Failed to fetch tasks for client:", error);
    }
  };

  // useEffect(() => {
  //   setInvoiceNumber(generateInvoiceNumber());
  // }, [selectedFirm]);

  const updateItem = (index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // delete item
  const deleteItem = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this task from the invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The task has been removed.", "success");
      }
    });
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: uuidv4(), description: "", hsn: "9971", qty: 1, rate: 0, gst: 0 },
    ]);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );

  const taxableValue = totalAmount;
  const igstRate = 0.18;
  const cgstRate = 0.09;
  const sgstRate = 0.09;

  const igstAmount = isLocalSupply() ? 0 : taxableValue * igstRate;
  const cgstAmount = isLocalSupply() ? taxableValue * cgstRate : 0;
  const sgstAmount = isLocalSupply() ? taxableValue * sgstRate : 0;
  const totalTax = igstAmount + cgstAmount + sgstAmount;
  const totalAmountWithTax = taxableValue + totalTax;

  const handleDownloadPDF = async () => {
    try {
      const finalNo = await finalizeInvoiceNumber(); // if you want locking
      setInvoiceNumber(finalNo);
      if (!invoiceRef.current) return;
      const element = invoiceRef.current;
      // Temporarily remove scale before PDF generation
      element.style.transform = "scale(1)";
      element.style.transformOrigin = "top left";
      element.style.width = `${element.scrollWidth}px`;

      // Make sure element is attached to DOM and visible
      if (!document.body.contains(element)) {
        document.body.appendChild(element);
      }
      // Add CSS for page margins

      const opt = {
        margin: 0,
        padding: 0,
        filename: `${invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          dpi: 300,
          letterRendering: true,
          useCORS: true,
          width: element.scrollWidth, // Explicitly set width
          windowWidth: element.scrollWidth, // Match window width
        },
        jsPDF: {
          unit: "px",
          // format: "a4",
          orientation: "portrait",
          format: [794, 1122],
        },
        pagebreak: { mode: "css" },
      };

      // Add this to ensure proper scaling
      element.style.width = `${element.scrollWidth}px`;

      // html2pdf().set(opt).from(element).save();
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          // Restore scale after PDF is generated

          element.style.transform = "scale(0.75)";
          element.style.transformOrigin = "top left";
          element.style.width = "";
        });

      // Reset the width after PDF generation if needed
      setTimeout(() => {
        element.style.width = "";
      }, 500);
    } catch (error) {
      alert("Could not finalize invoice number.");
    }
  };

  const saveInvoice = async () => {
    try {
      const finalNo = await finalizeInvoiceNumber();

      const invoiceData = {
        invoiceNumber: finalNo,
        invoiceDate,
        invoiceType,
        selectedFirm,
        placeOfSupply,
        customer,
        items,
        totalAmount: totalAmountWithTax,
      };
      await axios.post("/invoices", invoiceData);
      // Display an alert once the invoice is saved successfully
      Swal.fire({
        icon: "success",
        title: "Invoice Saved",
        text: `Invoice ${invoiceNumber} has been successfully saved.`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } catch (error) {
      console.error("Failed to save invoice", error);
      alert("Failed to save invoice");
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

  const page1Items = items.slice(0, ITEMS_PER_PAGE);
  const page2Items = items.slice(ITEMS_PER_PAGE);

  return (
    <div
      className="invoice-page"
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        flexWrap: "wrap",
        justifyContent: "center",
        background: "#f9f9f9",
      }}
    >
      {/* Left form side */}
      <div
        className="invoice-left scrollable-panel"
        style={{ flex: "1 1 550px", maxWidth: 550 }}
      >
        {/* ... Your left side inputs and controls ... */}
        <div
          style={{
            display: "flex",
            gap: "20px", // space between buttons
            marginTop: 20,
            justifyContent: "center", // center align horizontally (optional)
          }}
        >
          <button
            onClick={handleDownloadPDF}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              backgroundColor: "#1a73e8",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              ":hover": {
                backgroundColor: "#0d5bba",
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                transform: "translateY(-2px)",
              },
              ":active": {
                transform: "translateY(0)",
              },
            }}
          >
            <span style={{ fontSize: "20px" }}>📄</span>
            <span>Generate PDF</span>
            <span
              style={{
                position: "absolute",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                transform: "scale(0)",
                animation: "ripple 0.6s linear",
                pointerEvents: "none",
              }}
            ></span>
          </button>

          <button
            onClick={saveInvoice}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              ":hover": {
                backgroundColor: "#0d5bba",
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                transform: "translateY(-2px)",
              },
              ":active": {
                transform: "translateY(0)",
              },
            }}
          >
            Save Invoice
          </button>
        </div>

        <label>From Date</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          max={toDate || undefined}
        />

        <label>To Date</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          min={fromDate || undefined}
        />

        <h2>Your Details</h2>
        <select
          value={selectedFirm.name}
          onChange={(e) => {
            const firm = firms.find((f) => f.name === e.target.value);
            if (firm) setSelectedFirm(firm);
          }}
        >
          {firms.map((f) => (
            <option key={f.name}>{f.name}</option>
          ))}
        </select>

        {/* <label>Invoice Number</label>
        <input type="text" readOnly value={invoiceNumber} /> */}

        <label>Invoice Type</label>
        <select
          value={invoiceType}
          onChange={(e) => setInvoiceType(e.target.value)}
        >
          {invoiceTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <label>Invoice Date</label>
        <input
          type="date"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
        />

        {/* Add other form controls here as needed */}

        <h2>Customer Details</h2>

        <Select
          options={clientOptions}
          value={clientOptions.find((option) => option.value === customer._id)}
          // onChange={handleClientChange}
          onChange={(option) => setSelectedClientOption(option)}
          placeholder="Search or select client..."
          isClearable
          styles={{
            control: (base) => ({
              ...base,
              marginBottom: "10px",
              minHeight: "40px",
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999, // ensure dropdown appears above other elements
            }),
          }}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#1a73e8", // match your button color
            },
          })}
        />

        <input
          placeholder="Place of Supply"
          value={placeOfSupply}
          onChange={(e) => setPlaceOfSupply(e.target.value)}
        />

        <h2>Items</h2>

        {items.map((item, idx) => {
          const amount = (item.qty * item.rate).toFixed(2);
          return (
            <div
              key={idx}
              style={{
                marginBottom: 20,
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 8,
                backgroundColor: "#fdfdfd",
              }}
            >
              <label>Description</label>
              <input
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Description"
                style={{ width: "100%", marginBottom: 10 }}
              />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <label>Qty</label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(idx, "qty", Number(e.target.value))
                    }
                    placeholder="Qty"
                    min={1}
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Rate</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      updateItem(idx, "rate", Number(e.target.value))
                    }
                    placeholder="Rate"
                    step="0.01"
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Amount</label>
                  <input
                    readOnly
                    value={`₹${amount}`}
                    style={{ width: "100%", backgroundColor: "#f1f1f1" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  style={{
                    marginTop: 22,
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  title="Delete Task"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}

        <button onClick={addItem} className="mb-20">
          + Add Item
        </button>
      </div>
      {/* Right side invoice preview */}

      <div
        className="invoice-right screen-preview"
        ref={invoiceRef}
        style={{
          backgroundColor: "#fff",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: 12,
          color: "#000",
          transform: "scale(0.75)", // visually shrink
          transformOrigin: "top left",
          position: "relative",
          width: "794px",
        }}
      >
        <div ref={invoiceRef}>
          <InvoicePage
            pageNumber={1}
            itemsOnPage={page1Items}
            offset={offsetPage1}
            isLastPage={page2Items.length === 0}
            customer={customer}
            selectedFirm={selectedFirm}
            invoiceType={invoiceType}
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            placeOfSupply={placeOfSupply}
            isSharda={isSharda}
            totalAmount={totalAmount}
            totalAmountWithTax={totalAmountWithTax}
            taxableValue={taxableValue}
            igstAmount={igstAmount}
            cgstAmount={cgstAmount}
            sgstAmount={sgstAmount}
            numberToWordsIndian={numberToWordsIndian}
            onImagesLoaded={() => setImagesReady(true)}
          />

          {page2Items.length > 0 && (
            <InvoicePage
              pageNumber={2}
              itemsOnPage={page2Items}
              offset={offsetPage2}
              isLastPage={true}
              customer={customer}
              selectedFirm={selectedFirm}
              invoiceType={invoiceType}
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              placeOfSupply={placeOfSupply}
              isSharda={isSharda}
              totalAmount={totalAmount}
              totalAmountWithTax={totalAmountWithTax}
              taxableValue={taxableValue}
              igstAmount={igstAmount}
              cgstAmount={cgstAmount}
              sgstAmount={sgstAmount}
              numberToWordsIndian={numberToWordsIndian}
              onImagesLoaded={() => setImagesReady(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
