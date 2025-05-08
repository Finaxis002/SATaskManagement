import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedIdentifier = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/employees",
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

        setUser(matchedUser || null);
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your profile information. Please try again later.</p>
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
    <div className=" bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
         
        </div>

        <div className="bg-white rounded-2xl shadow-xl h-[70vh] overflow-y-auto">
          <div className="md:flex">
            {/* Left Side - Profile Card */}
            <div className="md:w-1/3 bg-gradient-to-b from-indigo-600 to-purple-600 p-8 text-white">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=ffffff&color=4f46e5&size=200`}
                    alt="Profile"
                    className="w-40 h-40 rounded-full border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-2 right-2 bg-white text-indigo-600 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-indigo-100 mb-4">{user.position || "Position not specified"}</p>
                
             
              </div>
            </div>
            
            {/* Right Side - Details */}
            <div className="md:w-2/3 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                    <p className="font-medium">{user.phone || "Not provided"}</p>
                  </div>
                </div>
                
                {/* Professional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Information</h3>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Position</label>
                    <p className="font-medium text-indigo-600 capitalize">{user.position || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Role</label>
                    <div className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full capitalize">
                      {user.role}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Employee ID</label>
                    <p className="font-mono text-sm">{user.userId || "—"}</p>
                  </div>
                </div>
                
                {/* Departments */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Departments</h3>
                  {user.department?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {user.department.map((dept, i) => (
                        <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;