// src/pages/Agent/PayoutModal.jsx (NEW FILE)

import React, { useState } from 'react';
import { X, Wallet, DollarSign } from 'lucide-react';

// Helper function (Duplicated for modal simplicity, adjust if centralized)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount || 0); 
};

const PayoutModal = ({ agent, onClose, onProcess }) => {
    const pendingAmount = (agent.totalEarned || 0) - (agent.paidTillDate || 0);
    
    // Default payout amount is the full pending amount
    const [payoutAmount, setPayoutAmount] = useState(pendingAmount > 0 ? pendingAmount : 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(payoutAmount);

        if (amount <= 0) {
            alert("Please enter a valid amount greater than zero.");
            return;
        }
        if (amount > pendingAmount) {
             if (!window.confirm(`Warning: The amount ${formatCurrency(amount)} exceeds the pending balance of ${formatCurrency(pendingAmount)}. Do you want to proceed?`)) {
                 return;
             }
        }
        
        // Call the parent handler
        onProcess(agent._id, amount);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900 bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-3xl w-full max-w-md overflow-hidden transform transition-all">
                
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-indigo-500">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet size={24} /> Process Payout
                    </h2>
                    <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2 text-center border-b pb-4">
                        <p className="text-gray-600 text-sm">Paying Agent:</p>
                        <h3 className="text-2xl font-extrabold text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-500">Referral Code: {agent.referralCode || 'N/A'}</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium text-red-800">Pending Balance:</span>
                        <span className="text-lg font-bold text-red-700">{formatCurrency(pendingAmount)}</span>
                    </div>

                    <div>
                        <label htmlFor="payoutAmount" className="block text-sm font-semibold text-gray-700 mb-1">
                            Amount to Pay (INR)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                id="payoutAmount"
                                value={payoutAmount}
                                onChange={(e) => setPayoutAmount(e.target.value)}
                                required
                                min="1"
                                className="w-full p-3 pl-8 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        >
                            <DollarSign size={18} /> Confirm Payout
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayoutModal;