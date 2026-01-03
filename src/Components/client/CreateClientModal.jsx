import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// --- Email Validation Helper Function ---
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// --- Reusable Input Component with Label and Error ---
const LabeledInput = ({ id, label, type, name, value, onChange, required, readOnly, error, placeholder, helpText, currency }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    
    <div className="relative">
      {currency && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
          {currency}
        </span>
      )}
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
          ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${currency ? 'pl-8' : 'pl-3'}
        `}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        min={type === 'number' ? "0" : undefined}
      />
    </div>
    
    {helpText && (
      <p className="text-gray-500 text-xs mt-1">{helpText}</p>
    )}
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
);

const CreateClientModal = ({ client, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    businessName: "",
    address: "",
    mobile: "",
    emailId: "",
    GSTIN: "",
    referrer: "",
    referralCode: "",
    commissionAmount: "",
  });

  const [errors, setErrors] = useState({});
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  
  const isEdit = !!(client && (client._id || client.id));

  // --- Fetch Agents from API (Standard) ---
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        
        const isDevelopment = window.location.hostname === "localhost" || 
                              window.location.hostname === "127.0.0.1";
        const baseURL = isDevelopment 
          ? "http://localhost:1100/api/agents"
          : "https://taskbe.sharda.co.in/api/agents";
        
        const response = await fetch(baseURL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let agentsData = [];
        if (Array.isArray(data)) {
          agentsData = data;
        } else if (data.agents) {
          agentsData = data.agents;
        } else if (data.data) {
          agentsData = data.data;
        }
        
        setAgents(agentsData);
        
      } catch (error) {
        
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  // --- Data Loading Effect: Pre-populate form data for Edit Mode (Correct Load) ---
  useEffect(() => {
    const c = client || {};
    
    // Ensure commissionAmount is loaded correctly, including 0, and converted to a string
    const commissionValue = (c.commissionAmount !== undefined && c.commissionAmount !== null)
      ? String(c.commissionAmount) 
      : "";
    
    const normalized = {
      name: c.name || "",
      contactPerson: c.contactPerson || c.contact || "",
      businessName: c.businessName || c.company || "",
      address: c.address || "",
      mobile: c.mobile || c.phone || c.contactNo || "",
      emailId: c.emailId || c.email || "",
      GSTIN: c.GSTIN || c.gstin || "",
      referrer: c.referrer || c.agent || "",
      referralCode: c.referralCode || "",
      commissionAmount: commissionValue, 
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
            referrer: "",
            referralCode: "",
            commissionAmount: "",
          }
    );
    setErrors({});
  }, [isEdit, client]); 

  // --- Validation Logic ---
  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      formErrors.name = "Client Name is required.";
      isValid = false;
    }

    if (formData.emailId && !isValidEmail(formData.emailId)) {
      formErrors.emailId = "Invalid email format.";
      isValid = false;
    }
    
    // If an agent is selected, commission amount must be provided (0 is allowed)
    if (formData.referrer && (!formData.commissionAmount || formData.commissionAmount.trim() === "")) {
      if (formData.commissionAmount.trim() !== '0') {
        formErrors.commissionAmount = "Commission amount is required for a referral.";
        isValid = false;
      }
    }
    
    if (formData.commissionAmount && isNaN(Number(formData.commissionAmount))) {
      formErrors.commissionAmount = "Commission amount must be a number.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  // --- Handle Agent Selection and Auto-fill Referral Code (Fixed Commission Amount Logic) ---
  const handleAgentChange = (e) => {
    const selectedAgentName = e.target.value;
    const selectedAgent = agents.find(agent => agent.name === selectedAgentName);
    
    // ✅ FIX: If in EDIT mode, preserve the existing commission amount value.
    const commissionToKeep = isEdit 
      ? formData.commissionAmount 
      : "";
    
    setFormData((prev) => ({ 
      ...prev, 
      referrer: selectedAgentName,
      referralCode: selectedAgent?.referralCode || "", 
      commissionAmount: commissionToKeep 
    }));
    
    if (errors.referrer) {
      setErrors((prevErrors) => ({ ...prevErrors, referrer: null }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        // Convert to Number or send null if no referrer
        commissionAmount: formData.referrer 
          ? Number(formData.commissionAmount) 
          : null 
      };
          
      // Pass the client ID for update if in edit mode
      if (isEdit && (client._id || client.id)) {
        dataToSubmit.id = client._id || client.id;
      }

      onCreate(dataToSubmit);
    } 
  };
    
  // --- Field Definitions for 2-column layout (Standard) ---
  const fields = [
    { id: "clientName", name: "name", label: "Client Name", required: true, type: "text", isHalf: true, readOnly: isEdit },
    { id: "contactPerson", name: "contactPerson", label: "Contact Person", type: "text", isHalf: true },
    
    { id: "mobile", name: "mobile", label: "Mobile Number", type: "tel", isHalf: true },
    { id: "emailId", name: "emailId", label: "Email ID", type: "email", isHalf: true },
    
    { id: "businessName", name: "businessName", label: "Business Name", type: "text", isHalf: true },
    { id: "GSTIN", name: "GSTIN", label: "GSTIN", type: "text", isHalf: true },
    
    { id: "address", name: "address", label: "Address", type: "text", isHalf: false },
  ];
    
  const groupedFields = [];
  for (let i = 0; i < fields.length; i++) {
      if (fields[i].isHalf && i + 1 < fields.length && fields[i + 1].isHalf) {
          groupedFields.push([fields[i], fields[i + 1]]);
          i++; 
      } else {
          groupedFields.push([fields[i]]); 
      }
  }

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4 mt-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Update Client" : "Create New Client"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={18} />
          </button>
        </div>

        {/* Form Fields Container */}
        <div className="overflow-y-auto flex-1 pr-2 mb-4" style={{ scrollBehavior: 'smooth' }}>
          {groupedFields.map((row, rowIndex) => (
            <div key={rowIndex} className={`grid ${row.length === 2 ? 'grid-cols-2 gap-x-3' : 'grid-cols-1'}`}>
              {row.map((field) => (
                  <LabeledInput
                      key={field.id}
                      id={field.id}
                      label={field.label}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      readOnly={field.readOnly}
                      error={errors[field.name]}
                  />
              ))}
            </div>
          ))}
          
          {/* ✅ Dropdown for "Refer by Agent" */}
          <div className="mb-4">
              <label htmlFor="referrer" className="block text-sm font-medium text-gray-700 mb-1">
                  Refer by Agent
              </label>
              <select
                  id="referrer"
                  name="referrer"
                  value={formData.referrer}
                  onChange={handleAgentChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  disabled={loadingAgents}
              >
                  <option value="">
                    {loadingAgents ? "Loading agents..." : "-- Select Agent --"}
                  </option>
                  {agents && agents.length > 0 ? (
                    agents.map((agent) => (
                        <option 
                            key={agent._id || agent.id} 
                            value={agent.name} 
                        >
                            {agent.name}
                        </option>
                    ))
                  ) : (
                    !loadingAgents && <option value="" disabled>No agents available</option>
                  )}
              </select>
          </div>
          
          {/* ✅ Conditional Commission Amount Field */}
          {formData.referrer && (
            <LabeledInput
                id="commissionAmount"
                label="Commission Amount (₹)"
                type="number"
                name="commissionAmount"
                value={formData.commissionAmount}
                onChange={handleChange}
                required={true} 
                error={errors.commissionAmount}
                placeholder="Enter commission amount"
                helpText="Set the commission amount for this referral"
                currency="₹"
            />
          )}

        </div>
        
        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;    