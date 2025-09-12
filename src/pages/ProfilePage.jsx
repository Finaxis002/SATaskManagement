import React, { useEffect, useState } from "react";
import axios from "axios";
import { updateUser } from "../redux/userSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  // ---- build identity from localStorage/JWT safely ----
  const userStr = localStorage.getItem("user"); // <— missing before

  let userObj = {};
  try {
    userObj = JSON.parse(userStr || "{}");
  } catch {}

  // token from either key
  const token =
    localStorage.getItem("tokenLocal") ||
    localStorage.getItem("authToken") ||
    "";

  let tokenPayload = {};
  try {
    tokenPayload = JSON.parse(atob((token || "").split(".")[1] || "{}"));
  } catch {}

  // Prefer email, else ids (userId/_id) from multiple sources
  const storedIdentifier =
    userObj.email ||
    userObj._id ||
    localStorage.getItem("userId") ||
    tokenPayload.userId ||
    localStorage.getItem("email") ||
    ""; // final fallback to empty string

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "https://taskbe.sharda.co.in/api/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allUsers = res.data;
        const matchedUser = allUsers.find((u) =>
          [u.userId, u._id?.toString?.(), u.email]
            .filter(Boolean)
            .map(String)
            .includes(String(storedIdentifier))
        );

        if (matchedUser) {
          setUser(matchedUser);
        } else if (storedIdentifier === "admin@example.com") {
          setUser({
            name: "Admin",
            email: "admin@example.com",
            role: "admin",
            userId: "admin@example.com",
            department: ["Administrator"],
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (storedIdentifier && token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [storedIdentifier, token]);

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // basic checks
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters long");
      return;
    }
    setIsUpdatingPwd(true);

    try {
      // Treat only the built-in admin as "admin route"
      const isBuiltInAdmin =
        user.role === "admin" &&
        (tokenPayload?.userId === "admin" || user.userId === "admin");

      const url = isBuiltInAdmin
        ? "https://taskbe.sharda.co.in/api/employees/reset-password/admin"
        : "https://taskbe.sharda.co.in/api/employees/reset-password/self";

      const payload = isBuiltInAdmin
        ? { newPassword: passwordForm.newPassword }
        : { newPassword: passwordForm.newPassword };

      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.message?.toLowerCase().includes("success")) {
        setPasswordSuccess("✅ Password updated successfully!");
        setPasswordError("");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setPasswordSuccess("");
          setIsEditingPassword(false);
        }, 1200);
      } else {
        setPasswordError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Password update failed:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to update password"
      );
    } finally {
      setIsUpdatingPwd(false); // <-- stop loading
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-700 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your profile information. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 md:py-12 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className=" text-3xl  font-bold text-gray-800">My Profile</h1>
          <button
            onClick={() => setIsEditingPassword(true)}
            className="bg-indigo-600 text-white md:px-4 px-2 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Change Password
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-y-auto">
          <div className="md:flex">
            {/* Left Side - Profile Card */}
            <div className="md:w-1/3  bg-gradient-to-b from-indigo-600 to-purple-600 p-8 text-white ">
              <div className="flex md:flex-col  md:items-center md:mt-7 text-center">
                <div className="relative  flex md:flex-col flex-row">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=ffffff&color=4f46e5&size=200`}
                    alt="Profile"
                    className="w-15 h-15 md:h-40 md:w-40 rounded-full border-4 border-white shadow-lg"
                  />
                  <h2 className="text-2xl font-bold md:mt-6 md:pl-1 md:ml-1 ml-5 mt-2">{user.name}</h2>

                </div>
                  
                
              </div>
              <p className="text-indigo-100 ml-20 md:ml-25 md:mt-0 mt-[-25px]">
                  {user.role === "admin"
                    ? "Administrator"
                    : user.position || "Position not specified"}
                </p>
            </div>

            {/* Right Side - Details */}
            <div className="md:w-2/3 md:p-8 sm:overflow-y-auto md:max-h-[70vh] max-h-[55vh] p-4">
              <h3 className="text-lg font-semibold text-gray-800 md:mb-4 p-2">
                Profile Information
              </h3>
              <hr />
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 md:gap-8 gap-5 md:ml-1.5 ml-2">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-gray-500 md:mb-1">
                    Full Name
                  </label>
                  <p className="font-medium">{user.name}</p>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm text-gray-500 md:mb-1">
                    Email Address
                  </label>
                  <p className="font-medium">{user.email}</p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Role
                  </label>
                  <div className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 ml-[-4px] rounded-full capitalize">
                    {user.role}
                  </div>
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    User ID
                  </label>
                  <p className="font-mono text-sm">{user.userId || "—"}</p>
                </div>
              </div>

              {/* Departments */}
              <div className="md:col-span-2 mt-4 space-y-4 ">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 md:ml-0 ml-2">
                  Departments
                </h3>
                {user.department?.length ? (
                  <div className="flex flex-wrap gap-2 pb-4">
                    {user.department.map((dept, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm "
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No departments assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Edit Modal */}
        {isEditingPassword && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 transform transition-transform duration-300 scale-100 hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Change Password
                </h2>
                <button
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter new password"
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEye : faEyeSlash}
                      />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="Confirm new password"
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEye : faEyeSlash}
                      />
                    </span>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{passwordSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={isUpdatingPwd}
                    className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-sm transition-all
              hover:from-blue-600 hover:to-blue-700 hover:shadow-md
              ${isUpdatingPwd ? "opacity-60 cursor-not-allowed" : ""}`}
                    aria-busy={isUpdatingPwd}
                  >
                    {isUpdatingPwd ? (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            d="M4 12a8 8 0 018-8v4"
                            fill="currentColor"
                          />
                        </svg>
                        Updating…
                      </span>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
