import React, { useEffect, useState } from "react";
import axios from "axios";
import AddEmployeeModal from "./AddEmployeeModal";

const generateInitials = (name) => {
  if (!name) return "--";
  const names = name.trim().split(" ");
  return names.length === 1
    ? names[0][0].toLowerCase()
    : (names[0][0] + names[1][0]).toLowerCase();
};



const UserCard = ({ user, index }) => {
  const [hover, setHover] = useState(false);
  const [hoverPosition, setHoverPosition] = useState("center");

  const colorPalette = ["#018f95", "#2184A3", "#2D566C"];
  const assignedColor = colorPalette[index % colorPalette.length];

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    if (rect.left < screenWidth / 3) {
      setHoverPosition("left");
    } else if (rect.right > (2 * screenWidth) / 3) {
      setHoverPosition("right");
    } else {
      setHoverPosition("center");
    }

    setHover(true);
  };

  return (
    <div
      className="relative flex flex-col items-center m-2 cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHover(false)}
    >
      {/* Avatar Circle */}
      <div
        className="rounded-full h-14 w-14 flex items-center justify-center text-white font-bold text-lg shadow-md"
        style={{ backgroundColor: assignedColor }}
      >
        {generateInitials(user.name).toUpperCase()}
      </div>

      {/* Name Label */}
      <div className="text-xs mt-1 text-gray-700 truncate w-20 text-center">
        {user.name || user.email || "Unknown"}
      </div>

      {/* Profile Hover Card */}
      {hover && (
        <div
          className={`absolute top-[-22vh] z-50 flex items-center gap-5 p-5 w-[400px] transition-all duration-200 ease-in-out bg-white rounded-lg shadow-2xl border border-gray-200
            ${
              hoverPosition === "left"
                ? "left-0"
                : hoverPosition === "right"
                ? "right-0"
                : "left-1/2 -translate-x-1/2"
            }
          `}
        >
          {/* Left Circular Avatar */}
          <div
            className="flex items-center justify-center w-20 aspect-square rounded-full text-3xl font-bold text-white shadow-md"
            style={{ backgroundColor: assignedColor }}
          >
            {user.name?.substring(0, 1).toUpperCase()}
          </div>

          {/* Right User Info */}
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium text-gray-800">Position:</span>{" "}
                {user.position}
              </p>
              <p>
                <span className="font-medium text-gray-800">Department:</span>{" "}
                {user.department}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const UserGrid = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false); // 👈 Modal state

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://taskbe.sharda.co.in/api/employees"
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-md p-2">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 p-2"
      style={{ fontFamily: "Poppins, sans-serif" }}>People</h2>
      <div className="flex flex-wrap">

        {/* All users */}
        {users.map((user, index) => (
          <UserCard key={user._id} user={user} index={index} />
        ))}
      </div>
      {/* 👇 Modal to Add Employee */}
      <AddEmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default UserGrid;
