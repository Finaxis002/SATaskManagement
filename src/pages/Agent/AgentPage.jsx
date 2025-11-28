// src/pages/Agent/AgentPage.jsx - FINAL VERSION (Fixed Tabs Order & Modal)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Plus, Gift, Users, X } from 'lucide-react'; 
import CreateAgent from './CreateAgent';
import Referrals from './Referrals';
import AgentList from './AgentList';

const API_URL = 'https://taskbe.sharda.co.in/api/agents'; 

const AgentPage = () => {
    const [activeTab, setActiveTab] = useState('list'); 
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const fetchAgents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            setAgents(response.data);
        } catch (err) {
            setError('Failed to fetch agents.');
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
    
    if (loading) return <div className="text-center p-10 text-indigo-600 font-bold">Loading Agents...</div>;
    if (error) return <div className="text-center p-10 text-red-600 font-bold">Error: {error}</div>;


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                
                {/* 1. Header with Create Button on the Right */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <User className="text-indigo-600" size={36} />
                            Agent Management System
                        </h1>
                        <p className="text-gray-600 mt-2">Manage agents, bank details, and referrals</p>
                    </div>
                    
                    {/* Create Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                    >
                        <Plus size={20} />
                        Create New Agent
                    </button>
                </div>

                {/* 2. Tabs (List and Referrals) */}
                <div className="bg-white rounded-lg shadow-lg mb-6">
                    <div className="flex border-b">
                        
                        {/* List Button (First) */}
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'list'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Users size={20} />
                            List of Agents
                        </button>
                        
                        {/* Referral Button (Second) */}
                        <button
                            onClick={() => setActiveTab('referral')}
                            className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'referral'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Gift size={20} />
                            Referrals
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'referral' && <Referrals agents={agents} />}
                        {activeTab === 'list' && <AgentList agents={agents} onDelete={handleDeleteAgent} onUpdate={handleUpdateAgent} />}
                    </div>
                </div>
            </div>
            
            {/* 3. Modal Component */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-indigo-700">Create New Agent</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <CreateAgent onSubmit={handleCreateAgent} /> 
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentPage;