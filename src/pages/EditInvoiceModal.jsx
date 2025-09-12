import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import Swal from "sweetalert2";
import axios from "../utils/secureAxios";
import { FiSave, FiDownload } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import "../css/EditInvoiceModal.css";

const EditInvoiceModal = ({ invoiceData, onClose, onSave }) => {
  const [selectedFirm, setSelectedFirm] = useState(invoiceData.selectedFirm);
  const [invoiceType, setInvoiceType] = useState(invoiceData.invoiceType);
  const [invoiceDate, setInvoiceDate] = useState(invoiceData.invoiceDate);
  const [placeOfSupply, setPlaceOfSupply] = useState(invoiceData.placeOfSupply);
  const [items, setItems] = useState(invoiceData.items);
  const [clients, setClients] = useState([]);
  const [selectedClientOption, setSelectedClientOption] = useState(invoiceData.customer);
  const [firms, setFirms] = useState([]);
  const [firmsLoading, setFirmsLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);

  useEffect(() => {
    const loadFirms = async () => {
      setFirmsLoading(true);
      try {
        const response = await axios.get("/firms"); // Replace with the appropriate API endpoint
        setFirms(response.data);
      } catch (error) {
        console.error("Error fetching firms:", error);
      } finally {
        setFirmsLoading(false);
      }
    };

    loadFirms();
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      setClientsLoading(true);
      try {
        const response = await axios.get("/clients/details");
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setClientsLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleSave = async () => {
    const missingFields = [];
    if (!selectedFirm) missingFields.push("Firm");
    if (!invoiceType) missingFields.push("Invoice Type");
    if (!invoiceDate) missingFields.push("Invoice Date");
    if (!selectedClientOption) missingFields.push("Customer Name");
    if (items.length === 0) missingFields.push("Items");

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: `Please fill out the following required fields: ${missingFields.join(", ")}`,
        confirmButtonColor: "#d33",
        confirmButtonText: "Okay",
      });
      return;
    }

    try {
      const updatedInvoice = {
        ...invoiceData,
        selectedFirm,
        invoiceType,
        invoiceDate,
        placeOfSupply,
        customer: selectedClientOption,
        items,
      };

      // Call API to save updated invoice
      await axios.put(`/invoices/${invoiceData.invoiceNumber}`, updatedInvoice);

      Swal.fire("Success", "Invoice updated successfully", "success");

      onSave(updatedInvoice);
      onClose(); // Close modal after saving
    } catch (error) {
      console.error("Error saving invoice:", error);
      Swal.fire("Error", "Failed to update the invoice", "error");
    }
  };

  return (
    <div className="modal-content">
      <div className="modal-box">
        <h2>Edit Invoice</h2>

        {/* Firm Selection */}
        <div>
          <label>Select Firm</label>
          {firmsLoading ? (
            <p>Loading firms...</p>
          ) : (
            <select
              value={selectedFirm?._id}
              onChange={(e) => setSelectedFirm(firms.find((f) => f._id === e.target.value))}
            >
              {firms.map((firm) => (
                <option key={firm._id} value={firm._id}>
                  {firm.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Invoice Type */}
        <div>
          <label>Invoice Type</label>
          <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
            <option value="Proforma Invoice">Proforma Invoice</option>
            <option value="Tax Invoice">Tax Invoice</option>
            <option value="Invoice">Invoice</option>
          </select>
        </div>

        {/* Client Selection */}
        <div>
          <label>Client</label>
          {clientsLoading ? (
            <p>Loading clients...</p>
          ) : (
            <CreatableSelect
              options={clients.map((client) => ({
                value: client._id,
                label: `${client.name}${client.businessName ? ` (${client.businessName})` : ""}`,
              }))}
              value={selectedClientOption}
              onChange={setSelectedClientOption}
              placeholder="Search or select client"
            />
          )}
        </div>

        {/* Invoice Date */}
        <div>
          <label>Invoice Date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>

        {/* Items Section */}
        <div>
          <h3>Items</h3>
          {items.map((item, index) => (
            <div key={item.id}>
              <label>Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].description = e.target.value;
                  setItems(updatedItems);
                }}
              />
              <label>Quantity</label>
              <input
                type="number"
                value={item.qty}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].qty = e.target.value;
                  setItems(updatedItems);
                }}
              />
              <label>Rate</label>
              <input
                type="number"
                value={item.rate}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].rate = e.target.value;
                  setItems(updatedItems);
                }}
              />
              <button
                onClick={() => {
                  const updatedItems = items.filter((i) => i.id !== item.id);
                  setItems(updatedItems);
                }}
                className="delete-item"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setItems([
                ...items,
                { id: uuidv4(), description: "", qty: 1, rate: 0, gst: 0 },
              ])
            }
          >
            + Add Item
          </button>
        </div>

        {/* Place of Supply */}
        <div>
          <label>Place of Supply</label>
          <input
            type="text"
            value={placeOfSupply}
            onChange={(e) => setPlaceOfSupply(e.target.value)}
          />
        </div>

        {/* Save and Download PDF */}
        <div className="actions">
          <button onClick={handleSave}>
            <FiSave />
            Save Invoice
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceModal;
