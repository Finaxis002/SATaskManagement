import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const CreateClientModal = ({ client, onClose, onCreate, agents = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    businessName: "",
    address: "",
    mobile: "",
    emailId: "",
    GSTIN: "",
    referrer: "", 
  });

  const isEdit = !!(client && (client._id || client.id));

  useEffect(() => {
    const c = client || {};
    // normalize possible field names from different backends
    const normalized = {
      name: c.name || "",
      contactPerson: c.contactPerson || c.contact || "",
      businessName: c.businessName || c.company || "",
      address: c.address || "",
      mobile: c.mobile || c.phone || c.contactNo || "",
      emailId: c.emailId || c.email || "",
      GSTIN: c.GSTIN || c.gstin || "",
      referrer: c.referrer || c.agent || "",
    };

    setFormData(
      isEdit
        ? normalized
        : {
            // for "create", keep only the name (e.g., typed from task form)
            name: normalized.name, 
            contactPerson: "",
            businessName: "",
            address: "",
            mobile: "",
            emailId: "",
            GSTIN: "",
            referrer: "", // Default empty referrer on create
          }
    );
  }, [isEdit, client?._id, client?.id, client?.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Client name is required!");
      return;
    }
    
    onCreate(formData); 
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md"> 
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {isEdit ? "Update Client" : "Create New Client"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Client Fields */}
        {[
          { name: "name", label: "Client Name*" },
          { name: "contactPerson", label: "Contact Person" },
          { name: "businessName", label: "Business Name" },
          { name: "address", label: "Address" },
          { name: "mobile", label: "Mobile Number" },
          { name: "emailId", label: "Email ID" },
          { name: "GSTIN", label: "GSTIN" },
        ].map((field) => (
          <input
            key={field.name}
            type="text"
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            placeholder={field.label}
            className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-indigo-500"
            required={field.name === "name"} 
            readOnly={isEdit && field.name === "name"}
          />
        ))}
          
        {/* 🔥 Dropdown for "Refer by Agent" (Now populated by 'agents' prop) */}
        <select
          name="referrer"
          value={formData.referrer}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Refer by Agent --</option>
          {agents.map((agent) => (
            <option 
              key={agent._id || agent.id} 
              value={agent.name} 
            >
              {agent.name}
            </option>
          ))}
        </select>
        
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;