import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSave, FaUsers, FaChevronDown, FaChevronRight, FaShieldAlt, FaCheck, FaArrowLeft } from "react-icons/fa";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

/* ---------------------------- Constants ---------------------------- */

const ALL_MENU_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "allUsers", label: "All Users", icon: "👥", adminOnly: true },
  { key: "teamStatus", label: "IT Department", icon: "📊" },
  { key: "tasks", label: "Tasks", icon: "📋" },
  { key: "agent", label: "Agent", icon: "👔" },
  { key: "supportRequests", label: "Support Requests", icon: "📧" },
  { key: "clients", label: "Clients", icon: "💼" },
  { key: "leave", label: "Leave", icon: "⛳" },
  {
    key: "settings",
    label: "Settings",
    icon: "⚙️",
    hasSubTabs: true,
    subTabs: [
      { key: "settings_tab_department", label: "Department Overview", icon: "👥" },
      { key: "settings_tab_code", label: "Code Overview", icon: "💻" },
      { key: "settings_tab_templates", label: "Message Templates", icon: "📄" },
      { key: "settings_tab_report", label: "Report Generation", icon: "📊" },
      { key: "settings_tab_leave", label: "Leave Management", icon: "📅" },
      { key: "settings_tab_mail", label: "Mail User Creation", icon: "📧" },
      { key: "settings_tab_bank", label: "Bank Details", icon: "🏦" },
    ],
  },
  { key: "completedTasks", label: "Completed Tasks", icon: "✅", adminOnly: true },
  { key: "invoicing", label: "Invoicing", icon: "💰" },
  { key: "updates", label: "Updates", icon: "🕒" },
];

const DEFAULT_PERMISSIONS = {
  marketing: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  operations: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  "it/software": ["home", "teamStatus", "tasks", "agent", "supportRequests", "clients", "leave", "updates"],
  seo: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  "human resource": ["home", "tasks", "agent", "clients", "leave", "settings", "settings_tab_leave"],
  administration: ["home", "tasks", "agent", "clients", "leave"],
  finance: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  sales: ["home", "tasks", "agent", "clients", "leave", "invoicing", "teamStatus"],
};

const DEPT_COLORS = [
  { bg: "bg-violet-500", light: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-sky-500", light: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-500", light: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" },
];

let colorIndex = 0;
const getNextColor = () => DEPT_COLORS[colorIndex++ % DEPT_COLORS.length];

/* ---- Toggle Switch ---- */
const Toggle = ({ enabled, onChange, size = "md" }) => {
  const sizes = {
    sm: { track: "h-4 w-7", thumb: "h-3 w-3", on: "translate-x-3.5", off: "translate-x-0.5" },
    md: { track: "h-5 w-9", thumb: "h-3.5 w-3.5", on: "translate-x-4", off: "translate-x-0.5" },
  };
  const s = sizes[size];
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`relative inline-flex ${s.track} items-center rounded-full transition-all duration-200 focus:outline-none cursor-pointer flex-shrink-0 ${
        enabled ? "bg-indigo-600" : "bg-gray-200"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block ${s.thumb} transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? s.on : s.off
        }`}
      />
    </button>
  );
};

/* ======================== DeptList (outside main component) ======================== */
const DeptList = ({ mobile, departments, departmentPermissions, selectedDepartment, onSelectDepartment }) => (
  <div className={`flex-1 overflow-y-auto ${mobile ? "py-3 px-3" : "py-2 px-2"}`}>
    {departments.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-32 text-center px-4">
        <FaUsers className="text-gray-300 text-3xl mb-2" />
        <p className="text-xs text-gray-400">No departments found</p>
      </div>
    ) : (
      departments.map((dept) => {
        const isSelected = selectedDepartment === dept.key;
        const deptPerms = (departmentPermissions[dept.key] || []).filter((p) => !p.startsWith("settings_tab_"));
        return (
          <button
            type="button"
            key={dept.key}
            onClick={() => onSelectDepartment(dept)}
            className={`w-full text-left transition-all duration-150 flex items-center gap-3 ${
              mobile
                ? "px-4 py-3.5 rounded-xl mb-2 border bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm active:scale-[0.99]"
                : `px-3 py-2.5 rounded-lg mb-1 ${isSelected ? "bg-white shadow-sm border border-gray-200" : "hover:bg-white/70"}`
            }`}
          >
            {mobile ? (
              <div className={`w-9 h-9 rounded-xl ${dept.color.bg} flex items-center justify-center flex-shrink-0`}>
                <FaUsers className="text-white text-xs" />
              </div>
            ) : (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dept.color.bg}`} />
            )}

            <div className="flex-1 min-w-0">
              <span
                className={`font-semibold truncate block ${
                  mobile ? "text-sm text-gray-900" : `text-sm ${isSelected ? "text-gray-900" : "text-gray-600"}`
                }`}
              >
                {dept.label}
              </span>
              {mobile && <span className="text-[11px] text-gray-400">{deptPerms.length} features enabled</span>}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${dept.color.light} ${dept.color.text}`}>
                {deptPerms.length}
              </span>
              {mobile && <FaChevronRight size={11} className="text-gray-300" />}
            </div>
          </button>
        );
      })
    )}
  </div>
);

/* ======================== PermissionsPanel (outside main component) ======================== */
const PermissionsPanel = ({
  selectedDeptLabel,
  selectedDeptColor,
  enabledCount,
  totalItems,
  progressPct,
  currentPermissions,
  expandedItems,
  onToggleExpand,
  onPermissionToggle,
  enabledSubTabsCount,
}) => (
  <>
    {/* Sub-header */}
    <div className="px-4 sm:px-7 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${selectedDeptColor.bg} flex items-center justify-center shadow-sm`}>
          <FaUsers className="text-white text-[10px] sm:text-xs" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 capitalize leading-tight">{selectedDeptLabel}</h3>
          <p className="text-[10px] sm:text-[11px] text-gray-400">
            {enabledCount} of {totalItems} features enabled
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-16 sm:w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">{progressPct}%</span>
      </div>
    </div>

    {/* Permission items */}
    <div className="px-3 sm:px-7 py-3 sm:py-4 space-y-1.5 pb-6">
      {ALL_MENU_ITEMS.map((item, idx) => {
        const isEnabled = currentPermissions.includes(item.key);
        const isAdminOnly = item.adminOnly;
        const hasSubTabs = item.hasSubTabs;
        const isExpanded = expandedItems[item.key];

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.025, duration: 0.18 }}
          >
            <div
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border transition-all duration-150 ${
                isAdminOnly
                  ? "border-amber-100 bg-amber-50/60"
                  : isEnabled
                  ? "border-indigo-100 bg-indigo-50/50"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm sm:text-base ${
                  isAdminOnly ? "bg-amber-100" : isEnabled ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                {item.icon}
              </div>

              <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs sm:text-sm font-medium leading-tight ${isAdminOnly ? "text-amber-800" : "text-gray-800"}`}>
                  {item.label}
                </span>
                {isAdminOnly && (
                  <span className="text-[9px] sm:text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                    Admin Only
                  </span>
                )}
                {hasSubTabs && isEnabled && enabledSubTabsCount > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {enabledSubTabsCount} tab{enabledSubTabsCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {hasSubTabs && (
                  <button
                    type="button"
                    onClick={() => onToggleExpand(item.key)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                  </button>
                )}
                {isAdminOnly ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-amber-400">
                    <FaShieldAlt size={12} />
                  </div>
                ) : (
                  <Toggle enabled={isEnabled} onChange={() => onPermissionToggle(item.key)} />
                )}
              </div>
            </div>

            {/* Sub-tabs */}
            <AnimatePresence>
              {hasSubTabs && isExpanded && (
                <motion.div
                  className="ml-4 sm:ml-5 mt-1 pl-2 sm:pl-3 border-l-2 border-indigo-100 space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.subTabs.map((subTab) => {
                    const isSubEnabled = currentPermissions.includes(subTab.key);
                    return (
                      <div
                        key={subTab.key}
                        className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg border transition-all duration-150 ${
                          isSubEnabled ? "border-indigo-100 bg-indigo-50/40" : "border-gray-100 bg-white hover:bg-gray-50/50"
                        }`}
                      >
                        <span className="text-xs sm:text-sm w-5 text-center flex-shrink-0">{subTab.icon}</span>
                        <span className="text-xs font-medium text-gray-700 flex-1 leading-tight">{subTab.label}</span>
                        <Toggle enabled={isSubEnabled} onChange={() => onPermissionToggle(subTab.key)} size="sm" />
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Info note */}
      <div className="mt-3 flex items-start gap-2.5 p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-100">
        <FaShieldAlt className="text-gray-300 mt-0.5 flex-shrink-0" size={11} />
        <div className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed space-y-0.5">
          <p>
            <span className="font-semibold text-gray-500">Admin Only</span> items cannot be assigned to departments.
          </p>
          <p>
            <span className="font-semibold text-gray-500">Settings tabs</span> — expand ⚙️ to choose which tabs each department can access.
          </p>
          <p>Toggling a sub-tab automatically enables the Settings menu item.</p>
        </div>
      </div>
    </div>
  </>
);

/* ---------------------------- Main Component ---------------------------- */
function SettingsModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [expandedItems, setExpandedItems] = useState({ settings: true });
  const [departmentPermissions, setDepartmentPermissions] = useState(DEFAULT_PERMISSIONS);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDeptColor, setSelectedDeptColor] = useState(DEPT_COLORS[0]);
  const [mobileView, setMobileView] = useState("list");

  const hasLoadedPermissions = useRef(false);
  const hasLoadedDepartments = useRef(false);
  const deptColorMap = useRef({});

  /* ---- Fetch Departments ---- */
  useEffect(() => {
    if (!open || hasLoadedDepartments.current) return;
    let isMounted = true;

    const fetchDepartments = async () => {
      try {
        const response = await fetch("https://taskbe.sharda.co.in/api/departments");
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!isMounted || !data?.length) {
          setDepartments([]);
          return;
        }

        colorIndex = 0;
        const fetchedDepartments = data.map((dept) => {
          const key = dept.name.toLowerCase().trim();
          if (!deptColorMap.current[key]) deptColorMap.current[key] = getNextColor();
          return { key, label: dept.name, color: deptColorMap.current[key] };
        });

        setDepartments(fetchedDepartments);
        hasLoadedDepartments.current = true;
        if (fetchedDepartments.length > 0) {
          setSelectedDepartment(fetchedDepartments[0].key);
          setSelectedDeptColor(fetchedDepartments[0].color);
        }
      } catch {
        if (isMounted) setDepartments([]);
      }
    };

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, [open]);

  /* ---- Load Permissions ---- */
  useEffect(() => {
    if (!open || hasLoadedPermissions.current) return;
    let isMounted = true;

    const loadPermissions = async () => {
      try {
        const response = await fetch("https://taskbe.sharda.co.in/api/permissions");
        const data = await response.json();
        if (!isMounted) return;

        const merged = { ...DEFAULT_PERMISSIONS, ...data };
        if (merged["human resource"]) {
          if (!merged["human resource"].includes("settings"))
            merged["human resource"] = [...merged["human resource"], "settings"];
          if (!merged["human resource"].includes("settings_tab_leave"))
            merged["human resource"] = [...merged["human resource"], "settings_tab_leave"];
        }

        setDepartmentPermissions(merged);
        localStorage.setItem("departmentPermissions", JSON.stringify(merged));
        hasLoadedPermissions.current = true;
      } catch {
        if (!isMounted) return;
        const saved = localStorage.getItem("departmentPermissions");
        setDepartmentPermissions(saved ? JSON.parse(saved) : DEFAULT_PERMISSIONS);
      }
    };

    loadPermissions();
    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      hasLoadedPermissions.current = false;
      hasLoadedDepartments.current = false;
      setMobileView("list");
    }
  }, [open]);

  /* ---- Handlers ---- */
  const handleSelectDepartment = (dept) => {
    setSelectedDepartment(dept.key);
    setSelectedDeptColor(dept.color);
    setMobileView("permissions");
  };

  const handleToggleExpand = (key) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePermissionToggle = (menuItemKey) => {
    if (!selectedDepartment) return;
    setDepartmentPermissions((prev) => {
      const currentPerms = prev[selectedDepartment] || [];
      let newPerms;
      if (currentPerms.includes(menuItemKey)) {
        if (menuItemKey === "settings") {
          const subTabKeys = ALL_MENU_ITEMS.find((i) => i.key === "settings")?.subTabs?.map((s) => s.key) || [];
          newPerms = currentPerms.filter((k) => k !== menuItemKey && !subTabKeys.includes(k));
        } else {
          newPerms = currentPerms.filter((k) => k !== menuItemKey);
        }
      } else {
        const isSubTab = ALL_MENU_ITEMS.find((i) => i.key === "settings")?.subTabs?.some((s) => s.key === menuItemKey);
        if (isSubTab && !currentPerms.includes("settings")) {
          newPerms = [...currentPerms, "settings", menuItemKey];
        } else {
          newPerms = [...currentPerms, menuItemKey];
        }
      }
      return { ...prev, [selectedDepartment]: newPerms };
    });
  };

  const handleSavePermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://taskbe.sharda.co.in/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(departmentPermissions),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("departmentPermissions", JSON.stringify(departmentPermissions));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        throw new Error(data.message || "Failed");
      }
    } catch (error) {
      alert("Failed to save permissions.\nError: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!window.confirm("Reset all permissions to default?")) return;
    setLoading(true);
    try {
      const response = await fetch("https://taskbe.sharda.co.in/api/permissions/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDepartmentPermissions(data.permissions);
        localStorage.setItem("departmentPermissions", JSON.stringify(data.permissions));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch {
      alert("Failed to reset permissions.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const currentPermissions = departmentPermissions[selectedDepartment] || [];
  const enabledCount = currentPermissions.filter((p) => !p.startsWith("settings_tab_")).length;
  const settingsItem = ALL_MENU_ITEMS.find((i) => i.key === "settings");
  const enabledSubTabsCount = settingsItem?.subTabs?.filter((s) => currentPermissions.includes(s.key)).length || 0;
  const totalItems = ALL_MENU_ITEMS.filter((i) => !i.adminOnly).length;
  const selectedDeptLabel = departments.find((d) => d.key === selectedDepartment)?.label || "";
  const progressPct = Math.round(Math.min((enabledCount / totalItems) * 100, 100));

  /* ---- Shared props for PermissionsPanel ---- */
  const permPanelProps = {
    selectedDeptLabel,
    selectedDeptColor,
    enabledCount,
    totalItems,
    progressPct,
    currentPermissions,
    expandedItems,
    onToggleExpand: handleToggleExpand,
    onPermissionToggle: handlePermissionToggle,
    enabledSubTabsCount,
  };

  /* ---- Shared props for DeptList ---- */
  const deptListProps = {
    departments,
    departmentPermissions,
    selectedDepartment,
    onSelectDepartment: handleSelectDepartment,
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="w-full sm:max-w-5xl flex flex-col overflow-hidden"
          style={{
            background: "#ffffff",
            borderRadius: "16px 16px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
            maxHeight: "94vh",
          }}
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.28, type: "spring", stiffness: 140, damping: 20 }}
        >
          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
            <div className="w-8 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* ===== HEADER ===== */}
          <div className="flex items-center justify-between px-4 sm:px-7 py-3 sm:py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {mobileView === "permissions" && (
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 -ml-1.5 transition-all"
                >
                  <FaArrowLeft size={13} />
                </button>
              )}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200">
                <FaShieldAlt className="text-white text-xs sm:text-sm" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
                  <span className="sm:hidden">
                    {mobileView === "permissions" && selectedDeptLabel ? (
                      <span className="capitalize">{selectedDeptLabel}</span>
                    ) : (
                      "Access Permissions"
                    )}
                  </span>
                  <span className="hidden sm:inline">Access Permissions</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-400 leading-tight mt-0.5">
                  <span className="sm:hidden">
                    {mobileView === "permissions" ? `${enabledCount} of ${totalItems} features enabled` : "Select a department"}
                  </span>
                  <span className="hidden sm:inline">Control what each department can see</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div
                    className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full"
                    initial={{ opacity: 0, scale: 0.8, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <FaCheck size={8} />
                    Saved!
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <FaTimes size={13} />
              </button>
            </div>
          </div>

          {/* ===== BODY ===== */}

          {/* --- MOBILE: 2-step view --- */}
          <div className="sm:hidden flex flex-col flex-1 overflow-hidden min-h-0">
            <AnimatePresence mode="wait">
              {mobileView === "list" ? (
                <motion.div
                  key="mobile-list"
                  className="flex flex-col flex-1 overflow-hidden"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/70">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {departments.length} Department{departments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <DeptList mobile={true} {...deptListProps} />
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-perms"
                  className="flex flex-col flex-1 overflow-y-auto"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <PermissionsPanel {...permPanelProps} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- DESKTOP: side-by-side --- */}
          <div className="hidden sm:flex flex-1 overflow-hidden min-h-0" style={{ borderRadius: "0 0 16px 16px" }}>
            {/* Left sidebar */}
            <div className="w-64 flex-shrink-0 border-r border-gray-100 flex flex-col overflow-hidden bg-gray-50/60">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departments</p>
              </div>
              <DeptList mobile={false} {...deptListProps} />
            </div>

            {/* Right panel */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {departments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-16">
                    <HiOutlineCog6Tooth className="mx-auto text-6xl text-gray-200 mb-4" />
                    <p className="text-gray-400 text-sm">Add departments to configure permissions</p>
                  </div>
                </div>
              ) : (
                <PermissionsPanel {...permPanelProps} />
              )}
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="flex items-center justify-between px-4 sm:px-7 py-3 sm:py-4 border-t border-gray-100 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={handleResetPermissions}
              disabled={loading}
              className="text-[11px] sm:text-xs font-medium text-gray-400 hover:text-gray-600 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-40"
            >
              Reset defaults
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={loading}
                className="px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all disabled:opacity-40 flex items-center gap-1.5 sm:gap-2 shadow-sm shadow-indigo-200"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={10} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SettingsModal;