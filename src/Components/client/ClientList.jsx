import React, { useState } from "react";
import {
  FaTrashAlt,
  FaEdit,
  FaHistory,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const ClientList = ({ clients, onDelete, onEdit }) => {
  const role = localStorage.getItem("role");

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const totalClients = clients ? clients.length : 0;
  const totalPages = Math.ceil(totalClients / itemsPerPage);

  const indexOfLastClient = currentPage * itemsPerPage;
  const indexOfFirstClient = indexOfLastClient - itemsPerPage;

  const mobileClients = clients.slice(indexOfFirstClient, indexOfLastClient);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAddService = (clientId) => {
    window.location.href = `/add-service/${clientId}`;
  };

  const handleShowHistory = (clientId) => {
    window.location.href = `/message-history/${clientId}`;
  };

  if (!clients || clients.length === 0) {
    // ... (No Clients UI)
  }

  return (
    <div className="mb-12">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-2 sm:hidden">
          {mobileClients.map((client, index) => (
            <ClientCard
              key={client.id}
              client={client}
              index={indexOfFirstClient + index + 1}
              onDelete={onDelete}
              onEdit={onEdit}
              role={role}
              handleAddService={handleAddService}
              handleShowHistory={handleShowHistory}
            />
          ))}
        </div>

        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clients.map((client, index) => (
            <ClientCard
              key={client.id}
              client={client}
              index={index + 1}
              onDelete={onDelete}
              onEdit={onEdit}
              role={role}
              handleAddService={handleAddService}
              handleShowHistory={handleShowHistory}
            />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 sm:hidden">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentPage === 1
                ? "text-gray-700 bg-gray-100 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <FaArrowLeft className="mr-2" size={14} />
            Previous
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentPage === totalPages
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Next
            <FaArrowRight className="ml-2" size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const ClientCard = ({
  client,
  index,
  onDelete,
  onEdit,
  role,
  handleAddService,
  handleShowHistory,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="text-xs text-gray-500 mb-1">Client #{index}</div>
        <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
      </div>
    </div>

    <div className="space-y-2 mb-4 text-sm">
      <div>
        <span className="text-gray-500">Business::</span>
        <span className="ml-2 text-gray-900">{client.businessName}</span>
      </div>
      <div>
        <span className="text-gray-500">Contact::</span>
        <span className="ml-2 text-gray-900">{client.contactPerson}</span>
      </div>
    </div>

    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
      {role === "admin" && (
        <>
          <button
            onClick={() => onEdit(client)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(client.name)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
            title="Delete"
          >
            <FaTrashAlt size={16} />
          </button>
        </>
      )}
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
);

export default ClientList;