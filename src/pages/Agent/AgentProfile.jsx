// src/pages/Agent/AgentProfile.jsx (FINAL - Metrics Included + Transaction Table)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, Phone, MapPin, DollarSign, Banknote, Users, TrendingUp, Calendar, Zap } from 'lucide-react'; 

const API_URL = 'https://taskbe.sharda.co.in/api/agents'; 
const API_TRANSACTIONS = (agentId) => `${API_URL}/${agentId}/transactions`; 

const AgentProfile = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [transactions, setTransactions] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAgentData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Agent Details
                const agentRes = await axios.get(`${API_URL}/${agentId}`);
                setAgent(agentRes.data);
                
                // 2. Fetch Transactions (Real API call)
                const transRes = await axios.get(API_TRANSACTIONS(agentId));
                setTransactions(transRes.data);

            } catch (err) {
                setError('Failed to load agent data or transactions. Ensure API is configured correctly.');
                console.error('Fetch error:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (agentId) {
            fetchAgentData();
        }
    }, [agentId]);

    if (loading) return <div className="p-8 text-center text-indigo-600 font-bold">Loading Agent Profile...</div>;
    if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
    if (!agent) return <div className="p-8 text-center text-gray-600">No agent data found.</div>;

    const bankDetails = agent.bankDetails || {};
    const hasBankDetails = bankDetails.bankName || bankDetails.accountNumber;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount || 0); 
    };
    
    // Calculate Pending Amount 
    const totalEarned = agent.totalEarned || 0;
    const paidTillDate = agent.paidTillDate || 0;
    const pendingAmount = totalEarned - paidTillDate;


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8">
                
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
                        
                        {/* Display Referral Code */}
                        <p className="text-lg font-bold text-indigo-600 mt-1">
                            Referral Code: {agent.referralCode || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Internal ID: {agentId}
                        </p>
                    </div>
                </div>

                {/* Financial and Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    
                    {/* Total Earned Card */}
                    <MetricCard 
                        icon={Zap} 
                        label="Total Earned" 
                        value={formatCurrency(totalEarned)}
                        color="bg-yellow-50"
                        iconColor="text-yellow-600"
                    />

                    {/* Paid Till Date Card */}
                    <MetricCard 
                        icon={DollarSign} 
                        label="Paid Till Date" 
                        value={formatCurrency(paidTillDate)}
                        color="bg-green-50"
                        iconColor="text-green-600"
                    />
                    
                    {/* Pending Amount Card */}
                    <MetricCard 
                        icon={Banknote} 
                        label="Pending Amount" 
                        value={formatCurrency(pendingAmount)}
                        color={pendingAmount > 0 ? "bg-red-50" : "bg-gray-50"}
                        iconColor={pendingAmount > 0 ? "text-red-600" : "text-gray-600"}
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

                {/* Main Details & Bank */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Contact and Status */}
                    <div className="space-y-4 md:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-y-4">
                            <DetailItem icon={Mail} label="Email" value={agent.email} />
                            <DetailItem icon={Phone} label="Phone" value={agent.phone} />
                            <DetailItem icon={MapPin} label="City" value={agent.city || 'Not Specified'} />
                            <DetailItem icon={TrendingUp} label="Status" value={agent.status} statusColor={agent.status === 'Active' ? 'text-green-600' : 'text-red-600'} />
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 md:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Bank Details</h2>
                        {hasBankDetails ? (
                            <>
                                <DetailItem icon={Banknote} label="Bank Name" value={bankDetails.bankName || 'N/A'} />
                                <DetailItem label="Account No." value={bankDetails.accountNumber || 'N/A'} />
                                <DetailItem label="IFSC Code" value={bankDetails.ifsc || 'N/A'} />
                            </>
                        ) : (
                            <p className="text-gray-500 italic">Bank details are not yet provided.</p>
                        )}
                    </div>
                </div>

                {/* Transaction History Table */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar size={24} className="text-indigo-600"/> Payment History & Commissions
                    </h2>
                    
                    <TransactionTable transactions={transactions} formatCurrency={formatCurrency} />
                </div>
            </div>
        </div>
    );
};

// **********************************************
// ************ Helper Components ***************
// **********************************************

const DetailItem = ({ icon: Icon, label, value, statusColor }) => (
    <div className="flex items-start">
        {Icon && <Icon size={20} className={`mt-1 mr-3 ${statusColor || 'text-indigo-500'}`} />}
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={`text-lg font-bold text-gray-800 ${statusColor}`}>{value}</p>
        </div>
    </div>
);

const MetricCard = ({ icon: Icon, label, value, color, iconColor }) => (
    <div className={`p-5 rounded-lg shadow-md flex items-center justify-between ${color} border border-gray-200`}>
        <div className="relative w-full">
            <div className="text-sm font-medium text-gray-600">{label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
        <div className={`p-3 rounded-full ${iconColor} bg-opacity-20 flex-shrink-0 ml-4`}>
            <Icon size={24} className={iconColor} />
        </div>
    </div>
);


const TransactionTable = ({ transactions, formatCurrency }) => {
    if (transactions.length === 0) {
        return <p className="text-gray-500 p-4 border rounded">No commission records found yet.</p>;
    }

    return (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Project Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Comm. (%)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((t) => (
                        <tr key={t.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{t.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(t.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{t.percentage}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">{formatCurrency(t.commission)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    t.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {t.paid ? 'Paid' : 'Pending'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString() : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default AgentProfile;