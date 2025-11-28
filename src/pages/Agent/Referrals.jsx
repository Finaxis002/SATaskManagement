// src/pages/Agent/Referrals.jsx (FINAL - agents = [] Fix)

import React from 'react';

const Referrals = ({ agents = [] }) => { // 👈 FIX: agents = []
  const totalReferrals = agents.reduce((sum, agent) => sum + agent.referrals, 0);

  return (
    <div className="bg-white p-6 rounded-lg border border-indigo-200">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-700">🎁 Agent Referral Status</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
          <p className="text-sm font-medium text-green-700">Total Registered Agents</p>
          <p className="text-3xl font-bold text-green-900">{agents.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
          <p className="text-sm font-medium text-blue-700">Total Referrals Across All Agents</p>
          <p className="text-3xl font-bold text-blue-900">{totalReferrals}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
          <p className="text-sm font-medium text-yellow-700">Average Referrals per Agent</p>
          <p className="text-3xl font-bold text-yellow-900">
            {agents.length > 0 ? (totalReferrals / agents.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.referrals}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Referrals;