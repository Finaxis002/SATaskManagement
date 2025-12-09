import React, { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  Award,
  Search,
  Download,
  SortAsc,
  SortDesc,
  Trophy,
  Star,
} from "lucide-react";

const Referrals = ({ agents = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("referrals"); // 'referrals', 'name'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc', 'desc'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'Active', 'Inactive'

  // Calculations
  const totalReferrals = agents.reduce(
    (sum, agent) => sum + agent.referrals,
    0
  );
  const activeAgents = agents.filter((a) => a.status === "Active").length;
  const avgReferrals =
    agents.length > 0 ? (totalReferrals / agents.length).toFixed(1) : 0;

  // Top performer
  const topPerformer =
    agents.length > 0
      ? agents.reduce(
          (max, agent) => (agent.referrals > max.referrals ? agent : max),
          agents[0]
        )
      : null;

  // Filtered and sorted agents
  const filteredAgents = useMemo(() => {
    let filtered = agents;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "referrals") {
        return sortOrder === "asc"
          ? a.referrals - b.referrals
          : b.referrals - a.referrals;
      } else {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

    return filtered;
  }, [agents, searchTerm, filterStatus, sortBy, sortOrder]);

  // Download CSV
  const downloadReport = () => {
    const headers = ["Agent Name", "Referrals", "Status"];
    const rows = filteredAgents.map((a) => [a.name, a.referrals, a.status]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agent_referrals_report.csv";
    link.click();
  };

  // Toggle sort
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Agent Referrals
          </h1>
          <p className="text-slate-600">
            Track and manage agent referral performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Agents"
            value={agents.length}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Referrals"
            value={totalReferrals}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={Award}
            label="Active Agents"
            value={activeAgents}
            gradient="from-purple-500 to-pink-600"
          />
          <StatCard
            icon={Star}
            label="Avg Referrals"
            value={avgReferrals}
            gradient="from-orange-500 to-red-600"
          />
        </div>

        {/* Top Performer Card */}
        {topPerformer && topPerformer.referrals > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-100">
                <Trophy className="text-amber-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Top Performer of the Month
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {topPerformer.name}
                </p>
                <p className="text-sm text-slate-600">
                  Highest referral count this period
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center px-6 py-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-1">
                    Referrals
                  </p>
                  <p className="text-3xl font-bold text-amber-600">
                    {topPerformer.referrals}
                  </p>
                </div>

                <div className="sm:block w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <div className="flex md:block justify-center">
                    <Trophy className="text-white mt-4 w-10 h-10 md:w-14 md:h-14 md:ml-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <FilterButton
                active={filterStatus === "all"}
                onClick={() => setFilterStatus("all")}
              >
                All
              </FilterButton>
              <FilterButton
                active={filterStatus === "Active"}
                onClick={() => setFilterStatus("Active")}
              >
                Active
              </FilterButton>
              <FilterButton
                active={filterStatus === "Inactive"}
                onClick={() => setFilterStatus("Inactive")}
              >
                Inactive
              </FilterButton>
            </div>

            {/* Download */}
            <button
              onClick={downloadReport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>

          {/* Results count */}
          <p className="text-sm text-slate-600 mb-4">
            Showing {filteredAgents.length} of {agents.length} agents
          </p>

          {/* Table */}
          <AgentTable
            agents={filteredAgents}
            sortBy={sortBy}
            sortOrder={sortOrder}
            toggleSort={toggleSort}
          />
        </div>
      </div>
    </div>
  );
};

// Components
const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

const AgentTable = ({ agents, sortBy, sortOrder, toggleSort }) => {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="text-slate-400" size={32} />
        </div>
        <p className="text-slate-500 font-medium">No agents found</p>
        <p className="text-sm text-slate-400 mt-1">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  // Mobile Card View
  const MobileCard = ({ agent, rank }) => (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            #{rank}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 mb-1 break-words">
              {agent.name}
            </p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                agent.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {agent.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Total Referrals</p>
          <p className="text-2xl font-bold text-indigo-600">
            {agent.referrals}
          </p>
        </div>
        <Award className="text-indigo-400" size={28} />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="block lg:hidden space-y-3">
        {agents.map((agent, index) => (
          <MobileCard key={agent._id} agent={agent} rank={index + 1} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Rank
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Agent Name
                  {sortBy === "name" &&
                    (sortOrder === "asc" ? (
                      <SortAsc size={14} />
                    ) : (
                      <SortDesc size={14} />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleSort("referrals")}
              >
                <div className="flex items-center justify-end gap-2">
                  Referrals
                  {sortBy === "referrals" &&
                    (sortOrder === "asc" ? (
                      <SortAsc size={14} />
                    ) : (
                      <SortDesc size={14} />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {agents.map((agent, index) => (
              <tr
                key={agent._id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {agent.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-lg font-bold text-indigo-600">
                    {agent.referrals}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      agent.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <PerformanceBadge referrals={agent.referrals} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const PerformanceBadge = ({ referrals }) => {
  let badge = {
    text: "Beginner",
    color: "bg-slate-100 text-slate-700",
    icon: "🌱",
  };

  if (referrals >= 50) {
    badge = {
      text: "Champion",
      color: "bg-purple-100 text-purple-700",
      icon: "🏆",
    };
  } else if (referrals >= 25) {
    badge = { text: "Expert", color: "bg-blue-100 text-blue-700", icon: "⭐" };
  } else if (referrals >= 10) {
    badge = {
      text: "Advanced",
      color: "bg-green-100 text-green-700",
      icon: "🚀",
    };
  } else if (referrals >= 5) {
    badge = {
      text: "Intermediate",
      color: "bg-yellow-100 text-yellow-700",
      icon: "💪",
    };
  }

  return (
    <span
      className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${badge.color}`}
    >
      <span>{badge.icon}</span>
      {badge.text}
    </span>
  );
};

export default Referrals;
