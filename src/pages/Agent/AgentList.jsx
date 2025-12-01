// src/pages/Agent/AgentList.jsx (FINAL - Fully Responsive: Mobile/Tablet/Desktop)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Trash2, Edit, User, Mail, DollarSign, Copy, Check } from 'lucide-react'; 

const AgentList = ({ agents = [], onDelete, onUpdate, onPay }) => { 
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);

  // Copy referral code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle case where agents array is empty
  if (agents.length === 0) {
    return (
      <div className="text-center p-8 sm:p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <User size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-base sm:text-lg text-gray-600 font-medium">No agents registered yet</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">Click "Create New Agent" to add your first agent</p>
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
    <div className="space-y-4 px-2 sm:px-0">
      {/* Header - Responsive */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          All Agents ({agents.length})
        </h3>
      </div>

      {/* Desktop & Large Tablet Table View (lg and above) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Details
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral Code
                </th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earned
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 xl:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 xl:ml-4">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={12} /> {agent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Referral Code with Copy Button */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 xl:px-3 py-1 rounded-md text-xs xl:text-sm font-mono font-semibold bg-indigo-100 text-indigo-800">
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
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                        {agent.referrals}
                      </span>
                    </td>
                    
                    {/* Total Earned */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(totalEarned)}
                    </td>
                    
                    {/* Paid Till Date */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-right text-green-600 font-medium">
                      {formatCurrency(paidTillDate)}
                    </td>
                    
                    {/* Pending Amount + Pay Button */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm text-right font-semibold">
                      <div className="flex flex-col items-end">
                        <span className={pendingAmount > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>
                          {formatCurrency(pendingAmount)}
                        </span>
                        {pendingAmount > 0 && (
                          <button
                            onClick={() => onPay(agent)}
                            className="mt-1 px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <DollarSign size={14} /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center">
                      <select
                        value={agent.status}
                        onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                        className={`px-2.5 xl:px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${
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
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5 xl:gap-2">
                        <button
                          onClick={() => handleViewProfile(agent._id)}
                          className="p-1.5 xl:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <User size={18} />
                        </button>
                        <button
                          onClick={() => alert(`Editing Agent ID: ${agent._id}`)}
                          className="p-1.5 xl:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(agent._id)}
                          className="p-1.5 xl:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Tablet Compact Table View (md to lg) */}
      <div className="hidden md:block lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Refs
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Earned
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Pending
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-xs">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <select
                            value={agent.status}
                            onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                            className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                              agent.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-mono font-semibold text-indigo-800">
                          {agent.referralCode || 'N/A'}
                        </span>
                        {agent.referralCode && (
                          <button
                            onClick={() => handleCopyCode(agent.referralCode)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            {copiedCode === agent.referralCode ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {agent.referrals}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 text-right">
                      <div className="text-xs font-semibold text-gray-900">{formatCurrency(totalEarned)}</div>
                      <div className="text-xs text-green-600 mt-0.5">{formatCurrency(paidTillDate)}</div>
                    </td>
                    
                    <td className="px-4 py-3 text-right">
                      <div className={`text-xs font-bold ${pendingAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatCurrency(pendingAmount)}
                      </div>
                      {pendingAmount > 0 && (
                        <button
                          onClick={() => onPay(agent)}
                          className="mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewProfile(agent._id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <User size={16} />
                        </button>
                        <button
                          onClick={() => alert(`Editing Agent ID: ${agent._id}`)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(agent._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
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

      {/* Mobile Card View (sm and below) */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {agents.map((agent) => {
          const totalEarned = agent.totalEarned || 0; 
          const paidTillDate = agent.paidTillDate || 0; 
          const pendingAmount = totalEarned - paidTillDate;

          return (
            <div key={agent._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4">
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-base sm:text-lg">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{agent.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <Mail size={11} className="flex-shrink-0" /> 
                      <span className="truncate">{agent.email}</span>
                    </div>
                  </div>
                </div>
                
                {/* Status Badge */}
                <select
                  value={agent.status}
                  onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                  className={`flex-shrink-0 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                    agent.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Referral Code */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1 font-medium">Referral Code</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono font-semibold bg-indigo-100 text-indigo-800 flex-1 justify-center">
                    {agent.referralCode || 'N/A'}
                  </span>
                  {agent.referralCode && (
                    <button
                      onClick={() => handleCopyCode(agent.referralCode)}
                      className="flex-shrink-0 p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode === agent.referralCode ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">Referrals</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800">{agent.referrals}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-gray-600 font-medium mb-1">Total Earned</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 truncate">{formatCurrency(totalEarned)}</div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-2.5 sm:p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">Paid</div>
                  <div className="text-base sm:text-lg font-bold text-green-700 truncate">{formatCurrency(paidTillDate)}</div>
                </div>
                <div className={`rounded-lg p-2.5 sm:p-3 ${pendingAmount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`text-xs font-medium mb-1 ${pendingAmount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    Pending
                  </div>
                  <div className={`text-base sm:text-lg font-bold truncate ${pendingAmount > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                    {formatCurrency(pendingAmount)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {pendingAmount > 0 && (
                  <button
                    onClick={() => onPay(agent)}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <DollarSign size={16} /> Pay Now
                  </button>
                )}
                <button
                  onClick={() => handleViewProfile(agent._id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Profile"
                >
                  <User size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => alert(`Editing Agent ID: ${agent._id}`)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => onDelete(agent._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentList;