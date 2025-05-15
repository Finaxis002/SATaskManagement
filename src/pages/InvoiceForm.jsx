import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../css/InvoiceForm.css";

const firms = [
  {
    name: "Finaxis Business Consultancy",
    gstin: "GST5454",
    address: "Vidhya Nagar, Bhopal",
    email: "finaxis@gmail.com",
    phone: "25666566",
    bank: { name: "HDFC", account: "45555415656", ifsc: "HDFC4555" },
  },
  {
    name: "Sharda Associates",
    gstin: "GST9876",
    address: "Indrapuri, Bhopal",
    email: "sharda@gmail.com",
    phone: "7894561230",
    bank: { name: "SBI", account: "1234567890", ifsc: "SBIN0001234" },
  },
  {
    name: "Kailash Real Estate",
    gstin: "GST1122",
    address: "MP Nagar, Bhopal",
    email: "kailashre@gmail.com",
    phone: "7569341285",
    bank: { name: "ICICI", account: "0987654321", ifsc: "ICIC0005678" },
  },
  {
    name: "Bhojpal Realities",
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
  const [dueDate, setDueDate] = useState("2025-06-14");
  const [customer, setCustomer] = useState({
    name: "RK Firms",
    address: "Raipur, Chhattisgarh",
    gstin: "GST4575",
    phone: "295555",
    email: "rk@gmail.com",
  });
  const [items, setItems] = useState([
    { description: "Project Report", hsn: "9983", qty: 1, rate: 1000, gst: 0 },
  ]);

  const invoiceRef = useRef();

  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
  }, [selectedFirm]);

  // Print/Download PDF function (prints invoice preview only)
  const handlePrint = () => {
    if (!invoiceRef.current) return;

    html2canvas(invoiceRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
    });
  };

  // Update items handler (for simple demo, only description input shown)
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Add new empty item
  const addItem = () => {
    setItems([...items, { description: "", hsn: "", qty: 1, rate: 0, gst: 0 }]);
  };

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

  return (
    <div className="invoice-page">
      <div className="invoice-header">
        <h1>BillEase</h1>
        <div className="header-right">
          <button className="btn-reset" onClick={() => window.location.reload()}>
            🔁 Reset Form
          </button>
          <button className="btn-download" onClick={handlePrint}>
            📄 Print / Download PDF
          </button>
        </div>
      </div>

      <div className="invoice-body">
        {/* Left side form */}
        <div className="invoice-left scrollable-panel">
          <div className="invoice-section">
            <h2>Your Details</h2>

            <label>Firm Name</label>
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

            

            <label>Invoice Number</label>
            <input type="text" readOnly value={invoiceNumber} />

            <label>Address</label>
            <input
              type="text"
              value={selectedFirm.address}
              readOnly
              style={{ backgroundColor: "#f9f9f9" }}
            />
            <label>GSTIN</label>
            <input
              type="text"
              value={selectedFirm.gstin}
              readOnly
              style={{ backgroundColor: "#f9f9f9" }}
            />
            <label>Phone</label>
            <input type="text" value={selectedFirm.phone} readOnly style={{ backgroundColor: "#f9f9f9" }} />
            <label>Email</label>
            <input type="text" value={selectedFirm.email} readOnly style={{ backgroundColor: "#f9f9f9" }} />

            <label>Logo URL</label>
            <input type="text" defaultValue="https://placehold.co/150x50?text=Your+Logo" />
          </div>

          <div className="invoice-section">
            <h2>Customer Details</h2>
            <input
              placeholder="Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <textarea
              placeholder="Address"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
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
            />
          </div>

          <div className="invoice-section">
            <h2>Invoice Details</h2>
            <label>Invoice Type</label>
            <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
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
            
          </div>

          <div className="invoice-section">
            <h2>Items</h2>
            {/* <p className="note">Click the sparkle icon to fetch tax details based on description.</p> */}

            {items.map((item, idx) => (
              <div className="item-row" key={idx}>
                <input
                  value={item.description}
                  onChange={(e) => updateItem(idx, "description", e.target.value)}
                  placeholder="Description"
                />
                
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                  placeholder="Qty"
                  min={1}
                />
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(idx, "rate", Number(e.target.value))}
                  placeholder="Rate"
                  step="0.01"
                />
                <input
                  type="number"
                  value={item.gst}
                  onChange={(e) => updateItem(idx, "gst", Number(e.target.value))}
                  placeholder="GST %"
                  step="0.01"
                  min={0}
                />
                {/* <button className="btn-icon" title="Fetch Tax Details">
                  ⚙️
                </button> */}
                <button
                  className="btn-icon danger"
                  title="Remove Item"
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== idx);
                    setItems(newItems);
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}

            <button className="btn-add" onClick={addItem}>
              + Add Item
            </button>
          </div>

          <div className="invoice-section">
            <h2>Additional Information</h2>
            <label>Terms & Conditions</label>
            <textarea defaultValue="Thank you for your business. Please pay within the due date." />
            <label>Notes</label>
            <textarea placeholder="Any additional notes for the customer." />
          </div>
        </div>

        {/* Right side Invoice Preview */}
        <div className="invoice-right" ref={invoiceRef}>
          <div className="invoice-box">
            <div className="invoice-header">
              <div className="logo-box">Your Logo</div>
              <div className="invoice-meta">
                <h2>{invoiceType.toUpperCase()}</h2>
                <p>
                  <strong>Invoice #: </strong>
                  {invoiceNumber}
                </p>
                <p>
                  <strong>Date:</strong> {invoiceDate}
                </p>
                <p>
                  <strong>Due Date:</strong> {dueDate}
                </p>
              </div>
            </div>

            <div className="firm-details">
              <h4>{selectedFirm.name}</h4>
              <p>{selectedFirm.address}</p>
              <p>GSTIN: {selectedFirm.gstin}</p>
              <p>Phone: {selectedFirm.phone}</p>
              <p>Email: {selectedFirm.email}</p>
            </div>

            <div className="bill-to">
              <strong>Bill To:</strong>
              <p>{customer.name}</p>
              <p>{customer.address}</p>
              <p>GSTIN: {customer.gstin}</p>
              <p>Phone: {customer.phone}</p>
              <p>Email: {customer.email}</p>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>GST %</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const amount = item.qty * item.rate;
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{item.description}</td>
                      <td>{item.hsn}</td>
                      <td>{item.qty}</td>
                      <td>₹{item.rate.toFixed(2)}</td>
                      <td>{item.gst}%</td>
                      <td>₹{amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="payment-summary">
              <p>Subtotal: ₹{totalAmount.toFixed(2)}</p>
              <p>CGST: ₹0.00</p>
              <p>SGST/UTGST: ₹0.00</p>
              <h3>Grand Total: ₹{totalAmount.toFixed(2)}</h3>
            </div>

            <div className="bank-payment">
              <h4>Bank Details for Payment:</h4>
              <p>Bank: {selectedFirm.bank.name}</p>
              <p>A/C No: {selectedFirm.bank.account}</p>
              <p>IFSC: {selectedFirm.bank.ifsc}</p>
            </div>

            <div className="footer-note">
              <p>
                <strong>Terms & Conditions:</strong> Please pay within the due date.
              </p>
              <p style={{ textAlign: "right", marginTop: "30px" }}>
                <strong>Authorized Signatory</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
