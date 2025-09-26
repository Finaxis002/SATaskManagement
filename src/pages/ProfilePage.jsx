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

  const storedIdentifier = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

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
        const matchedUser = allUsers.find(
          (u) => u.userId === storedIdentifier || u.email === storedIdentifier
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

  if (passwordForm.newPassword.length < 4) {
    setPasswordError("Password must be at least 4 characters long");
    return;
  }

  try {
    const response = await axios.post(
      `https://taskbe.sharda.co.in/api/employees/reset-password/admin`,
      {
        newPassword: passwordForm.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response?.data?.message?.includes("successfully")) {
      setPasswordSuccess("✅ Password updated successfully!");
      setPasswordError("");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // ⏳ Wait 1.5s before closing the modal
      setTimeout(() => {
        setPasswordSuccess(""); // optional: clear message
        setIsEditingPassword(false);
      }, 1500);
    } else {
      setPasswordError("Unexpected response from server.");
    }
  } catch (err) {
    console.error("Password update failed:", err);
    setPasswordError(
      err.response?.data?.message || "Failed to update password"
    );
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
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-700">
                Change Password
              </h2>

              <div className="space-y-4">
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
                    className="border px-3 py-2 rounded w-full pr-10"
                    placeholder="Enter new password"
                  />
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showNewPassword ? faEye : faEyeSlash}
                    />
                  </span>
                </div>

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
                    className="border px-3 py-2 rounded w-full pr-10"
                    placeholder="Confirm new password"
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showNewPassword ? faEye : faEyeSlash}
                    />
                  </span>
                </div>

                {passwordError && (
                  <div className="text-red-500 text-sm">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="text-green-500 text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    Update Password
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
