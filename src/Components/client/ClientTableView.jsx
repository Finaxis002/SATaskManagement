import React from "react";
import { FaEdit, FaTrash, FaHistory } from "react-icons/fa";

const ClientTableView = ({ clients, onEdit, onDelete }) => {
  const role = localStorage.getItem("role");

  const handleAddService = (clientId) => {
    window.location.href = `/add-service/${clientId}`;
  };

  const handleShowHistory = (clientId) => {
    window.location.href = `/message-history/${clientId}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: "#4332d2" }}>
            <tr>
              <th className="px-2 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-12">
                S.No
              </th>
              <th className="px-2 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-2 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Business Name
              </th>
              <th className="px-2 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client, idx) => (
              <tr
                key={client.id}
                className={`transition-all duration-200 hover:bg-purple-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {idx + 1}
                </td>
                <td className="px-2 py-3">
                  <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                    {client.name}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {client.businessName}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {client.contactPerson}
                  </div>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    {role === "admin" && (
                      <button
                        onClick={() => onEdit(client)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:shadow-md"
                        title="Edit Client"
                      >
                        <FaEdit size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(client.name)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:shadow-md"
                      title="Delete Client"
                    >
                      <FaTrash size={14} />
                    </button>
                    <button
                      onClick={() => handleAddService(client.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-all duration-200 hover:shadow-md overflow-hidden"
                      title="Add Service"
                    >
                      <img
                        src="../service2.png"
                        alt="Add Service"
                        className="w-5 h-5 object-contain"
                      />
                    </button>
                    <button
                      onClick={() => handleShowHistory(client.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 hover:shadow-md"
                      title="Show Message History"
                    >
                      <FaHistory size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden p-4 space-y-4">
        {clients.map((client, idx) => (
          <div
            key={client.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Client #{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {client.name}
                </h3>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Business:</span>
                <span className="ml-2 text-gray-900">
                  {client.businessName}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Contact:</span>
                <span className="ml-2 text-gray-900">
                  {client.contactPerson}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              {role === "admin" && (
                <button
                  onClick={() => onEdit(client)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                  title="Edit"
                >
                  <FaEdit size={16} />
                </button>
              )}
              <button
                onClick={() => onDelete(client.name)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                title="Delete"
              >
                <FaTrash size={16} />
              </button>
              <button
                onClick={() => handleAddService(client.id)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-all duration-200"
                title="Add Service"
              >
                <img
                  src="../service2.png"
                  alt="Add Service"
                  className="w-6 h-6 object-contain"
                />
              </button>
              <button
                onClick={() => handleShowHistory(client.id)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200"
                title="Show History"
              >
                <FaHistory size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <p className="text-gray-500 text-lg font-medium">No clients found</p>
          <p className="text-gray-400 text-sm mt-1">
            Add your first client to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientTableView;
