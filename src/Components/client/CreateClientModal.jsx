import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const CreateClientModal = ({  client, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    businessName: "",
    address: "",
    mobile: "",
    emailId: "",
    GSTIN: "",
  });

  const isEdit = Boolean(client && client._id);

   // Initialize form with client data when in edit mode
  // useEffect(() => {
  //   if (client) {
  //     setFormData({
  //       name: client.name || "",
  //       contactPerson: client.contactPerson || "",
  //       businessName: client.businessName || "",
  //       address: client.address || "",
  //       mobile: client.mobile || "",
  //       emailId: client.emailId || "",
  //       GSTIN: client.GSTIN || "",
  //     });
  //   } else {
  //     // Reset form when creating new client
  //     setFormData({
  //       name: "",
  //       contactPerson: "",
  //       businessName: "",
  //       address: "",
  //       mobile: "",
  //       emailId: "",
  //       GSTIN: "",
  //     });
  //   }
  // }, [client]);

   useEffect(() => {
    if (isEdit) {
      setFormData({
        name: client.name || "",
        contactPerson: client.contactPerson || "",
        businessName: client.businessName || "",
        address: client.address || "",
        mobile: client.mobile || "",
        emailId: client.emailId || "",
        GSTIN: client.GSTIN || "",
      });
    } else {
      setFormData({
        name: client?.name || "", // prefill typed name from invoice search
        contactPerson: "",
        businessName: "",
        address: "",
        mobile: "",
        emailId: "",
        GSTIN: "",
      });
    }
  }, [client, isEdit]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return; // Required field
    onCreate(formData); // 🔁 Pass full object to parent
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-semibold">
            {isEdit ? "Update Client" : "Create New Client"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* 🔁 Render all 7 input fields dynamically */}
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
            className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-indigo-500"
          />
        ))}

        <div className="flex justify-end gap-2">
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
