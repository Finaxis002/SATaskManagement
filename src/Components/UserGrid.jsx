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
  const colorPalette = [
    "#CD95EA",
    "#FC979A",
    // "#10B981",
    // "#3B82F6",
    // "#EF4444",
    // "#14B8A6",
    // "#6366F1",
    // "#EAB308",
  ];
  const assignedColor = colorPalette[index % colorPalette.length];

  return (
    <div
      className="relative flex flex-col items-center m-2 cursor-pointer "
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`rounded-full h-14 w-14 flex items-center justify-center text-black font-bold text-lg shadow-md`}
        style={{ backgroundColor: assignedColor }}
      >
       {generateInitials(user.name).toUpperCase()}

      </div>
      <div className="text-xs mt-1 text-gray-700 truncate w-20 text-center">
        {user.name || user.email || "Unknown"}
      </div>
      {hover && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 flex p-4">
          {/* Left Circle with Initials */}
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full text-3xl font-semibold text-black mr-4"
            style={{ backgroundColor: assignedColor }}
          >
            {user.name?.substring(0, 2).toUpperCase()}
          </div>

          {/* Right Details */}
          <div className="flex flex-col justify-center">
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {user.name}
            </p>
            <p className="text-sm text-gray-700">{user.email}</p>
            <p className="text-sm text-gray-600">
              Position: <span className="font-medium">{user.position}</span>
            </p>
            <p className="text-sm text-gray-600">
              Department: <span className="font-medium">{user.department}</span>
            </p>
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
      const res = await axios.get("http://localhost:5000/api/employees");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full mx-auto bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">People</h2>
      <div className="flex flex-wrap">
        {/* Invite button */}
        {/* <div
          className="flex flex-col items-center justify-center m-2 cursor-pointer text-gray-600"
          onClick={() => setShowModal(true)}
        >
          <div className="h-14 w-14 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-full">
            <span className="text-2xl font-semibold">+</span>
          </div>
          <div className="text-xs mt-1">Invite</div>
        </div> */}

        {/* All users */}
        {users.map((user, index) => (
          <UserCard key={user._id} user={user} index={index} />
        ))}
      </div>
        {/* 👇 Modal to Add Employee */}
        <AddEmployeeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default UserGrid;
