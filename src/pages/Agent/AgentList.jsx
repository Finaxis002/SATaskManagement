import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Edit,
  User,
  Mail,
  IndianRupee,
  Copy,
  Check,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; 
import axios from "axios";

// API URL
const API_URL = "https://taskbe.sharda.co.in/api/agents";

// Currency Formatter Utility
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};


const PaymentModalForList = ({ agent, onClose, onUpdate }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const totalEarned = agent?.totalEarned || 0;
  const paidTillDate = agent?.paidTillDate || 0;
  const pendingAmount = totalEarned - paidTillDate;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (amount > pendingAmount) {
      toast.error(
        `Amount cannot exceed pending amount of ${formatCurrency(
          pendingAmount
        )}.`
      );
      return;
    }

    setProcessing(true);
    try {
      // PayOut API Call
      const response = await axios.post(`${API_URL}/${agent._id}/payout`, {
        amount: amount,
        notes: paymentNotes || `Payment of ₹${amount}`,
        date: new Date().toISOString(),
      });

      // Show toast on successful payment
      toast.success(
        `Payment of ${formatCurrency(amount)} successful for ${agent.name}.`
      );


      onUpdate(agent._id, response.data);

      onClose();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(
        "Failed to process payment: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto md: mt-10">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <IndianRupee size={20} className="sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Process Payment</span>
            <span className="sm:hidden">Payment</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={18} className="sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Agent Info */}
          <div className="bg-slate-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              {agent.profileImage ? (
                <img
                  src={agent.profileImage}
                  alt={agent.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-indigo-200"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  {agent.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{agent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">Total Earned</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {formatCurrency(totalEarned)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">Paid</p>
                <p className="text-xs sm:text-sm font-bold text-green-600 truncate">
                  {formatCurrency(paidTillDate)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">Pending</p>
                <p className="text-xs sm:text-sm font-bold text-red-600 truncate">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Payment Amount *
              </label>
              <div className="relative">
                <IndianRupee
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={pendingAmount}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-lg font-semibold"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(pendingAmount)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Payment Notes (Optional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add notes about this payment..."
                rows="3"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">
                Quick Select:
              </p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[
                  { label: "25%", value: pendingAmount * 0.25 },
                  { label: "50%", value: pendingAmount * 0.5 },
                  { label: "75%", value: pendingAmount * 0.75 },
                  { label: "Full", value: pendingAmount },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setPaymentAmount(option.value.toFixed(2))}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing || !paymentAmount}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Wait...</span>
                </>
              ) : (
                <>
                  <IndianRupee size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Pay Now</span>
                  <span className="sm:hidden">Pay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const AgentForm = ({ initialData, onSave, onCancel }) => {
  const isEditing = !!initialData?._id;

  // State initialization updated to match MongoDB model's top-level fields
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    referralCode: initialData?.referralCode || "",
    // Use 'phone' for form, fallback to 'mobile' if 'phone' is missing
    phone: initialData?.phone || initialData?.mobile || "",

    // Bank details match top-level fields in the MongoDB schema
    bankName: initialData?.bankName || "",
    accountNumber: initialData?.accountNumber || "",
    ifscCode: initialData?.ifscCode || "",
  });

  // New state for handling the processing state (prevent double click)
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Direct update to top-level state
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // UPDATED handleSubmit to show toast and close modal on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
  
        await onSave(initialData?._id, formData); 
        
     
        const successMsg = isEditing 
            ? `Your profile is updated successfully` 
            : `New Agent "${formData.name}" created successfully`;
            
        toast.success(successMsg);

 
        setTimeout(() => {
            onCancel(); 
        }, 500); 

    } catch (error) {
        console.error("Agent save error:", error);
        toast.error("Failed to save agent details: " + (error.response?.data?.message || error.message));
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white shadow rounded-lg mt-8">
      <div className="flex items-center justify-between mb-4 pt-1 border-b border-indigo-200 pb-2">
        <h3 className="text-xl font-bold text-gray-800">
          {isEditing ? `Edit Agent: ${initialData.name}` : "Create New Agent"}
        </h3>

        {/* Close Button (X icon) */}
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          disabled={isSaving}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mb-4">
        {/* Personal Details Section */}
        <div className="space-y-4 border-b pb-4">
          <h4 className="text-lg font-semibold text-indigo-700">
            Personal Details
          </h4>

          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Agent Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100"
            />
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={isSaving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100"
            />
          </div>

          {/* Phone Input */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSaving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100"
            />
          </div>

          {/* Referral Code (Read-only) */}
          <div>
            <label
              htmlFor="referralCode"
              className="block text-sm font-medium text-gray-700"
            >
              Referral Code
            </label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              value={formData.referralCode || "Auto-Generated"}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border text-gray-500"
            />
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-indigo-700">
            Bank Details
          </h4>

          {/* Bank Name Field */}
          <div>
            <label
              htmlFor="bankName"
              className="block text-sm font-medium text-gray-700"
            >
              Bank Name
            </label>
            <input
              id="bankName"
              name="bankName"
              type="text"
              value={formData.bankName || ""}
              onChange={handleChange}
              disabled={isSaving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100"
            />
          </div>

          {/* Account Number */}
          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Account Number
            </label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              value={formData.accountNumber || ""}
              onChange={handleChange}
              disabled={isSaving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100"
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label
              htmlFor="ifscCode"
              className="block text-sm font-medium text-gray-700"
            >
              IFSC Code
            </label>
            <input
              id="ifscCode"
              name="ifscCode"
              type="text"
              value={formData.ifscCode || ""}
              onChange={handleChange}
              disabled={isSaving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100"
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
          >
            {isSaving ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                </>
            ) : (
                isEditing ? "Save Changes" : "Create Agent"
            )}
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
        <AgentForm initialData={agent} onSave={onSave} onCancel={onClose} />
      </div>
    </div>
  );
};



// AgentList Component (UPDATED TOASTER POSITION TO "center")

const AgentList = ({ agents = [], onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);

  const [editingAgentId, setEditingAgentId] = useState(null);
  const agentToEdit = agents.find((agent) => agent._id === editingAgentId);

  // NEW STATE FOR PAYMENT MODAL
  const [agentToPay, setAgentToPay] = useState(null);
  const showPaymentModal = !!agentToPay;

  const handleEditAgent = (agentId) => {
    setEditingAgentId(agentId);
  };

  const handleSaveAgent = (agentId, updatedData) => {
    return onUpdate(agentId, updatedData); 
  };

  // Handle Pay Now Button Click (Opens Modal)
  const handlePayNow = (agent) => {
    setAgentToPay(agent);
  };

  // Copy referral code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied!");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy code.");
    }
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
        <p className="text-base sm:text-lg text-gray-600 font-medium">
          No agents registered yet
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Click "Create New Agent" to add your first agent
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* 🛑 TOASTER POSITION CHANGED TO "center" */}
      <Toaster position="center" reverseOrder={false} /> 

      {agentToEdit && (
        <AgentEditFormModal
          agent={agentToEdit}
          onClose={() => setEditingAgentId(null)}
          onSave={handleSaveAgent}
        />
      )}

      {/* Payment Modal Display */}
      {showPaymentModal && (
        <PaymentModalForList
          agent={agentToPay}
          onClose={() => setAgentToPay(null)}
          onUpdate={onUpdate}
        />
      )}

      {/* Header - Responsive */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          All Agents ({agents.length})
        </h3>
      </div>

      {/* Desktop Table View (lg) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Details
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral Code
                </th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earned
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => {
                const totalEarned = agent.totalEarned || 0;
                const paidTillDate = agent.paidTillDate || 0;
                const pendingAmount = totalEarned - paidTillDate;

                return (
                  <tr
                    key={agent._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Agent Details */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 xl:ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {agent.name}
                          </div>
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
                          {agent.referralCode || "N/A"}
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
                    {/* Pending Amount Cell (lg) */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-right font-semibold">
                      <div className="flex flex-col items-end">
                        <span
                          className={
                            pendingAmount > 0
                              ? "text-red-600 font-bold"
                              : "text-gray-400"
                          }
                        >
                          {formatCurrency(pendingAmount)}
                        </span>
                        {pendingAmount > 0 && (
                          <button
                            onClick={() => handlePayNow(agent)}
                            className="mt-1 px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <IndianRupee size={14} /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center">
                      <select
                        value={agent.status}
                        onChange={(e) =>
                          handleStatusChange(agent._id, e.target.value)
                        }
                        className={`px-2.5 xl:px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${
                          agent.status === "Active"
                            ? "bg-green-100 text-green-800 focus:ring-green-500"
                            : "bg-gray-100 text-gray-800 focus:ring-gray-500"
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>

                    {/* Actions */}
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

      {/* Tablet Table View (md to lg) */}
      <div className="hidden md:block lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Refs
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Earned
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Pending
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => {
                const totalEarned = agent.totalEarned || 0;
                const paidTillDate = agent.paidTillDate || 0;
                const pendingAmount = totalEarned - paidTillDate;

                return (
                  <tr
                    key={agent._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Agent Details and Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-xs">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {agent.name}
                          </div>
                          <select
                            value={agent.status}
                            onChange={(e) =>
                              handleStatusChange(agent._id, e.target.value)
                            }
                            className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                              agent.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Code, Refs, Earnings... */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-mono font-semibold text-indigo-800">
                          {agent.referralCode || "N/A"}
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
                      <div className="text-xs font-semibold text-gray-900">
                        {formatCurrency(totalEarned)}
                      </div>
                      <div className="text-xs text-green-600 mt-0.5">
                        {formatCurrency(paidTillDate)}
                      </div>
                    </td>
                    {/* Pending Amount Cell (md) */}
                    <td className="px-4 py-3 text-right">
                      <div
                        className={`text-xs font-bold ${
                          pendingAmount > 0 ? "text-red-600" : "text-gray-400"
                        }`}
                      >
                        {formatCurrency(pendingAmount)}
                      </div>
                      {pendingAmount > 0 && (
                        <button
                          onClick={() => handlePayNow(agent)}
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
            <div
              key={agent._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-base sm:text-lg">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <Mail size={11} className="flex-shrink-0" />
                      <span className="truncate">{agent.email}</span>
                    </div>
                  </div>
                </div>
                <select
                  value={agent.status}
                  onChange={(e) =>
                    handleStatusChange(agent._id, e.target.value)
                  }
                  className={`flex-shrink-0 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                    agent.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  Referral Code
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-semibold bg-indigo-100 text-indigo-800 flex-1 justify-center">
                    {agent.referralCode || "N/A"}
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
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    Referrals
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800">
                    {agent.referrals}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-gray-600 font-medium mb-1">
                    Total Earned
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    {formatCurrency(totalEarned)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">
                    Paid
                  </div>
                  <div className="text-base sm:text-lg font-bold text-green-700 truncate">
                    {formatCurrency(paidTillDate)}
                  </div>
                </div>
                <div
                  className={`rounded-lg p-2.5 sm:p-3 ${
                    pendingAmount > 0 ? "bg-red-50" : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-xs font-medium mb-1 ${
                      pendingAmount > 0 ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    Pending
                  </div>
                  <div
                    className={`text-base sm:text-lg font-bold truncate ${
                      pendingAmount > 0 ? "text-red-700" : "text-gray-400"
                    }`}
                  >
                    {formatCurrency(pendingAmount)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {pendingAmount > 0 && (
                  <button
                    onClick={() => handlePayNow(agent)}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <IndianRupee size={16} /> Pay Now
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