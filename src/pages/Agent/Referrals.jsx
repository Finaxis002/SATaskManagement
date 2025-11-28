// src/pages/Agent/Referrals.jsx (Modified for _id)

import React from 'react';

const Referrals = ({ agents }) => {
  const totalReferrals = agents.reduce((sum, agent) => sum + agent.referrals, 0);

  // ... (JSX remains largely the same, only table key needs checking)

  return (
    <div className="bg-white p-6 rounded-lg border border-indigo-200">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-700">🎁 Agent Referral Status</h3>

      {/* ... Stat boxes (No change) ... */}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {/* ... Headers ... */}
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