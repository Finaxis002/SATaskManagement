// src/pages/Agent/AgentList.jsx (FINAL - Professional UI with Payout Button & Copy Feature)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Trash2, Edit, User, Mail, DollarSign, Copy, Check } from 'lucide-react'; 

// onPay prop added to trigger the Payout Modal from AgentPage
const AgentList = ({ agents = [], onDelete, onUpdate, onPay }) => { 
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);

  // Copy referral code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle case where agents array is empty (safety check: agents = [] handles undefined)
  if (agents.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <User size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-600 font-medium">No agents registered yet</p>
        <p className="text-sm text-gray-500 mt-2">Click "Create New Agent" to add your first agent</p>
      </div>
    );
  }
  
  // Helper to format currency (INR)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount || 0); 
  };
  
  const handleStatusChange = (agentId, newStatus) => {
    onUpdate(agentId, { status: newStatus });
  };
  
  const handleViewProfile = (agentId) => {
    navigate(`/agent/profile/${agentId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          All Agents ({agents.length})
        </h3>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral Code
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earned
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                    {/* Agent Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={12} /> {agent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Referral Code with Copy Button */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-mono font-semibold bg-indigo-100 text-indigo-800">
                          {agent.referralCode || 'N/A'}
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
                    
                    {/* Total Referrals */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                        {agent.referrals}
                      </span>
                    </td>
                    
                    {/* Total Earned */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(totalEarned)}
                    </td>
                    
                    {/* Paid Till Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                      {formatCurrency(paidTillDate)}
                    </td>
                    
                    {/* Pending Amount + Pay Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                      <div className="flex flex-col items-end">
                        <span className={pendingAmount > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>
                          {formatCurrency(pendingAmount)}
                        </span>
                        {pendingAmount > 0 && (
                          <button
                            onClick={() => onPay(agent)} // Calls handleOpenPayoutModal in AgentPage
                            className="mt-1 px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <DollarSign size={14} /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <select
                        value={agent.status}
                        onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${
                          agent.status === 'Active' 
                            ? 'bg-green-100 text-green-800 focus:ring-green-500' 
                            : 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewProfile(agent._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <User size={18} />
                        </button>
                        <button
                          onClick={() => alert(`Editing Agent ID: ${agent._id}`)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(agent._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
};

export default AgentList;