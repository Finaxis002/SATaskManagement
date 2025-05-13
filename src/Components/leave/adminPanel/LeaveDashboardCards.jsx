import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveDashboardCards = () => {
  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get("http://localhost:5000/api/leave");
      setTotal(data.length);
      setPending(data.filter((l) => l.status === "Pending").length);
      setApproved(data.filter((l) => l.status === "Approved").length);

      const uniqueUsers = new Set(data.map((l) => l.userId));
      setUsers(uniqueUsers.size);
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="bg-gray-800 p-4 rounded shadow">
        <p className="text-sm text-gray-400">Pending Requests</p>
        <h2 className="text-2xl font-bold">{pending}</h2>
      </div>
      <div className="bg-gray-800 p-4 rounded shadow">
        <p className="text-sm text-gray-400">Total Approved</p>
        <h2 className="text-2xl font-bold">{approved}</h2>
      </div>
      <div className="bg-gray-800 p-4 rounded shadow">
        <p className="text-sm text-gray-400">Active Users</p>
        <h2 className="text-2xl font-bold">{users}</h2>
      </div>
      <div className="bg-gray-800 p-4 rounded shadow">
        <p className="text-sm text-gray-400">All Requests</p>
        <h2 className="text-2xl font-bold">{total}</h2>
      </div>
    </div>
  );
};

export default LeaveDashboardCards;
