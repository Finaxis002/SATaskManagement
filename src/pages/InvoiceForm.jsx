import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import "../css/InvoiceForm.css";
import axios from "axios";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

const firms = [
  {
    name: "Finaxis Business Consultancy",
    subtitle: "Business Consultancy",
    gstin: "GST5454",
    address: "Vidhya Nagar, Bhopal",
    email: "finaxis@gmail.com",
    phone: "25666566",
    bank: { name: "HDFC", account: "45555415656", ifsc: "HDFC4555" },
  },
  {
    name: "Sharda Associates",
    subtitle: "Associates",
    gstin: "GST9876",
    address: "Indrapuri, Bhopal",
    email: "sharda@gmail.com",
    phone: "7894561230",
    bank: { name: "SBI", account: "1234567890", ifsc: "SBIN0001234" },
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

const generateInvoiceNumber = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "FN";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export default function InvoiceForm() {
  const [selectedFirm, setSelectedFirm] = useState(firms[0]);
  const [invoiceType, setInvoiceType] = useState(invoiceTypes[0]);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState("2025-05-15");
  const [placeOfSupply, setPlaceOfSupply] = useState("Gujarat"); // Add this line with your other states
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
  // const [items, setItems] = useState([
  //   { description: "Project Report", hsn: "9983", qty: 1, rate: 1000, gst: 0 },
  // ]);
  const [items, setItems] = useState([
    {
      id: uuidv4(),
      description: "Project Report",
      hsn: "9983",
      qty: 1,
      rate: 1000,
      gst: 0,
    },
  ]);

  const invoiceRef = useRef();

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        console.log("Fetching clients..."); // Debug log
        const response = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/clients/details"
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
      return;
    }
    const clientId = selectedOption.value;
    try {
      const client = clients.find((c) => c._id === clientId);
      if (client) {
        setCustomer({
          _id: client._id,
          name: client.name,
          address: client.address || "",
          GSTIN: client.GSTIN || "",
          mobile: client.mobile || "",
          emailId: client.emailId || "",
        });
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  };

  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
  }, [selectedFirm]);

  const updateItem = (index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // const addItem = () => {
  //   setItems([...items, { description: "", hsn: "", qty: 1, rate: 0, gst: 0 }]);
  // };
  const addItem = () => {
    setItems([
      ...items,
      { id: uuidv4(), description: "", hsn: "", qty: 1, rate: 0, gst: 0 },
    ]);
  };
  const isLocalSupply = () => {
    const place = placeOfSupply.toLowerCase().replace(/\s+/g, "");
    return place === "mp" || place === "madhyapradesh";
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

  
  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;
    const element = invoiceRef.current;

    const opt = {
      margin: 0, // Changed from [10, 10, 10, 10] to 0 for full width
      filename: `${invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 3,
        dpi: 300,
        letterRendering: true,
        useCORS: true,
        width: element.scrollWidth, // Explicitly set width
        windowWidth: element.scrollWidth, // Match window width
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        // Optionally add this if needed:
        // putOnlyUsedFonts: true,
        // hotfixes: ["px_scaling"]
      },
    };

    // Add this to ensure proper scaling
    element.style.width = `${element.scrollWidth}px`;

    html2pdf().set(opt).from(element).save();

    // Reset the width after PDF generation if needed
    setTimeout(() => {
      element.style.width = "";
    }, 1000);
  };

  const saveInvoice = async () => {
    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate,
        invoiceType,
        selectedFirm, 
        placeOfSupply,
        customer, 
        items, 
        totalAmount: totalAmountWithTax, 
      };
      await axios.post("https://sataskmanagementbackend.onrender.com/api/invoices", invoiceData);
      // Display an alert once the invoice is saved successfully
    Swal.fire({
      icon: 'success',
      title: 'Invoice Saved',
      text: `Invoice ${invoiceNumber} has been successfully saved.`,
      confirmButtonColor: "#3085d6",
      confirmButtonText: 'Ok',
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
      {/* Left form side */}
      <div
        className="invoice-left scrollable-panel"
        style={{ flex: "1 1 400px", maxWidth: 400 }}
      >
        {/* ... Your left side inputs and controls ... */}

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
        {/* <input
          placeholder="Name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        /> */}
        {/* <select
          value={customer._id}
          onChange={handleClientChange}
          style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.name}{" "}
              {client.businessName ? `(${client.businessName})` : ""}
            </option>
          ))}
        </select> */}

        <Select
          options={clientOptions}
          value={clientOptions.find((option) => option.value === customer._id)}
          onChange={handleClientChange}
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
        {/* <textarea
          placeholder="Address"
          value={customer.address}
          onChange={(e) =>
            setCustomer({ ...customer, address: e.target.value })
          }
        />
        <input
          placeholder="GSTIN"
          value={customer.gstin}
          onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
        />
        <input
          placeholder="Phone"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
        <input
          placeholder="Email"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        /> */}
        <input
          placeholder="Place of Supply"
          value={placeOfSupply}
          onChange={(e) => setPlaceOfSupply(e.target.value)}
        />

        <h2>Items</h2>
        {items.map((item, idx) => {
          const amount = (item.qty * item.rate).toFixed(2);
          return (
            <div key={idx} style={{ marginBottom: 10 }}>
              <label>Description</label>
              <input
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Description"
              />
              <label>Quantity</label>
              <input
                type="number"
                value={item.qty}
                onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                placeholder="Qty"
                min={1}
              />
              <label style={{ marginTop: "1px" }}>Rate</label>
              <input
                type="number"
                value={item.rate}
                onChange={(e) =>
                  updateItem(idx, "rate", Number(e.target.value))
                }
                placeholder="Rate"
                step="0.01"
              />
              {/* <label style={{ marginTop: "1px" }}>GST %</label>
              <input
                type="number"
                value={item.gst}
                onChange={(e) => updateItem(idx, "gst", Number(e.target.value))}
                placeholder="GST %"
                step="0.01"
                min={0}
              /> */}
              <label style={{ marginTop: "1px" }}>Amount</label>
              <input readOnly value={`₹${amount}`} />
            </div>
          );
        })}
        <button onClick={addItem} className="mb-20">
          + Add Item
        </button>
      </div>
      {/* Right side invoice preview */}
      <div
        className="invoice-right"
        ref={invoiceRef}
        style={{
          flex: "1 1 800px",
          maxWidth: 800,
          backgroundColor: "#fff",
          border: "1px solid #000",
          padding: 20,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: 12,
          color: "#000",
        }}
      >
        <div
          style={{
            borderTop: "20px solid #82C8E5",
            marginTop: "-20px",
            marginLeft: -20,
            marginRight: -20,
            marginBottom: 5,
          }}
        ></div>
        <div
          style={{
            paddingBottom: 10,
            marginBottom: 15,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {/* Logo space (left side) */}
          {/* <div
            style={{
              width: 100,
              height: 80,
              border: "1px dashed #ccc",
              marginRight: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: 10,
            }}
          >
           
          </div> */}

          {/* Company name (right side) */}

          {/* <div style={{ textAlign: "center", marginLeft: "188px" }}>
            <div
                      style={{
                        fontSize: 24,
                        color: "#0E1D3E",
                        lineHeight: 1,
                        textAlign: "center",
                      }}
                    >
                      FINAXIS
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#666",
                        marginTop: 5,
                      }}
                    >
                      Business Consultancy
                    </div>
          </div> */}
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
                  fontWeight: "",
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                {/* {selectedFirm.name.split(" ").join("\n")} */}
                {selectedFirm.name}
              </div>
            </div>
          </div>
        </div>

        {/* Container to mimic screenshot's invoice layout */}
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
                GSTIN: {selectedFirm.gstin}
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
                {invoiceType}
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
                style={{
                  border: "1px solid black",
                  padding: 6,
                  width: "35%",
                  fontWeight: "Bold",
                }}
              >
                {customer.name}
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
              <td
                colSpan={2}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "Bold",
                }}
              >
                {selectedFirm.name}
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
              <td
                colSpan={2}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "Bold",
                }}
              >
                {customer.address}
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
              <td
                colSpan={2}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "Bold",
                }}
              >
                {selectedFirm.address}
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
              <td
                colSpan={2}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "Bold",
                }}
              >
                {customer.GSTIN}
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
              <td
                colSpan={2}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "Bold",
                }}
              >
                {selectedFirm.phone}
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
              <td
                colSpan={2}
                style={{
                  border: "1px solid black",
                  padding: 6,
                  fontWeight: "Bold",
                }}
              >
                {placeOfSupply} {/* Now using the separate state */}
              </td>
              <td
                colSpan={3}
                style={{
                  border: "1px solid black",
                  padding: 0,
                  width: "50%", // Add this to ensure proper width
                }}
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
                        {invoiceNumber}
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
                      <td
                        style={{
                          fontWeight: "Bold",
                          padding: 6,
                        }}
                      >
                        {invoiceDate}
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
            {items.map((item, idx) => {
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
 

            {/* Add empty rows if needed to fix minimum height */}
            {/* {[...Array(3 - items.length > 0 ? 3 - items.length : 0)].map(
              (_, i) => (
                <tr key={`empty-${i}`}>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      height: 25,
                    }}
                    colSpan={6}
                  />
                </tr>
              )
            )} */}
            {items.length < 3 && (
              <tr>
                <td
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    height: 25,
                  }}
                  colSpan={6}
                />
              </tr>
            )}

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
                          fontSize: 10,
                          fontWeight: "Bold",
                        }}
                      >
                        Bank Details
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="normal-text "
                        style={{
                          padding: 6,
                          fontSize: 10,
                          fontWeight: "normal",
                          fontStyle: "normal",
                        }}
                      >
                        Bank Name: {selectedFirm.bank.name} <br />
                        Account Number: {selectedFirm.bank.account} <br />
                        IFSC Code: {selectedFirm.bank.ifsc}
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
                    {/* <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          fontSize: 10,
                          width: "70%",
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
                          width: "30%",
                        }}
                      >
                        ₹{totalAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          fontSize: 10,
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
                        ₹{(totalAmount * 0.18).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          fontSize: 10,
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
                        ₹{(totalAmount * 0.09).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          fontSize: 10,
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
                        ₹{(totalAmount * 0.09).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: 6,
                          fontWeight: "bold",
                          fontSize: 10,
                        }}
                      >
                        Total Amount
                      </td>
                      <td
                        style={{
                          padding: 6,
                          fontSize: 10,
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        ₹{(totalAmount * 1.18).toFixed(2)}
                      </td>
                    </tr> */}
                    {/* Taxable Value */}
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

                    {/* Conditional Taxes */}
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

                    {/* Total Amount */}
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
            marginLeft: -20,
            marginRight: -20,
          }}
        ></div>
        <div
          style={{
            borderTop: "20px solid #000",
            marginTop: -10,
            paddingTop: 0,
            textAlign: "center",
            marginLeft: -20,
            marginRight: -20,
          }}
        ></div>
      </div>
    </div>
  );
}
