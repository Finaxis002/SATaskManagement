import React, { useEffect, useState } from "react";
import axios from "../utils/secureAxios";
import { FaPlus, FaThLarge, FaTable } from "react-icons/fa";
import Swal from "sweetalert2";
import ClientList from "../Components/client/ClientList";
import CreateClientModal from "../Components/client/CreateClientModal";
import ClientTableView from "../Components/client/ClientTableView";


const Clients = () => {
    const [clients, setClients] = useState([]);
    // 🌟 NEW 1: State to hold Agent data 🌟
    const [agents, setAgents] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [showClientModal, setShowClientModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [viewMode, setViewMode] = useState("table");

    // ********** Agent Fetch Function **********
    const fetchAgents = async () => {
        try {
            // Note: Assuming /agents is your correct API endpoint (adjust if needed)
            const res = await axios.get("/agents"); 
            setAgents(res.data);
            console.log("Agents fetched for referrer dropdown:", res.data.length);
        } catch (err) {
            console.error("Failed to fetch agents for dropdown", err);
            // Non-critical error, continue loading clients
        }
    };
    
    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/clients");
            const data = res.data;

            const formattedClients = Array.isArray(data)
                ? data.map((client) => ({
                    id: client._id,
                    name: client.name,
                    contactPerson: client.contactPerson || "-",
                    businessName: client.businessName || "-",
                    address: client.address || "",
                    mobile: client.mobile || "",
                    emailId: client.emailId || "",
                    GSTIN: client.GSTIN || "",
                    referrer: client.referrer || "",
                    // referrer: client.referrer || "", // Ensure referrer is included if needed for editing
                  }))
                : [];

            setClients(formattedClients);
        } catch (err) {
            console.error("Failed to fetch clients", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load clients. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch both Clients and Agents when the component mounts
        fetchClients();
        fetchAgents(); // 🌟 NEW 2: Fetch Agents when component mounts 🌟
    }, []);

    const handleDeleteClient = async (clientName) => {
        const result = await Swal.fire({
            title: `Delete "${clientName}"?`,
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete("/clients", {
                data: { name: clientName },
            });
            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: `Client "${clientName}" was deleted successfully.`,
                timer: 2000,
                showConfirmButton: false,
            });
            fetchClients(); // refresh list
        } catch (err) {
            console.error("Delete failed", err);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Failed to delete client. Please try again.",
            });
        }
    };

    const handleEditClient = (client) => {
        setEditingClient(client); // Set client to edit
        setShowClientModal(true); // Open modal
    };

    return (
        <div className="p-5 bg-gray-100 min-h-screen">
            <div className="flex items-center justify-between mb-6 px-1 py-3 border-b border-gray-200">
                {/* Title with subtle decoration */}
                <div className="flex items-center">
                    <h1 className="text-2xl font-semibold text-gray-800 relative pl-3">
                        Client Overview
                        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-full"></span>
                    </h1>
                </div>

                {/* Controls container */}
                <div className="flex items-center gap-4">
                    {/* View toggle buttons */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <div className=" bg-gray-100 p-1 rounded-lg hidden sm:flex">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-2 rounded-md transition-all duration-200 ${
                                    viewMode === "table"
                                        ? "bg-white shadow-sm text-indigo-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                title="Table View"
                            >
                                <FaTable size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("card")}
                                className={`p-2 rounded-md transition-all duration-200 ${
                                    viewMode === "card"
                                        ? "bg-white shadow-sm text-indigo-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                title="Card View"
                            >
                                <FaThLarge size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Add Client button */}
                    <button
                        onClick={() => {
                            setEditingClient(null); // Ensure we are not in edit mode when adding
                            setShowClientModal(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <FaPlus className="text-sm" />
                        <span className="text-sm font-medium">Add Client</span>
                    </button>
                </div>
            </div>

            {/* Conditional Rendering: Loading, No Clients, or Client List/Table */}
            {loading ? (
                <div className="flex items-center justify-center h-[250px]">
                    <svg
                        className="animate-spin h-8 w-8 text-indigo-500"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                        ></path>
                    </svg>
                    <span className="ml-3 text-indigo-600 font-semibold">
                        Loading Clients...
                    </span>
                </div>
            ) : clients.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-center text-gray-500">No clients found.</p>
                </div>
            ) : (
                <div className="space-y-6 mx-auto">
                    {viewMode === "card" ? (
                        <ClientList
                            clients={clients}
                            onDelete={handleDeleteClient}
                            onEdit={handleEditClient}
                        />
                    ) : (
                        <ClientTableView
                            clients={clients}
                            onEdit={handleEditClient}
                            onDelete={handleDeleteClient}
                        />
                    )}
                </div>
            )}

            {/* Create/Edit Client Modal */}
            {showClientModal && (
                <CreateClientModal
                    client={editingClient} // Pass the client being edited or null
                    agents={agents}
                    onClose={() => {
                        setShowClientModal(false);
                        setEditingClient(null); // Clear edit state on close
                    }}
                    // 🌟 NEW 3: Pass agents list to the modal 🌟
                    // agents={agents} 
                    onCreate={async (clientData) => {
                        try {
                                console.log("Client Data Being Sent to API:", clientData);
                            if (editingClient) {
                                // Edit mode
                                await axios.put("/clients", {
                                    id: editingClient.id,
                                    ...clientData,
                                });
                                Swal.fire({
                                    icon: "success",
                                    title: "Client Updated",
                                    text: `"${clientData.name}" was updated successfully!`,
                                    timer: 2000,
                                    showConfirmButton: false,
                                });
                            } else {
                                // Create mode
                                await axios.post("/clients", clientData);
                                Swal.fire({
                                    icon: "success",
                                    title: "Client Created",
                                    text: `"${clientData.name}" was added successfully!`,
                                    timer: 2000,
                                    showConfirmButton: false,
                                });
                            }
                            fetchClients(); // Refresh the list
                            setShowClientModal(false);
                            setEditingClient(null);
                        } catch (err) {
                            // Error handling logic (duplicate, failed save, etc.)
                            if (err.response && err.response.status === 409) {
                                Swal.fire({
                                    icon: "warning",
                                    title: "Duplicate Client",
                                    text:
                                        err.response.data.message ||
                                        "Client with this name already exists.",
                                });
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: editingClient ? "Update Failed" : "Creation Failed",
                                    text: "Unable to save client. Please try again.",
                                });
                            }
                            console.error("Client save failed", err);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Clients;