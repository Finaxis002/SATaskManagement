import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, Phone, MapPin, DollarSign, Banknote, Users, TrendingUp, Calendar, Download, Filter, Search, X } from 'lucide-react';

const API_URL = 'https://taskbe.sharda.co.in/api/agents';
const API_TRANSACTIONS = (agentId) => `${API_URL}/${agentId}/transactions`;

const AgentProfile = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchAgentData = async () => {
            setLoading(true);
            try {
                const agentRes = await axios.get(`${API_URL}/${agentId}`);
                setAgent(agentRes.data);
                
                const transRes = await axios.get(API_TRANSACTIONS(agentId));
                setTransactions(transRes.data);
                setFilteredTransactions(transRes.data);
            } catch (err) {
                setError('Failed to load agent data or transactions.');
                console.error('Fetch error:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (agentId) {
            fetchAgentData();
        }
    }, [agentId]);

    useEffect(() => {
        let filtered = transactions;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(t => 
                filterStatus === 'paid' ? t.paid : !t.paid
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(t => 
                t.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTransactions(filtered);
    }, [searchTerm, filterStatus, transactions]);

    const downloadReport = () => {
        const headers = ['Date', 'Client Name', 'Project Amount', 'Commission %', 'Commission', 'Status', 'Payment Date'];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.clientName,
            t.amount,
            t.percentage,
            t.commission,
            t.paid ? 'Paid' : 'Pending',
            t.paymentDate ? new Date(t.paymentDate).toLocaleDateString() : 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agent?.name}_transactions.csv`;
        a.click();
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
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Data</h3>
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
    const hasBankDetails = bankDetails.bankName || bankDetails.accountNumber;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
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
                                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{agent.name}</h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                                        Code: {agent.referralCode || 'N/A'}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        agent.status === 'Active' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {agent.status}
                                    </span>
                                    <span className="text-sm text-slate-500">ID: {agentId}</span>
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
                        gradient={pendingAmount > 0 ? "from-orange-500 to-red-600" : "from-slate-400 to-slate-500"}
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
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem icon={Mail} label="Email" value={agent.email} />
                            <InfoItem icon={Phone} label="Phone" value={agent.phone} />
                            <InfoItem icon={MapPin} label="City" value={agent.city || 'Not Specified'} />
                            <InfoItem icon={Users} label="Referrals" value={`${agent.referrals || 0} Clients`} />
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Bank Details</h2>
                        {hasBankDetails ? (
                            <div className="space-y-4">
                                <InfoItem icon={Banknote} label="Bank Name" value={bankDetails.bankName || 'N/A'} />
                                <InfoItem label="Account Number" value={bankDetails.accountNumber || 'N/A'} />
                                <InfoItem label="IFSC Code" value={bankDetails.ifsc || 'N/A'} />
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No bank details available</p>
                        )}
                    </div>
                </div>

                {/* Transactions Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <Calendar size={24} className="text-indigo-600"/>
                            Payment History
                        </h2>
                        <button
                            onClick={downloadReport}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                        >
                            <Download size={18} />
                            Download Report
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by client name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <FilterButton 
                                active={filterStatus === 'all'} 
                                onClick={() => setFilterStatus('all')}
                            >
                                All
                            </FilterButton>
                            <FilterButton 
                                active={filterStatus === 'paid'} 
                                onClick={() => setFilterStatus('paid')}
                            >
                                Paid
                            </FilterButton>
                            <FilterButton 
                                active={filterStatus === 'pending'} 
                                onClick={() => setFilterStatus('pending')}
                            >
                                Pending
                            </FilterButton>
                        </div>
                    </div>

                    <TransactionTable transactions={filteredTransactions} formatCurrency={formatCurrency} />
                </div>
            </div>
        </div>
    );
};

// Components
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

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        {Icon && (
            <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
                <Icon size={18} className="text-slate-600" />
            </div>
        )}
        <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-900 break-words">{value}</p>
        </div>
    </div>
);

const FilterButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
    >
        {children}
    </button>
);

const TransactionTable = ({ transactions, formatCurrency }) => {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-medium">No transactions found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    const MobileCard = ({ transaction }) => (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-1">{transaction.clientName}</p>
                    <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    transaction.paid 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                }`}>
                    {transaction.paid ? 'Paid' : 'Pending'}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Project Amount</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(transaction.amount)}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Commission</p>
                    <p className="font-semibold text-emerald-600">{formatCurrency(transaction.commission)}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Rate</p>
                    <p className="font-semibold text-slate-900">{transaction.percentage}%</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Payment Date</p>
                    <p className="font-semibold text-slate-900">
                        {transaction.paymentDate ? new Date(transaction.paymentDate).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile View */}
            <div className="block lg:hidden space-y-3">
                {transactions.map((t) => (
                    <MobileCard key={t.id} transaction={t} />
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Client Name</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Project Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Rate</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Commission</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {new Date(t.date).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    {t.clientName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">
                                    {formatCurrency(t.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">
                                    {t.percentage}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-emerald-600">
                                    {formatCurrency(t.commission)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        t.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {t.paid ? 'Paid' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                                    {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString('en-IN') : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AgentProfile;