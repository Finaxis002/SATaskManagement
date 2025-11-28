// src/pages/Agent/AgentProfile.jsx (FINAL - Metrics Included)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, Phone, MapPin, DollarSign, Banknote, Users, TrendingUp } from 'lucide-react'; 

const API_URL = 'https://taskbe.sharda.co.in/api/agents'; 

const AgentProfile = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAgentDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/${agentId}`);
                setAgent(response.data);
            } catch (err) {
                setError('Failed to load agent profile or agent not found.');
                console.error('Fetch profile error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (agentId) {
            fetchAgentDetails();
        }
    }, [agentId]);

    if (loading) return <div className="p-8 text-center text-indigo-600 font-bold">Loading Agent Profile...</div>;
    if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
    if (!agent) return <div className="p-8 text-center text-gray-600">No agent data found.</div>;

    const bankDetails = agent.bankDetails || {};
    const hasBankDetails = bankDetails.bankName || bankDetails.accountNumber;

    // Helper function to format currency (INR)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition duration-150"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Agents List
                </button>

                {/* Profile Header */}
                <div className="border-b pb-4 mb-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="text-indigo-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">{agent.name}</h1>
                        <p className="text-sm text-gray-500">Agent ID: {agentId}</p>
                    </div>
                </div>

                {/* Financial and Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    
                    {/* Paid Till Date Card */}
                    <MetricCard 
                        icon={DollarSign} 
                        label="Paid Till Date" 
                        value={formatCurrency(agent.paidTillDate || 0)}
                        color="bg-green-50"
                        iconColor="text-green-600"
                    />

                    {/* Clients Referred Card */}
                    <MetricCard 
                        icon={Users} 
                        label="Clients Referred" 
                        value={`${agent.referrals || 0} Clients`}
                        color="bg-blue-50"
                        iconColor="text-blue-600"
                    />
                </div>
                {/* END: Metrics */}

                {/* Main Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact and Status */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Personal Information</h2>
                        <DetailItem icon={Mail} label="Email" value={agent.email} />
                        <DetailItem icon={Phone} label="Phone" value={agent.phone} />
                        <DetailItem icon={MapPin} label="City" value={agent.city || 'Not Specified'} />
                        <DetailItem icon={TrendingUp} label="Status" value={agent.status} statusColor={agent.status === 'Active' ? 'text-green-600' : 'text-red-600'} />
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Bank Details</h2>
                        {hasBankDetails ? (
                            <>
                                <DetailItem icon={Banknote} label="Bank Name" value={bankDetails.bankName || 'N/A'} />
                                <DetailItem label="Account No." value={bankDetails.accountNumber || 'N/A'} />
                                <DetailItem label="IFSC Code" value={bankDetails.ifsc || 'N/A'} />
                            </>
                        ) : (
                            <p className="text-gray-500 italic">Bank details are not yet provided for this agent.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for detail items
const DetailItem = ({ icon: Icon, label, value, statusColor }) => (
    <div className="flex items-start">
        {Icon && <Icon size={20} className={`mt-1 mr-3 ${statusColor || 'text-indigo-500'}`} />}
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={`text-lg font-bold text-gray-800 ${statusColor}`}>{value}</p>
        </div>
    </div>
);

// Helper component for highlight cards
const MetricCard = ({ icon: Icon, label, value, color, iconColor }) => (
    <div className={`p-5 rounded-lg shadow-md flex items-center justify-between ${color} border border-gray-200`}>
        <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconColor} bg-opacity-20`}>
            <Icon size={24} className={iconColor} />
        </div>
    </div>
);

export default AgentProfile;