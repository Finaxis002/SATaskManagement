import React from "react";
import { FaTrashAlt, FaEdit, FaHistory, FaUser, FaBuilding } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ClientList = ({ clients, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleAddService = (clientId) => {
    navigate(`/add-service/${clientId}`);
  };

  const handleShowHistory = (clientId) => {
    navigate(`/message-history/${clientId}`);
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
          className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-1 group"
        >
          {/* Card Header with Purple */}
          <div style={{backgroundColor: '#4332d2'}} className="h-2"></div>
          
          <div className="p-5">
            {/* Client Name with Icon */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div style={{backgroundColor: '#e0dcf9', color: '#4332d2'}} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                    <FaUser size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 truncate transition-colors" style={{'--hover-color': '#4332d2'}} onMouseEnter={(e) => e.currentTarget.style.color = '#4332d2'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                    {client.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-2 mb-4">
              {client.contactPerson && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaUser size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{client.contactPerson}</span>
                </div>
              )}
              {client.businessName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaBuilding size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{client.businessName}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              {role === "admin" && (
                <button
                  onClick={() => onEdit(client)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                  title="Edit Client"
                >
                  <FaEdit size={16} />
                </button>
              )}
              <button
                onClick={() => onDelete(client.name)}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                title="Delete Client"
              >
                <FaTrashAlt size={16} />
              </button>
              <button
                onClick={() => handleAddService(client.id)}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 overflow-hidden"
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
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                title="Show Message History"
              >
                <FaHistory size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientList;