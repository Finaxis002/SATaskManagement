

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Trash2, Edit, User, Mail, DollarSign, Copy, Check } from 'lucide-react'; 

const AgentForm = ({ initialData, onSave, onCancel }) => {
  const isEditing = !!initialData?._id; 
  

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    referralCode: initialData?.referralCode || '',
    phone: initialData?.phone || '', 
    bankDetails: {
        bankName: initialData?.bankDetails?.bankName || '',   
      accountNumber: initialData?.bankDetails?.accountNumber || '',
      ifsc: initialData?.bankDetails?.ifsc || '',

    },
    // Add other fields you want to edit here
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const bankFieldName = name.split('.')[1];
      setFormData(prev => ({ 
        ...prev, 
        bankDetails: {
          ...prev.bankDetails,
          [bankFieldName]: value 
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();
  console.log('Submitting form data:', formData);
  console.log('Bank Details:', formData.bankDetails); 
  onSave(initialData?._id, formData);
};
  
  return (
       <div className="p-4 sm:p-6 bg-white shadow rounded-lg mt-8"> 
     <div className="flex items-center justify-between mb-4 pt-1 border-b border-indigo-200 pb-2">
  <h3 className="text-xl font-bold text-gray-800">
    {isEditing ? `Edit Agent: ${initialData.name}` : 'Create New Agent'}
  </h3>

  {/* Close Button (X icon) */}
  <button
    type="button"
    onClick={onCancel}
    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
  >
    ✕
  </button>
</div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details Section */}
        <div className="space-y-4 border-b pb-4">
          <h4 className="text-lg font-semibold text-indigo-700">Personal Details</h4>
          
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Agent Name</label>
            <input
              id="name" name="name" type="text" required
              value={formData.name} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email" name="email" type="email" required
              value={formData.email} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          
          {/* 🔔 NEW: Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              id="phone" name="phone" type="tel"
              value={formData.phone} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          {/* Referral Code (Read-only) */}
          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">Referral Code</label>
            <input
              id="referralCode" name="referralCode" type="text"
              value={formData.referralCode || 'Auto-Generated'} readOnly 
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border text-gray-500"
            />
          </div>
        </div>

        {/* Bank Details Section */}
<div className="space-y-4">
    <h4 className="text-lg font-semibold text-indigo-700">Bank Details</h4>
    
    {/* Bank Name Field */}
    <div>
        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
        <input
            id="bankName"
            name="bankDetails.bankName"
            type="text"
            value={formData.bankDetails?.bankName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
    </div>
    
    {/* Account Number */}
    <div>
        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
        <input
            id="accountNumber"
            name="bankDetails.accountNumber"
            type="text"
            value={formData.bankDetails?.accountNumber || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
    </div>
    
    {/* IFSC Code */}
    <div>
        <label htmlFor="ifsc" className="block text-sm font-medium text-gray-700">IFSC Code</label>
        <input
            id="ifsc"
            name="bankDetails.ifsc"
            type="text"
            value={formData.bankDetails?.ifsc || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
    </div>

</div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  );
};


const AgentEditFormModal = ({ agent, onClose, onSave }) => {
    if (!agent) return null;

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
        <div 
          className="fixed inset-0  bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-100 transition-transform duration-300">
                <AgentForm 
                    initialData={agent} 
                    onSave={onSave}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
};
const AgentList = ({ agents = [], onDelete, onUpdate, onPay }) => { 
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  
  const [editingAgentId, setEditingAgentId] = useState(null);
  const agentToEdit = agents.find(agent => agent._id === editingAgentId);

  const handleEditAgent = (agentId) => {
    setEditingAgentId(agentId);
  };

  const handleSaveAgent = (agentId, updatedData) => {
    onUpdate(agentId, updatedData);
    setEditingAgentId(null); 
  };


  // Copy referral code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Helper to format currency (INR)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount || 0); 
  };
  
  const handleStatusChange = (agentId, newStatus) => {
    onUpdate(agentId, { status: newStatus });
  };
  
  const handleViewProfile = (agentId) => {
    navigate(`/agent/profile/${agentId}`);
  };

  // Handle case where agents array is empty
  if (agents.length === 0) {
    return (
      <div className="text-center p-8 sm:p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <User size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-base sm:text-lg text-gray-600 font-medium">No agents registered yet</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">Click "Create New Agent" to add your first agent</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 px-2 sm:px-0">

      {agentToEdit && (
        <AgentEditFormModal 
          agent={agentToEdit}
          onClose={() => setEditingAgentId(null)}
          onSave={handleSaveAgent}
        />
      )}

      {/* Header - Responsive */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          All Agents ({agents.length})
        </h3>
      </div>
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Details</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earned</th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => {
                const totalEarned = agent.totalEarned || 0; 
                const paidTillDate = agent.paidTillDate || 0; 
                const pendingAmount = totalEarned - paidTillDate;

                return (
                  <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                    {/* Agent Details */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 xl:ml-4">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={12} /> {agent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Referral Code with Copy Button */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 xl:px-3 py-1 rounded-md text-xs xl:text-sm font-mono font-semibold bg-indigo-100 text-indigo-800">
                          {agent.referralCode || 'N/A'}
                        </span>
                        {agent.referralCode && (
                          <button
                            onClick={() => handleCopyCode(agent.referralCode)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Copy Referral Code"
                          >
                            {copiedCode === agent.referralCode ? (
                              <Check size={16} className="text-green-600" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                        {agent.referrals}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(totalEarned)}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-right text-green-600 font-medium">
                      {formatCurrency(paidTillDate)}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-right font-semibold">
                      <div className="flex flex-col items-end">
                        <span className={pendingAmount > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>
                          {formatCurrency(pendingAmount)}
                        </span>
                        {pendingAmount > 0 && (
                          <button
                            onClick={() => onPay(agent)}
                            className="mt-1 px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <DollarSign size={14} /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center">
                      <select
                        value={agent.status}
                        onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                        className={`px-2.5 xl:px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${
                          agent.status === 'Active' 
                            ? 'bg-green-100 text-green-800 focus:ring-green-500' 
                            : 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    
                    {/* Actions - UPDATED EDIT BUTTON */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5 xl:gap-2">
                        <button
                          onClick={() => handleViewProfile(agent._id)}
                          className="p-1.5 xl:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <User size={18} />
                        </button>
                        <button
                          onClick={() => handleEditAgent(agent._id)} 
                          className="p-1.5 xl:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(agent._id)}
                          className="p-1.5 xl:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Agent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden md:block lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Refs</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Earned</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => {
                const totalEarned = agent.totalEarned || 0; 
                const paidTillDate = agent.paidTillDate || 0; 
                const pendingAmount = totalEarned - paidTillDate;

                return (
                  <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                    {/* Agent Details and Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-xs">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <select
                            value={agent.status}
                            onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                            className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                              agent.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </td>
                    
                    {/* Code, Refs, Earnings, Pending... (No Change) */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-mono font-semibold text-indigo-800">
                          {agent.referralCode || 'N/A'}
                        </span>
                        {agent.referralCode && (
                          <button
                            onClick={() => handleCopyCode(agent.referralCode)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            {copiedCode === agent.referralCode ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {agent.referrals}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-xs font-semibold text-gray-900">{formatCurrency(totalEarned)}</div>
                      <div className="text-xs text-green-600 mt-0.5">{formatCurrency(paidTillDate)}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`text-xs font-bold ${pendingAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatCurrency(pendingAmount)}
                      </div>
                      {pendingAmount > 0 && (
                        <button
                          onClick={() => onPay(agent)}
                          className="mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewProfile(agent._id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <User size={16} />
                        </button>
                        <button
                          onClick={() => handleEditAgent(agent._id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(agent._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Mobile Card View --- */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {agents.map((agent) => {
          const totalEarned = agent.totalEarned || 0; 
          const paidTillDate = agent.paidTillDate || 0; 
          const pendingAmount = totalEarned - paidTillDate;

          return (
            <div key={agent._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-base sm:text-lg">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{agent.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <Mail size={11} className="flex-shrink-0" /> 
                      <span className="truncate">{agent.email}</span>
                    </div>
                  </div>
                </div>
                <select
                  value={agent.status}
                  onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                  className={`flex-shrink-0 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                    agent.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1 font-medium">Referral Code</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-semibold bg-indigo-100 text-indigo-800 flex-1 justify-center">
                    {agent.referralCode || 'N/A'}
                  </span>
                  {agent.referralCode && (
                    <button
                      onClick={() => handleCopyCode(agent.referralCode)}
                      className="flex-shrink-0 p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode === agent.referralCode ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">Referrals</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800">{agent.referrals}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-gray-600 font-medium mb-1">Total Earned</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 truncate">{formatCurrency(totalEarned)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">Paid</div>
                  <div className="text-base sm:text-lg font-bold text-green-700 truncate">{formatCurrency(paidTillDate)}</div>
                </div>
                <div className={`rounded-lg p-2.5 sm:p-3 ${pendingAmount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`text-xs font-medium mb-1 ${pendingAmount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    Pending
                  </div>
                  <div className={`text-base sm:text-lg font-bold truncate ${pendingAmount > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                    {formatCurrency(pendingAmount)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {pendingAmount > 0 && (
                  <button
                    onClick={() => onPay(agent)}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <DollarSign size={16} /> Pay Now
                  </button>
                )}
                <button
                  onClick={() => handleViewProfile(agent._id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Profile"
                >
                  <User size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEditAgent(agent._id)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => onDelete(agent._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentList;