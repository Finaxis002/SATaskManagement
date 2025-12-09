// src/pages/Agent/AgentPage.jsx - MOBILE RESPONSIVE VERSION

import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Plus, Gift, Users, X, AlertCircle } from "lucide-react";
import CreateAgent from "./CreateAgent";
import Referrals from "./Referrals";
import AgentList from "./AgentList";
import PayoutModal from "./PayoutModal";

const API_URL = "http://localhost:1100/api/agents";

const AgentPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAgent, setPayoutAgent] = useState(null);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setAgents(response.data);
    } catch (err) {
      setError(
        "Failed to fetch agents. Ensure Node.js server is running on port 1100 and backend is not crashing."
      );
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (newAgentData) => {
    try {
      const response = await axios.post(API_URL, newAgentData);
      setAgents([...agents, response.data]);
      alert(`Agent ${response.data.name} created successfully!`);
      setIsModalOpen(false);
      setActiveTab("list");
    } catch (err) {
      alert(
        "Error creating agent: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteAgent = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setAgents(agents.filter((agent) => agent._id !== id));
        alert("Agent deleted successfully.");
      } catch (err) {
        alert(
          "Error deleting agent: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleUpdateAgent = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData);
      setAgents(
        agents.map((agent) => (agent._id === id ? response.data : agent))
      );
      return true;
    } catch (err) {
      alert(
        "Error updating agent: " + (err.response?.data?.message || err.message)
      );
      return false;
    }
  };

  const handleOpenPayoutModal = (agent) => {
    setPayoutAgent(agent);
    setShowPayoutModal(true);
  };

  const handleProcessPayout = async (agentId, amount) => {
    try {
      const response = await axios.post(`${API_URL}/${agentId}/payout`, {
        amount: parseFloat(amount),
      });

      setAgents(
        agents.map((agent) => (agent._id === agentId ? response.data : agent))
      );

      alert(`Payout of ${amount} processed successfully!`);
      setShowPayoutModal(false);
    } catch (err) {
      alert("Payout failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-indigo-600 font-semibold text-base sm:text-lg">
            Loading Agents...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={40} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">
            Connection Error
          </h2>
          <p className="text-sm sm:text-base text-red-600 text-center mb-4">
            {error}
          </p>
          <button
            onClick={fetchAgents}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                <User className="text-indigo-600" size={24} />
              </div>
              Agent Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 ml-10 sm:ml-14">
              Manage agents, referrals, and commissions
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-150 text-sm sm:text-base"
          >
            <Plus size={18} />
            Create Agent
          </button>
        </div>

        {/* Tabs - Mobile Responsive */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                activeTab === "list"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Agents List</span>
              <span className="xs:hidden">Agents</span>
            </button>

            <button
              onClick={() => setActiveTab("referral")}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                activeTab === "referral"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Gift size={18} className="sm:w-5 sm:h-5" />
              Referrals
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "referral" && <Referrals agents={agents} />}
            {activeTab === "list" && (
              <AgentList
                agents={agents}
                onDelete={handleDeleteAgent}
                onUpdate={handleUpdateAgent}
                onPay={handleOpenPayoutModal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create Agent Modal - Mobile Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4  bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-fadeIn max-h-[95vh] sm:max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Plus size={20} className="sm:w-6 sm:h-6" />
                Create New Agent
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1.5 sm:p-2 rounded-lg transition-colors"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 max-h-[calc(95vh-80px)] sm:max-h-[80vh] overflow-y-auto">
              <CreateAgent onSubmit={handleCreateAgent} />
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && payoutAgent && (
        <PayoutModal
          agent={payoutAgent}
          onClose={() => setShowPayoutModal(false)}
          onProcess={handleProcessPayout}
        />
      )}
    </div>
  );
};

export default AgentPage;
