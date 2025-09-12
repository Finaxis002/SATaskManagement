import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const CreateClientModal = ({ client, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    businessName: "",
    address: "",
    mobile: "",
    emailId: "",
    GSTIN: "",
  });

  const isEdit = !!(client && (client._id || client.id));

  useEffect(() => {
    const c = client || {};
    const normalized = {
      name: c.name || "",
      contactPerson: c.contactPerson || c.contact || "",
      businessName: c.businessName || c.company || "",
      address: c.address || "",
      mobile: c.mobile || c.phone || c.contactNo || "",
      emailId: c.emailId || c.email || "",
      GSTIN: c.GSTIN || c.gstin || "",
    };
    setFormData(
      isEdit
        ? normalized
        : {
            name: normalized.name,
            contactPerson: "",
            businessName: "",
            address: "",
            mobile: "",
            emailId: "",
            GSTIN: "",
          }
    );
  }, [isEdit, client?._id, client?.id, client?.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-4">
      {/* Modal container */}
      <div
        className="bg-white rounded-lg shadow-lg
                   w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-sm
                   p-4 sm:p-5 lg:p-5
                   flex flex-col"
      >
        {/* Header */}
        <div className="relative mb-3 text-center">
          <h2 className="text-lg font-semibold text-blue-900">
            {isEdit ? "Update Client" : "Create New Client"}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-red-500 transition duration-200 transform hover:text-red-700 hover:scale-110 hover:shadow-lg"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form Inputs - Single column */}
        <div className="grid grid-cols-1 gap-2">
          {[
            { name: "name", label: "Client Name" },
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
              className="w-full p-2 border border-gray-300 rounded 
             focus:outline-none focus:border-blue-500 
             text-sm"
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-row justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-sm transition duration-200
               bg-red-700 text-white
               hover:opacity-80 hover:scale-105"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm transition duration-200 transform hover:bg-indigo-800 hover:scale-105 hover:shadow-lg"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;
