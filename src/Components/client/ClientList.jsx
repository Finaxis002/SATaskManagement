import React from "react";
import { FaTrashAlt, FaEdit, FaHistory } from "react-icons/fa";

const ClientList = ({ clients, onDelete, onEdit }) => {
  const role = localStorage.getItem("role");

  const handleAddService = (clientId) => {
    window.location.href = `/add-service/${clientId}`;
  };

  const handleShowHistory = (clientId) => {
    window.location.href = `/message-history/${clientId}`;
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-gray-300 text-8xl mb-6">👥</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Clients Yet</h3>
        <p className="text-gray-500 text-center max-w-md">
          Start building your client database by adding your first client
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {clients.map((client, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">
                Client #{index + 1}
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
              <FaTrashAlt size={16} />
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
  );
};

export default ClientList;