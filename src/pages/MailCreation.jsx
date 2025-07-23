import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
  Mail,
  User,
  Inbox,
  Edit2,
  XIcon,
  KeyRound,
  Loader2,
  Key,
  RotateCcw,
} from "lucide-react";

import EmailCreationModel from "../Components/EmailCreationModel";
import Swal from "sweetalert2";

const fetchMailUsers = async () => {
  const res = await fetch(
    "https://mailbackend.sharda.co.in/api/email/list-email-users"
  );
  const data = await res.json();
  return data.users || [];
};

const MailCreation = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPw, setShowPw] = useState({});

  // For modal form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [cpwVisible, setCpwVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    (async () => {
      setUsers(await fetchMailUsers());
    })();
  }, []);

  const openModal = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.endsWith("@sharda.co.in")) {
      setErrorMsg("Email must be @sharda.co.in domain.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "https://mailbackend.sharda.co.in/api/email/create-email-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message || "Mail user created successfully!");
        setTimeout(closeModal, 1000);
        setTimeout(async () => setUsers(await fetchMailUsers()), 1500);
      } else {
        setErrorMsg(data.error || "Failed to create mail user.");
      }
    } catch {
      setErrorMsg("Server error. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (email) => {
    const result = await Swal.fire({
      title: `Delete ${email}?`,
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(
        "https://mailbackend.sharda.co.in/api/email/delete-email-user",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (data.success) {
        // Optionally show toast
        setUsers(users.filter((u) => u.email !== email));
      } else {
        Swal.fire("Failed to delete", data.error || data.message, "error");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  const openResetModal = (email) => {
    setResetEmail(email);
    setShowReset(true);
    setNewPass("");
    setConfirmPass("");
    setResetMsg("");
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetMsg("");
    if (newPass !== confirmPass) {
      setResetMsg("Passwords do not match!");
      return;
    }
    setLoadingReset(true);
    try {
      const res = await fetch(
        "https://mailbackend.sharda.co.in/api/email/reset-email-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail, password: newPass }),
        }
      );
      const data = await res.json();
      setResetMsg(data.message || (data.success ? "Password reset!" : "Error"));
      if (data.success) setTimeout(() => setShowReset(false), 1000);
    } catch {
      setResetMsg("Server error.");
    }
    setLoadingReset(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ">
      <div className=" mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-indigo-900 tracking-tight drop-shadow-sm flex items-center">
            <span className="h-8 w-1 bg-indigo-500 rounded-full mr-4"></span>
            Mail User Management
          </h1>
          <button
            onClick={openModal}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 text-sm"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Mail ID
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-indigo-600" />
              Existing Mail Users
            </h2>
          </div>

          <div className="overflow-x-auto h-[45vh]">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="py-4 px-6 text-left font-medium rounded-tl-lg">
                    Mail ID
                  </th>
                  <th className="py-4 px-6 text-right font-medium rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Inbox className="w-8 h-8 mb-2" />
                        <span>No users found</span>
                        <span className="text-sm mt-1">
                          Add your first user to get started
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.email}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-gray-800">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          {u.email}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => openResetModal(u.email)}
                            title="Reset Password"
                          >
                            <Key size={16} />
                          </button>

                          <button
                            className="p-2 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDelete(u.email)}
                            title="delete mail"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {users.length > 0 && (
            <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
              Showing {users.length} {users.length === 1 ? "user" : "users"}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <EmailCreationModel
            handleSubmit={handleSubmit}
            email={email}
            pwVisible={pwVisible}
            password={password}
            cpwVisible={cpwVisible}
            confirmPassword={confirmPassword}
            errorMsg={errorMsg}
            loading={loading}
            successMsg={successMsg}
            closeModal={closeModal}
            setConfirmPassword={setConfirmPassword}
            setEmail={setEmail}
            setPassword={setPassword}
            setPwVisible={setPwVisible}
            setCpwVisible={setCpwVisible}
          />
        )}
        {showReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative animate-scale-in">
              <button
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                onClick={() => setShowReset(false)}
                aria-label="Close modal"
              >
                <XIcon className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <KeyRound className="w-10 h-8 text-indigo-500 bg-indigo-50 p-1 rounded-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Reset Password
                </h3>
                <div className="mt-2 px-4 py-2 inline-flex items-center rounded-full bg-indigo-50 text-sm text-indigo-600 font-medium">
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  {resetEmail}
                </div>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="w-full border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-lg px-4 py-2.5 pr-10 shadow-sm outline-none transition-all duration-200"
                      value={newPass}
                      minLength={6}
                      required
                      onChange={(e) => setNewPass(e.target.value)}
                      autoFocus
                      placeholder="New Password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                      onClick={() => setShowNewPass((p) => !p)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showNewPass ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      className="w-full border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-lg px-4 py-2.5 pr-10 shadow-sm outline-none transition-all duration-200"
                      value={confirmPass}
                      minLength={6}
                      required
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Confirm Password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                      onClick={() => setShowConfirmPass((p) => !p)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirmPass ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingReset}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md transition-all duration-200 ${
                    loadingReset
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
                  }`}
                >
                  {loadingReset ? (
                    <span className="inline-flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Save New Password"
                  )}
                </button>

                {resetMsg && (
                  <div
                    className={`mt-3 px-4 py-2.5 rounded-lg text-center text-sm font-medium ${
                      resetMsg.toLowerCase().includes("success")
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {resetMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailCreation;
