import { FaTrashAlt, FaEdit, FaPlus, FaHistory } from "react-icons/fa"; // Import FaHistory for history button
import { useNavigate } from "react-router-dom";

const role = localStorage.getItem("role");

const ClientList = ({ clients, onDelete, onEdit }) => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Function to handle Add Service and navigate to the correct page
  const handleAddService = (clientId) => {
    navigate(`/add-service/${clientId}`); // Redirect to Add Service page with clientId
  };

  // Function to handle Show Message History
  const handleShowHistory = (clientId) => {
    navigate(`/message-history/${clientId}`); // Navigate to Message History page for the client
  };

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
          <div className="flex gap-3">
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
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Delete Client"
            >
              <FaTrashAlt size={16} />
            </button>

            {/* Add Service Button */}
            <button
              onClick={() => handleAddService(client.id)} // Redirect to Add Service page
              className="text-cyan-600 hover:text-green-700 transition-colors hover:cursor-pointer"
              title="Add Service"
            >
              <img src="../service2.png" alt="Add Service" width={25} height={25} style={{ backgroundColor: "light-blue" }} />
            </button>

            {/* History Button */}
            <button
              onClick={() => handleShowHistory(client.id)} // Navigate to Message History page
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Show Message History"
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
