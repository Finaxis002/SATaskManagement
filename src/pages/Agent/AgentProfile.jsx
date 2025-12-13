import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Banknote,
  Users,
  TrendingUp,
  X,
  Edit,
  Percent,
  IndianRupee,
} from "lucide-react";
import PaymentHistory from "./PaymentHistory"; //

const API_URL = "https://taskbe.sharda.co.in/api/agents";

// Currency Formatter Utility
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

// Info Item Component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    {Icon && (
      <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
        <Icon size={18} className="text-slate-600" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900 break-words">
        {value}
      </p>
    </div>
  </div>
);


// Payment Modal Component (No change)
const PaymentModal = ({ agent, onClose, onPaymentSuccess }) => {
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
      toast.error(`Amount cannot exceed pending amount of ${formatCurrency(pendingAmount)}.`);
      return;
    }

    setProcessing(true);
    try {
      await axios.post(`${API_URL}/${agent._id}/payout`, {
        amount: amount,
        notes: paymentNotes || `Payment of ₹${amount}`,
        date: new Date().toISOString(),
      });

      onPaymentSuccess(`Payment of ${formatCurrency(amount)} successful for ${agent.name}.`);
      onClose();
    } catch (err) {
      console.error("Payment error:", err);

      toast.error("Failed to process payment: " + (err.response?.data?.message || err.message));
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
      className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto mt-12 md: mb-14">
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
                <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">{agent.name}</p>
                <p className="text-xs text-slate-500 truncate">{agent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">Total Earned</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{formatCurrency(totalEarned)}</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">Paid</p>
                <p className="text-xs sm:text-sm font-bold text-green-600 truncate">{formatCurrency(paidTillDate)}</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">Pending</p>
                <p className="text-xs sm:text-sm font-bold text-red-600 truncate">{formatCurrency(pendingAmount)}</p>
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
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
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
              <p className="text-xs font-medium text-gray-600 mb-2">Quick Select:</p>
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

// Edit Modal Component (No change needed here)
const EditAgentModal = ({ agent, onClose, onSave }) => {
  // formData is flattened to match the Mongoose schema
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    email: agent?.email || agent?.emailId || "", // emailId fallback
    phone: agent?.phone || agent?.mobile || "", // mobile fallback
    address: agent?.address || agent?.city || "",
    commissionRate: agent?.commissionRate || 0,
    profileImage: agent?.profileImage || "",
    // Bank Details - TOP-LEVEL fields matching Mongoose
    bankName: agent?.bankDetails?.bankName || agent?.bankName || "",
    accountNumber: agent?.bankDetails?.accountNumber || agent?.accountNumber || "",
    ifscCode: agent?.bankDetails?.ifsc || agent?.ifscCode || "", // Renamed 'ifsc' to 'ifscCode'
  });

  const [imagePreview, setImagePreview] = useState(agent?.profileImage || "");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Flattened update logic
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, profileImage: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto mt-10"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 sm:my-8 max-h-[80vh] overflow-y-auto md: mb-18">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Agent Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* Personal Details */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-indigo-700">Personal Details</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name *
              </label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Rate (%)
              </label>
              <input
                name="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commissionRate}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Bank Details (UPDATED INPUT NAMES) */}
          <div className="space-y-3 sm:space-y-4 border-t pt-4">
            <h4 className="text-base sm:text-lg font-semibold text-indigo-700">Bank Details</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                name="bankName" // <-- Changed
                type="text"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                name="accountNumber" // <-- Changed
                type="text"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                name="ifscCode" // <-- Changed from bankDetails.ifsc to ifscCode
                type="text"
                value={formData.ifscCode}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 sm:gap-3 pt-4 ">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentProfile = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchAgentData();
  }, [agentId]);

  const fetchAgentData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${agentId}`);
      setAgent(response.data);
    } catch (err) {
      setError("Failed to load agent data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgent = async (updatedData) => {
    try {
      // Ensure only fields existing in the Mongoose schema top-level are sent
      const payload = {
        name: updatedData.name,
        emailId: updatedData.email, // Use emailId for backend as per schema
        email: updatedData.email,
        mobile: updatedData.phone, // Use mobile for backend as per schema
        phone: updatedData.phone,
        address: updatedData.address,
        commissionRate: updatedData.commissionRate,
        bankName: updatedData.bankName, // Top-level
        accountNumber: updatedData.accountNumber, // Top-level
        ifscCode: updatedData.ifscCode, // Top-level
        profileImage: updatedData.profileImage,
      };

      await axios.put(`${API_URL}/${agentId}`, payload);

      // 🛑 UPDATED TOAST MESSAGE (ONLY ENGLISH)
      toast.success("Your profile is updated successfully!");

      setShowEditModal(false);
      fetchAgentData();
    } catch (err) {


      toast.error("Failed to update agent profile: " + (err.response?.data?.message || ""));
    }
  };

  const handlePaymentSuccess = (message) => {

    toast.success(message);
    fetchAgentData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Agent Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-slate-600">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:text-indigo-800">Go Back</button>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">No agent data found.</p>
      </div>
    );
  }

  const bankDetails = agent.bankDetails || {};
  const hasBankDetails =
    bankDetails.bankName ||
    bankDetails.accountNumber ||
    agent.bankName ||
    agent.accountNumber;

  const totalEarned = agent.totalEarned || 0;
  const paidTillDate = agent.paidTillDate || 0;
  const pendingAmount = totalEarned - paidTillDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">


      {/* 🛑 TOASTER POSITION CHANGED TO "center" for full center alignment */}
      <Toaster position="center" reverseOrder={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Agents
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Profile Image */}
              <div className="relative">
                {agent.profileImage ? (
                  <img
                    src={agent.profileImage}
                    alt={agent.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-indigo-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <User className="text-white" size={36} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  {agent.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                    Code: {agent.referralCode || "N/A"}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      agent.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {pendingAmount > 0 && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    <IndianRupee size={18} />
                    Pay Now
                  </button>
                )}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MetricCard
            icon={TrendingUp}
            label="Total Earned"
            value={formatCurrency(totalEarned)}
            gradient="from-emerald-500 to-teal-600"
          />
          <MetricCard
            icon={DollarSign}
            label="Paid Till Date"
            value={formatCurrency(paidTillDate)}
            gradient="from-blue-500 to-cyan-600"
          />
          <MetricCard
            icon={Banknote}
            label="Pending Amount"
            value={formatCurrency(pendingAmount)}
            gradient={
              pendingAmount > 0
                ? "from-orange-500 to-red-600"
                : "from-slate-400 to-slate-500"
            }
          />
          <MetricCard
            icon={Users}
            label="Total Referrals"
            value={agent.referrals || 0}
            gradient="from-purple-500 to-pink-600"
          />
          <MetricCard
            icon={Percent}
            label="Commission Rate"
            value={`${agent.commissionRate || 0}%`}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Contact Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                icon={Mail}
                label="Email"
                value={agent.email || agent.emailId}
              />
              <InfoItem
                icon={Phone}
                label="Phone"
                value={agent.phone || agent.mobile}
              />
              <InfoItem
                icon={MapPin}
                label="Address"
                value={agent.address || agent.city || "Not Specified"}
              />
              <InfoItem
                icon={Users}
                label="Referrals"
                value={`${agent.referrals || 0} Clients`}
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Bank Details
            </h2>
            {hasBankDetails ? (
              <div className="space-y-4">
                <InfoItem
                  icon={Banknote}
                  label="Bank Name"
                  value={agent.bankName || "N/A"}
                />
                <InfoItem
                  label="Account Number"
                  value={agent.accountNumber || "N/A"}
                />
                <InfoItem
                  label="IFSC Code"
                  value={agent.ifscCode || "N/A"}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No bank details available
              </p>
            )}
          </div>
        </div>

        {/* Payment History Component */}
        <PaymentHistory
          agentId={agentId}
          onDataChange={fetchAgentData}
        />
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditAgentModal
          agent={agent}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveAgent}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          agent={agent}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default AgentProfile;