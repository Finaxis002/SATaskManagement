import React from "react";
import { FaEdit, FaTrash, FaHistory } from "react-icons/fa";

const ClientTableView = ({ clients, onEdit, onDelete }) => {
  const role = localStorage.getItem("role");

  // Function to handle Add Service and navigate to the correct page
  const handleAddService = (clientId) => {
    // Redirect to Add Service page with clientId
    window.location.href = `/add-service/${clientId}`;
  };

  // Function to handle Show Message History
  const handleShowHistory = (clientId) => {
    // Navigate to Message History page for the client
    window.location.href = `/message-history/${clientId}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b text-left">S.No</th>
            <th className="px-4 py-2 border-b text-left">Client Name</th>
            <th className="px-4 py-2 border-b text-left">Business Name</th>
            <th className="px-4 py-2 border-b text-left">Contact Person</th>
            <th className="px-4 py-2  border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, idx) => (
            <tr
              key={client.id}
              className={`hover:bg-indigo-50 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-2 border-b">{idx + 1}</td>
              <td className="px-4 py-2 border-b">{client.name}</td>
              <td className="px-4 py-2 border-b">{client.businessName}</td>
              <td className="px-4 py-2 border-b">{client.contactPerson}</td>
              <td className="px-4 py-2 border-b text-right">
                <div className="flex items-center  justify-end gap-3">
                  {role === "admin" && (
                    <button
                      onClick={() => onEdit(client)}
                      className="inline-flex items-center text-indigo-500 hover:text-indigo-800  pe-2"
                      title="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(client.name)}
                    className="inline-flex items-center text-red-500 hover:text-red-800 ml-1 mr-1 pe-2"
                    title="Delete"
                  >
                    <FaTrash size={16} />
                  </button>

                  {/* Add Service Button */}
                  <button
                    onClick={() => handleAddService(client.id)} // Redirect to Add Service page
                    className="inline-flex items-center text-cyan-600 hover:text-green-700"
                    title="Add Service"
                  >
                    <img
                      src="../service2.png"
                      alt="Add Service"
                      width={35}
                      height={35}
                      
                    />
                  </button>

                  {/* History Button */}
                  <button
                    onClick={() => handleShowHistory(client.id)} // Navigate to Message History page
                    className="inline-flex items-center text-green-600 hover:text-green-800 ml-1"
                    title="Show Message History "
                  >
                    <FaHistory size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTableView;
