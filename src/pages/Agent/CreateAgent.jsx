// src/pages/Agent/CreateAgent.jsx (FINAL - With Bank Details)

import React, { useState } from 'react';

const CreateAgent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifsc: '',
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBankDetailChange = (e) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.email && formData.phone) {
      
      const finalData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          bankDetails: formData.bankDetails,
      };

      onSubmit(finalData); 
      
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        city: '', 
        bankDetails: { bankName: '', accountNumber: '', ifsc: '' }
      });
    } else {
      alert('Please fill in Name, Email, and Phone fields.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-indigo-200">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-700">✍️ Register New Agent</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ********** Basic Details Section ********** */}
        <div className="space-y-4 border-b pb-4">
          <h4 className="text-lg font-medium text-gray-800">Personal Information</h4>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Agent Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange} 
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange} 
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="john.doe@example.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="9876543210"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              id="city"
              value={formData.city}
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="New Delhi"
            />
          </div>
        </div> 

        {/* ********** Bank Details Section ********** */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800">Bank Details (Optional)</h4>
          
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              name="bankName"
              id="bankName"
              value={formData.bankDetails.bankName}
              onChange={handleBankDetailChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="State Bank of India"
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              id="accountNumber"
              value={formData.bankDetails.accountNumber}
              onChange={handleBankDetailChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="1234567890"
            />
          </div>
          <div>
            <label htmlFor="ifsc" className="block text-sm font-medium text-gray-700">IFSC Code</label>
            <input
              type="text"
              name="ifsc"
              id="ifsc"
              value={formData.bankDetails.ifsc}
              onChange={handleBankDetailChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="SBIN0001234"
            />
          </div>
        </div> 

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Agent
        </button>
      </form>
    </div>
  );
};

export default CreateAgent;