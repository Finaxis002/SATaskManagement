// import React, { useState, useEffect } from "react";
// import axios from "../utils/secureAxios"; // Use your axios instance

// const BankDetails = () => {
//   const [firms, setFirms] = useState([]);
//   const [showFirmModal, setShowFirmModal] = useState(false);
//   const [newFirm, setNewFirm] = useState({ name: "", address: "" });
//   const [activeFirmId, setActiveFirmId] = useState(null);
//   const [showBankModal, setShowBankModal] = useState(false);
//   const [newBank, setNewBank] = useState({
//     bankName: "",
//     accountName: "",
//     accountNumber: "",
//     ifsc: "",
//     upiIdName: "",
//     upiMobile: "",
//     upiId: "",
//   });

//   // Fetch firms on load
//   useEffect(() => {
//     fetchFirms();
//   }, []);

//   const fetchFirms = async () => {
//     const res = await axios.get("https://taskbe.sharda.co.in/firms"); // GET all firms
//     setFirms(res.data);
//   };

//   // Add Firm
//   const handleAddFirm = async () => {
//     await axios.post("https://taskbe.sharda.co.in/firms", newFirm);
//     setShowFirmModal(false);
//     setNewFirm({ name: "", address: "" });
//     fetchFirms();
//   };

//   // Add Bank to a firm
//   const handleAddBank = async () => {
//     await axios.post(`https://taskbe.sharda.co.in/firms/${activeFirmId}/banks`, newBank);
//     setShowBankModal(false);
//     setNewBank({
//       bankName: "",
//       accountName: "",
//       accountNumber: "",
//       ifsc: "",
//       upiIdName: "",
//       upiMobile: "",
//       upiId: "",
//     });
//     fetchFirms();
//   };

//   return (
//     <div className="max-w-3xl mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-4">Firm & Bank Details</h1>

//       {/* Add Firm Button */}
//       <button
//         className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded"
//         onClick={() => setShowFirmModal(true)}
//       >
//         + Add Firm
//       </button>

//       {/* Firms List */}
//       {firms.length === 0 && <div>No firms found.</div>}
//       {firms.map((firm) => (
//         <div key={firm._id} className="mb-6 border rounded p-4 bg-white shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="font-semibold text-lg">{firm.name}</div>
//               <div className="text-gray-500 text-sm">{firm.address}</div>
//             </div>
//             <button
//               className="px-3 py-1 bg-green-500 text-white rounded"
//               onClick={() => {
//                 setActiveFirmId(firm._id);
//                 setShowBankModal(true);
//               }}
//             >
//               + Add Bank
//             </button>
//           </div>
//           {/* Banks under this firm */}
//           <div className="mt-3">
//             {firm.banks && firm.banks.length > 0 ? (
//               <table className="w-full text-sm mt-2 border">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="border p-2">Bank Name</th>
//                     <th className="border p-2">A/C Name</th>
//                     <th className="border p-2">A/C No.</th>
//                     <th className="border p-2">IFSC</th>
//                     <th className="border p-2">UPI Name</th>
//                     <th className="border p-2">UPI Mobile</th>
//                     <th className="border p-2">UPI ID</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {firm.banks.map((bank, idx) => (
//                     <tr key={idx}>
//                       <td className="border p-2">{bank.bankName}</td>
//                       <td className="border p-2">{bank.accountName}</td>
//                       <td className="border p-2">{bank.accountNumber}</td>
//                       <td className="border p-2">{bank.ifsc}</td>
//                       <td className="border p-2">{bank.upiIdName}</td>
//                       <td className="border p-2">{bank.upiMobile}</td>
//                       <td className="border p-2">{bank.upiId}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <div className="text-gray-500 text-xs mt-2">No banks added.</div>
//             )}
//           </div>
//         </div>
//       ))}

//       {/* Add Firm Modal */}
//       {showFirmModal && (
//         <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
//             <div className="mb-4">
//               <label className="font-semibold">Firm Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newFirm.name}
//                 onChange={(e) => setNewFirm({ ...newFirm, name: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>Address</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newFirm.address}
//                 onChange={(e) => setNewFirm({ ...newFirm, address: e.target.value })}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button className="px-3 py-1 border rounded" onClick={() => setShowFirmModal(false)}>
//                 Cancel
//               </button>
//               <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleAddFirm}>
//                 Add Firm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Bank Modal */}
//       {showBankModal && (
//         <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg p-6 w-[28rem] shadow-xl">
//             <div className="mb-4">
//               <label className="font-semibold">Bank Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.bankName}
//                 onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>Account Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.accountName}
//                 onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>Account Number</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.accountNumber}
//                 onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>IFSC Code</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.ifsc}
//                 onChange={(e) => setNewBank({ ...newBank, ifsc: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>UPI ID Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.upiIdName}
//                 onChange={(e) => setNewBank({ ...newBank, upiIdName: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>UPI Mobile Number</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.upiMobile}
//                 onChange={(e) => setNewBank({ ...newBank, upiMobile: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>UPI ID</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.upiId}
//                 onChange={(e) => setNewBank({ ...newBank, upiId: e.target.value })}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button className="px-3 py-1 border rounded" onClick={() => setShowBankModal(false)}>
//                 Cancel
//               </button>
//               <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleAddBank}>
//                 Add Bank
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BankDetails;




///////////////////////////////////////////////////////////////////////////



import React, { useState, useEffect } from "react";
import axios from "../utils/secureAxios";
import Swal from "sweetalert2";

const BankDetails = () => {

const [submittingFirm, setSubmittingFirm] = useState(false);

  const [firms, setFirms] = useState([]);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [newFirm, setNewFirm] = useState({ name: "", address: "" });
  const [activeFirmId, setActiveFirmId] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    upiIdName: "",
    upiMobile: "",
    upiId: "",
  });
  const [expandedFirms, setExpandedFirms] = useState({});
  const [editingFirm, setEditingFirm] = useState(null);
  const [editingBank, setEditingBank] = useState(null);
  const [showEditFirmModal, setShowEditFirmModal] = useState(false);
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  //new
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [firmModalMode, setFirmModalMode] = useState("add"); // 'add' | 'edit'
  const [formFirm, setFormFirm] = useState({
    _id: "",
    name: "",
    address: "",
    gstin: "",
    phone: "",
    prefix: "",
  });

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankModalMode, setBankModalMode] = useState("add"); // 'add' | 'edit'
  const [formBank, setFormBank] = useState({
    _id: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    upiIdName: "",
    upiMobile: "",
    upiId: "",
  });
  // helpers
  const openAddFirm = () => {
    setFirmModalMode("add");
    setFormFirm({
      _id: "",
      name: "",
      address: "",
      gstin: "",
      phone: "",
      prefix: "",
    });
    setIsFirmModalOpen(true);
  };

  const openEditFirm = (firm) => {
    setFirmModalMode("edit");
    setFormFirm({
      _id: firm._id,
      name: firm.name || "",
      address: firm.address || "",
      gstin: firm.gstin || "",
      phone: firm.phone || "",
      prefix: firm.prefix || "",
    });
    setIsFirmModalOpen(true);
  };

  const closeFirmModal = () => {
    setIsFirmModalOpen(false);
  };

  const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

  // submit
  // const submitFirm = async () => {
  //   if (firmModalMode === "add") {
  //     await axios.post("https://taskbe.sharda.co.in/firms", {
  //       name: formFirm.name,
  //       address: formFirm.address,
  //       gstin: formFirm.gstin,
  //       phone: formFirm.phone,
  //       prefix: formFirm.prefix,
  //     });
  //   } else {
  //     await axios.put(`https://taskbe.sharda.co.in/firms/${formFirm._id}`, {
  //       name: formFirm.name,
  //       address: formFirm.address,
  //       gstin: formFirm.gstin,
  //       phone: formFirm.phone,
  //       prefix: formFirm.prefix,
  //     });
  //   }
  //   closeFirmModal();
  //   fetchFirms();
  // };


//   const submitFirm = async () => {
//   const payload = {
//     name: formFirm.name,
//     address: formFirm.address,
//     gstin: formFirm.gstin,
//     phone: formFirm.phone,
//     prefix: formFirm.prefix,
//   };

//   try {
//     setSubmittingFirm(true);

//     if (firmModalMode === "add") {
//       await axios.post("https://taskbe.sharda.co.in/firms", payload);
//       alert("Firm created successfully.");
//     } else {
//       await axios.put(`https://taskbe.sharda.co.in/firms/${formFirm._id}`, payload);
//       alert("Firm updated successfully.");
//     }

//     closeFirmModal();
//     fetchFirms();
//   } catch (err) {
//     // Try to understand backend error shapes
//     const status = err?.response?.status;
//     const msg = err?.response?.data?.message ?? err?.message ?? "Unknown error";
//     const code = err?.response?.data?.code;

//     const isDupPrefix =
//       status === 409 ||                              // common for conflicts
//       code === 11000 ||                              // Mongo duplicate key
//       err?.response?.data?.keyPattern?.prefix ||    // Mongo key pattern
//       /duplicate/i.test(String(msg)) && /prefix/i.test(String(msg));

//     if (isDupPrefix) {
//       alert("This firm prefix already exists. Please choose a different prefix.");
//     } else {
//       alert(`Failed to ${firmModalMode === "add" ? "create" : "update"} firm: ${msg}`);
//     }
//   } finally {
//     setSubmittingFirm(false);
//   }
// };


const submitFirm = async () => {
  const payload = {
    name: (formFirm.name || "").trim(),
    address: (formFirm.address || "").trim(),
    gstin: (formFirm.gstin || "").trim(),
    phone: (formFirm.phone || "").trim(),
    prefix: (formFirm.prefix || "").trim(),
  };

  try {
    setSubmittingFirm(true);

    if (firmModalMode === "add") {
      await axios.post("https://taskbe.sharda.co.in/firms", payload);
      Toast.fire({ icon: "success", title: "Firm created successfully" });
    } else {
      await axios.put(`https://taskbe.sharda.co.in/firms/${formFirm._id}`, payload);
      Toast.fire({ icon: "success", title: "Firm updated successfully" });
    }

    closeFirmModal();
    fetchFirms();
  } catch (err) {
    const status = err?.response?.status;
    const data   = err?.response?.data;
    const msg    = data?.message ?? err?.message ?? "Unknown error";
    const code   = data?.code;

    const isDupPrefix =
      status === 409 ||
      code === 11000 ||
      data?.keyPattern?.prefix ||
      (/duplicate/i.test(String(msg)) && /prefix/i.test(String(msg))) ||
      ((status === 400 || status === 422) && /prefix/i.test(String(msg)) && /exist/i.test(String(msg)));

    if (isDupPrefix) {
      await Swal.fire({
        icon: "error",
        title: "Duplicate Prefix",
        text: "This firm prefix already exists. Please choose a different prefix.",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });
    } else {
      await Swal.fire({
        icon: "error",
        title: `Failed to ${firmModalMode === "add" ? "create" : "update"} firm`,
        text: msg,
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });
    }
  } finally {
    setSubmittingFirm(false);
  }
};


  // open/close
  const openAddBank = (firmId) => {
    setActiveFirmId(firmId);
    setBankModalMode("add");
    setFormBank({
      _id: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      upiIdName: "",
      upiMobile: "",
      upiId: "",
    });
    setIsBankModalOpen(true);
  };

  const openEditBank = (firmId, bank) => {
    setActiveFirmId(firmId);
    setBankModalMode("edit");
    setFormBank({
      _id: bank._id,
      bankName: bank.bankName || "",
      accountName: bank.accountName || "",
      accountNumber: bank.accountNumber || "",
      ifsc: bank.ifsc || "",
      upiIdName: bank.upiIdName || "",
      upiMobile: bank.upiMobile || "",
      upiId: bank.upiId || "",
    });
    setIsBankModalOpen(true);
  };

  const closeBankModal = () => setIsBankModalOpen(false);

  // submit (decide POST vs PUT)
  const submitBank = async () => {
    if (!activeFirmId) return;
    if (bankModalMode === "add") {
      await axios.post(
        `https://taskbe.sharda.co.in/firms/${activeFirmId}/banks`,
        {
          bankName: formBank.bankName,
          accountName: formBank.accountName,
          accountNumber: formBank.accountNumber,
          ifsc: formBank.ifsc,
          upiIdName: formBank.upiIdName,
          upiMobile: formBank.upiMobile,
          upiId: formBank.upiId,
        }
      );
    } else {
      await axios.put(
        `https://taskbe.sharda.co.in/firms/${activeFirmId}/banks/${formBank._id}`,
        {
          bankName: formBank.bankName,
          accountName: formBank.accountName,
          accountNumber: formBank.accountNumber,
          ifsc: formBank.ifsc,
          upiIdName: formBank.upiIdName,
          upiMobile: formBank.upiMobile,
          upiId: formBank.upiId,
        }
      );
    }
    closeBankModal();
    fetchFirms();
  };

  //new

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    const res = await axios.get("https://taskbe.sharda.co.in/firms");
    setFirms(res.data);
  };

  const handleAddFirm = async () => {
    await axios.post("https://taskbe.sharda.co.in/firms", newFirm);
    setShowFirmModal(false);
    setNewFirm({ name: "", address: "", gstin: "", phone: "", banks: "" });
    fetchFirms();
  };

  const handleAddBank = async () => {
    await axios.post(
      `https://taskbe.sharda.co.in/firms/${activeFirmId}/banks`,
      newBank
    );
    setShowBankModal(false);
    setNewBank({
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      upiIdName: "",
      upiMobile: "",
      upiId: "",
    });
    fetchFirms();
  };

  const toggleFirmExpansion = (firmId) => {
    setExpandedFirms((prev) => ({
      ...prev,
      [firmId]: !prev[firmId],
    }));
  };

  // Delete Firm
  const handleDeleteFirm = async (firmId) => {
    try {
      await axios.delete(`https://taskbe.sharda.co.in/firms/${firmId}`);
      fetchFirms();
    } catch (error) {
      console.error("Error deleting firm:", error);
    }
  };

  // Delete Bank
  const handleDeleteBank = async (firmId, bankId) => {
    try {
      await axios.delete(
        `https://taskbe.sharda.co.in/firms/${firmId}/banks/${bankId}`
      );
      fetchFirms();
    } catch (error) {
      console.error("Error deleting bank:", error);
    }
  };

  // Edit Firm
  const handleEditFirm = (firm) => {
    setEditingFirm(firm);
    setShowEditFirmModal(true);
  };

  // Edit Bank
  const handleEditBank = (firmId, bank) => {
    setActiveFirmId(firmId);
    setEditingBank(bank);
    setShowEditBankModal(true);
  };

  // Update Firm
  const handleUpdateFirm = async () => {
    try {
      await axios.put(
        `https://taskbe.sharda.co.in/firms/${editingFirm._id}`,
        editingFirm
      );
      setShowEditFirmModal(false);
      fetchFirms();
    } catch (error) {
      console.error("Error updating firm:", error);
    }
  };

  // Update Bank
  const handleUpdateBank = async () => {
    try {
      await axios.put(
        `https://taskbe.sharda.co.in/firms/${activeFirmId}/banks/${editingBank._id}`,
        editingBank
      );
      setShowEditBankModal(false);
      fetchFirms();
    } catch (error) {
      console.error("Error updating bank:", error);
    }
  };

  const confirmDelete = (type, onConfirm) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this ${type}?`
    );
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto  flex flex-col"
  
    >
     <div className="max-h-[calc(100vh-220px)] overflow-y-auto pb-8 pr-2">
       <div className="px-4 pt-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Firm & Bank Management
          </h1>
          <button
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors flex items-center gap-2"
            // onClick={() => setShowFirmModal(true)}
            onClick={openAddFirm}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Firm
          </button>
        </div>
      </div>

      <div className="">
        <div className="space-y-6 pb-6">
          {firms.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No firms found
              </h3>
              <p className="mt-1 text-gray-500">
                Get started by adding your first firm
              </p>
              <button
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                onClick={() => setShowFirmModal(true)}
              >
                Add Firm
              </button>
            </div>
          ) : (
            firms.map((firm) => (
              <div
                key={firm._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
                  onClick={() => toggleFirmExpansion(firm._id)}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {firm.name}
                    </h2>
                    <p className="text-gray-500 mt-1">{firm.address}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {firm.banks?.length || 0}{" "}
                      {firm.banks?.length === 1 ? "Bank" : "Banks"}
                    </span>
                    <button
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   setActiveFirmId(firm._id);
                      //   setShowBankModal(true);
                      // }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddBank(firm._id);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Bank
                    </button>

                    <button
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   handleUpdateFirm(firm);
                      // }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditFirm(firm);
                      }}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete("firm", () => handleDeleteFirm(firm._id));
                      }}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                      Delete
                    </button>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedFirms[firm._id] ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {expandedFirms[firm._id] && (
                  <div className="border-t border-gray-200 p-6 pb-8">
                    {firm.banks && firm.banks.length > 0 ? (
                      <div
                        className="overflow-x-auto "
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Bank Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                A/C Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                A/C Number
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                IFSC
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                UPI Details
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {firm.banks.map((bank, idx) => (
                              <tr
                                key={idx}
                                className={
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {bank.bankName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {bank.accountName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {bank.accountNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {bank.ifsc}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div>Name: {bank.upiIdName || "-"}</div>
                                  <div>Mobile: {bank.upiMobile || "-"}</div>
                                  <div>ID: {bank.upiId || "-"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <button
                                    // onClick={() =>
                                    //   handleUpdateBank(firm._id, bank)
                                    // }
                                    onClick={() => openEditBank(firm._id, bank)}
                                    className="mr-2 text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      confirmDelete("bank", () =>
                                        handleDeleteBank(firm._id, bank._id)
                                      )
                                    }
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                          />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                          No banks added
                        </h3>
                        <p className="mt-1 text-gray-500">
                          Add a bank account to this firm
                        </p>
                        <button
                          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                          onClick={() => {
                            setActiveFirmId(firm._id);
                            setShowBankModal(true);
                          }}
                        >
                          Add Bank Account
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
     </div>

      {/* Add Firm Modal */}

      {isFirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {firmModalMode === "add" ? "Add New Firm" : "Edit Firm"}
                </h2>
                <button
                  onClick={closeFirmModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firm Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.name}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, name: e.target.value })
                    }
                    placeholder="Enter firm name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.address}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, address: e.target.value })
                    }
                    placeholder="Enter firm address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.gstin}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, gstin: e.target.value })
                    }
                    placeholder="Enter GSTIN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.phone}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firm Prefix
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.prefix}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, prefix: e.target.value })
                    }
                    placeholder="Enter Firm Prefix"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeFirmModal}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {/* <button
                  onClick={submitFirm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  {firmModalMode === "add" ? "Add Firm" : "Update Firm"}
                </button> */}
                <button
  onClick={submitFirm}
  disabled={submittingFirm}
  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md"
>
  {submittingFirm
    ? "Saving..."
    : firmModalMode === "add"
      ? "Add Firm"
      : "Update Firm"}
</button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}

      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {bankModalMode === "add"
                    ? "Add Bank Account"
                    : "Edit Bank Account"}
                </h2>
                <button
                  onClick={closeBankModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formBank.bankName}
                    onChange={(e) =>
                      setFormBank({ ...formBank, bankName: e.target.value })
                    }
                    placeholder="Enter bank name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formBank.accountName}
                    onChange={(e) =>
                      setFormBank({ ...formBank, accountName: e.target.value })
                    }
                    placeholder="Enter account name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formBank.accountNumber}
                    onChange={(e) =>
                      setFormBank({
                        ...formBank,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formBank.ifsc}
                    onChange={(e) =>
                      setFormBank({ ...formBank, ifsc: e.target.value })
                    }
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div className="md:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    UPI Details (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UPI ID Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formBank.upiIdName}
                        onChange={(e) =>
                          setFormBank({
                            ...formBank,
                            upiIdName: e.target.value,
                          })
                        }
                        placeholder="Enter UPI ID name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UPI Mobile
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formBank.upiMobile}
                        onChange={(e) =>
                          setFormBank({
                            ...formBank,
                            upiMobile: e.target.value,
                          })
                        }
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formBank.upiId}
                        onChange={(e) =>
                          setFormBank({ ...formBank, upiId: e.target.value })
                        }
                        placeholder="Enter UPI ID"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeBankModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitBank}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  {bankModalMode === "add"
                    ? "Add Bank Account"
                    : "Update Bank Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetails;
