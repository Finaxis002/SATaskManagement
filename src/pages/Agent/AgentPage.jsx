// src/pages/Agent/AgentPage.jsx - FINAL VERSION (API URL & Modal Logic)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Plus, Gift, Users, X, AlertCircle } from 'lucide-react'; 
import CreateAgent from './CreateAgent';
import Referrals from './Referrals';
import AgentList from './AgentList';
// PayoutModal import, although not directly used here, it's used conditionally in JSX
import PayoutModal from './PayoutModal'; 

const API_URL = 'https://taskbe.sharda.co.in/api/agents'; 

const AgentPage = () => {
    const [activeTab, setActiveTab] = useState('list'); 
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    
    // States for Payout
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAgent, setPayoutAgent] = useState(null);

    const fetchAgents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            setAgents(response.data);
        } catch (err) {
            setError('Failed to fetch agents. Ensure Node.js server is running on port 1100 and backend is not crashing.');
            console.error('Fetch error:', err);
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
            setActiveTab('list');
        } catch (err) {
            alert('Error creating agent: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteAgent = async (id) => {
        if (window.confirm('Are you sure you want to delete this agent?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setAgents(agents.filter(agent => agent._id !== id));
                alert('Agent deleted successfully.');
            } catch (err) {
                alert('Error deleting agent: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleUpdateAgent = async (id, updatedData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, updatedData);
            setAgents(agents.map(agent => 
                agent._id === id ? response.data : agent
            ));
            return true; 
        } catch (err) {
            alert('Error updating agent: ' + (err.response?.data?.message || err.message));
            return false; 
        }
    };

    // New: Handler to open the Payout Modal
    const handleOpenPayoutModal = (agent) => {
        setPayoutAgent(agent);
        setShowPayoutModal(true);
    };

    // New: Handler to process Payout API call
    const handleProcessPayout = async (agentId, amount) => {
        try {
            // API कॉल to process payout
            const response = await axios.post(`${API_URL}/${agentId}/payout`, { 
                amount: parseFloat(amount) 
            });
            
            // UI अपडेट करें: एजेंट लिस्ट में बदले हुए एजेंट को अपडेट करें
            setAgents(agents.map(agent => 
                agent._id === agentId ? response.data : agent
            ));

            // Assuming Swal is available globally or imported
            alert(`Payout of ${amount} processed successfully!`); 
            setShowPayoutModal(false);

        } catch (err) {
            alert('Payout failed: ' + (err.response?.data?.message || err.message));
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-indigo-600 font-semibold text-lg">Loading Agents...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Connection Error</h2>
                    <p className="text-red-600 text-center mb-4">{error}</p>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                
                {/* 1. Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <User className="text-indigo-600" size={32} />
                            </div>
                            Agent Management
                        </h1>
                        <p className="text-gray-600 mt-2 ml-14">Manage agents, referrals, and commissions</p>
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-150"
                    >
                        <Plus size={20} />
                        Create Agent
                    </button>
                </div>

                {/* 2. Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="flex border-b border-gray-200">
                        
                        {/* List Button (First) */}
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'list'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Users size={20} />
                            Agents List
                        </button>
                        
                        {/* Referral Button (Second) */}
                        <button
                            onClick={() => setActiveTab('referral')}
                            className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'referral'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Gift size={20} />
                            Referrals
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'referral' && <Referrals agents={agents} />}
                        {activeTab === 'list' && 
                            <AgentList 
                                agents={agents} 
                                onDelete={handleDeleteAgent} 
                                onUpdate={handleUpdateAgent} 
                                onPay={handleOpenPayoutModal} 
                            />
                        }
                    </div>
                </div>
            </div>
            
            {/* 3. Create Agent Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50 ">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-fadeIn">
                        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Plus size={24} />
                                Create New Agent
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <CreateAgent onSubmit={handleCreateAgent} /> 
                        </div>
                    </div>
                </div>
            )}
            
            {/* 4. PAYOUT MODAL */}
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