import React from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

const role = localStorage.getItem("role");

const ClientList = ({ clients, onDelete, onEdit }) => {
  if (!clients || clients.length === 0) {
    return <p className="text-center text-gray-500">No clients found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {clients.map((client, index) => (
        <div
          key={index}
          className="bg-white grid grid-cols-[1fr_auto] items-start border border-gray-200 p-4 rounded-md shadow hover:shadow-md transition"
        >
          {/* Left Side */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-800 leading-snug break-words">
              {client.name}
            </h3>
            <p className="text-sm text-gray-600">{client.contactPerson}</p>
            <p className="text-sm text-gray-600">{client.businessName}</p>
          </div>

          {/* Right Side (Buttons aligned with name first line) */}
          <div className="flex gap-3 self-start mt-1">
            {role === "admin" && (
              <button
                onClick={() => onEdit(client)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Edit Client"
              >
                <FaEdit size={16} />
              </button>
            )}
            <button
              onClick={() => onDelete(client.name)}
              className="text-red-500 transition duration-200 transform 
             hover:text-red-700 hover:scale-110 hover:opacity-80 hover:shadow-md"
              title="Delete Client"
            >
              <FaTrashAlt size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientList;
