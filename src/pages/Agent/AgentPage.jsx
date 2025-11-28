// src/pages/Agent/AgentList.jsx (UPDATED - ID Column Removed)

import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Trash2, Edit, User } from 'lucide-react'; 

const AgentList = ({ agents, onDelete, onUpdate }) => {
  const navigate = useNavigate();

  if (agents.length === 0) {
    return (
      <div className="text-center p-10 border-dashed border-2 border-gray-300 rounded-lg">
        <p className="text-xl text-gray-500">No agents registered yet. Go to 'Create New Agent' tab to add one.</p>
      </div>
    );
  }

  const handleStatusChange = (agentId, newStatus) => {
    onUpdate(agentId, { status: newStatus });
  };
  
  const handleViewProfile = (agentId) => {
    navigate(`/agent/profile/${agentId}`);
  };

  // displayId function is no longer needed but kept for cleanliness if ID is ever used elsewhere.
  // const displayId = (id) => `${id.substring(0, 4)}...${id.substring(id.length - 4)}`; 

  return (
    <div className="bg-white p-6 rounded-lg border border-indigo-200 overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-700">👥 All Registered Agents ({agents.length})</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* ❌ ID Header Removed ❌ */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {agents.map((agent) => (
            <tr key={agent._id}>
              {/* ❌ ID Data Cell Removed ❌ 
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={agent._id}>{displayId(agent._id)}</td>
              */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {agent.email}
                <br />
                {agent.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{agent.referrals}</td>
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
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                
                {/* 1. View Profile Button */}
                <button
                  onClick={() => handleViewProfile(agent._id)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  title="View Profile"
                >
                  <User size={18} />
                </button>
                
                {/* 2. Edit Button */}
                <button
                  onClick={() => alert(`Editing Agent ID: ${agent._id}`)}
                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                  title="Edit Details"
                >
                  <Edit size={18} />
                </button>
                
                {/* 3. Delete Button */}
                <button
                  onClick={() => onDelete(agent._id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  title="Delete Agent"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgentList;