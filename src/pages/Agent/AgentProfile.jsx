// src/pages/Agent/AgentProfile.jsx - CLEANED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
} from "lucide-react";
import PaymentHistory from "./PaymentHistory"; // Import the new component

const API_URL = "https://taskbe.sharda.co.in/api/agents";

const AgentProfile = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const totalEarned = agent.totalEarned || 0;
  const paidTillDate = agent.paidTillDate || 0;
  const pendingAmount = totalEarned - paidTillDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="text-white" size={36} />
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
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  value={bankDetails.bankName || agent.bankName || "N/A"}
                />
                <InfoItem
                  label="Account Number"
                  value={
                    bankDetails.accountNumber || agent.accountNumber || "N/A"
                  }
                />
                <InfoItem
                  label="IFSC Code"
                  value={bankDetails.ifsc || agent.ifscCode || "N/A"}
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
        <PaymentHistory agentId={agentId} />
      </div>
    </div>
  );
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

export default AgentProfile;
