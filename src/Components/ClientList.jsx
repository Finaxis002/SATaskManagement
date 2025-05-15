// components/ClientList.jsx
import React from "react";
import { FaTrashAlt } from "react-icons/fa";

const ClientList = ({ clients, onDelete }) => {
  if (!clients || clients.length === 0) {
    return <p className="text-center text-gray-500">No clients found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client, index) => (
        <div
          key={index}
          className="bg-white flex justify-between items-center border border-gray-200 p-4 rounded-md shadow hover:shadow-md transition"
        >
          <div>
            <h3 className="text-lg font-semibold text-indigo-800">{client.name}</h3>
            <p className="text-sm text-gray-600">{client.contactPerson}</p>
            <p className="text-sm text-gray-600">{client.businessName}</p>
          </div>
          <button
            onClick={() => onDelete(client.name)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Delete Client"
          >
            <FaTrashAlt size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ClientList;
