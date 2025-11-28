// src/pages/Agent/AgentList.jsx (FINAL - Agent ID as Referral Code)

import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Trash2, Edit, User } from 'lucide-react'; 

const AgentList = ({ agents = [], onDelete, onUpdate }) => { 
  const navigate = useNavigate();

  if (agents.length === 0) {
    return (
      <div className="text-center p-10 border-dashed border-2 border-gray-300 rounded-lg">
        <p className="text-xl text-gray-500">No agents registered yet. Go to 'Create New Agent' button to add one.</p>
      </div>
    );
  }
  
  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount || 0); 
  };
  
  // Helper to shorten the ID for display
  const displayShortId = (id) => id ? `${id.substring(id.length - 6)}` : 'N/A'; // Last 6 characters

  const handleStatusChange = (agentId, newStatus) => {
    onUpdate(agentId, { status: newStatus });
  };
  
  const handleViewProfile = (agentId) => {
    navigate(`/agent/profile/${agentId}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-indigo-200 overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-700">👥 All Registered Agents ({agents.length})</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            
            {/* 🌟 Referral Code Header 🌟 */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID:</th>
            
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email ID</th>
            
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Refs</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earned</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Till Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {agents.map((agent) => {
            
            const totalEarned = agent.totalEarned || 0; 
            const paidTillDate = agent.paidTillDate || 0; 
            const pendingAmount = totalEarned - paidTillDate;
            
            // 🌟 Get the custom ID string 🌟
            const referralIdDisplay = `${displayShortId(agent._id)}`;

            return (
              <tr key={agent._id}>
                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{agent.name}</td>
                
                {/* 🌟 Referral Code Data (Displays custom ID format) 🌟 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium" title={agent._id}>
                  {referralIdDisplay} 
                </td>
                
                {/* Email ID Data */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={agent.email}>
                  {agent.email}
                </td>
                
                {/* Total Referrals */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{agent.referrals}</td>
                
                {/* Total Earned */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(totalEarned)}
                </td>
                
                {/* Paid Till Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                  {formatCurrency(paidTillDate)}
                </td>
                
                {/* Pending Amount */}
                <td 
                  className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                    pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(pendingAmount)}
                </td>
                
                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={agent.status}
                    onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                    className={`p-1 rounded-full text-xs font-semibold ${
                      agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewProfile(agent._id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="View Profile"
                  >
                    <User size={18} />
                  </button>
                  <button
                    onClick={() => alert(`Editing Agent ID: ${agent._id}`)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    title="Edit Details"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(agent._id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Delete Agent"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AgentList;