import { useState, useCallback, useMemo, useEffect } from "react";

const baseURL = 'https://taskbe.sharda.co.in';

export const usePaymentTracker = (userData) => {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tasks with payment data for dashboard
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        role: userData.role || "admin",
        assignee: userData.userName || "",
        includePaymentData: true,
      });
      const res = await fetch(
        `${baseURL}/api/tasks/payment-tracker?${params}`
      );
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  // Fetch ALL tasks for dropdown
  const fetchAllTasks = useCallback(async () => {
    try {
      console.log("Fetching tasks for dropdown...");
      const params = new URLSearchParams({
        page: 1,
        limit: 5000,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      const res = await fetch(`${baseURL}/api/tasks/dropdown`);
      const data = await res.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        console.log(`Loaded ${data.tasks.length} tasks`);
        setAllTasks(data.tasks);
      } else {
        setAllTasks([]);
      }
    } catch (err) {
      console.error("Fetch all tasks error:", err);
      setAllTasks([]);
    }
  }, []);

  const saveStages = async (taskId, stages) => {
    try {
      const res = await fetch(
        `${baseURL}/api/tasks/${taskId}/payment-stages`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stages }),
        }
      );
      const data = await res.json();
    
      return data.success;
    } catch (err) {
      console.error("Save stages error:", err);
      return false;
    }
  };

  const logPayment = async (taskId, percentage, notes, loggedBy) => {
    try {
      const res = await fetch(
        `${baseURL}/api/tasks/${taskId}/log-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ percentage, notes, loggedBy }),
        }
      );
      const data = await res.json();
      // if (data.success) {
      //   await fetchTasks();
      //   await fetchAllTasks();
      // }
      return data.success;
    } catch (err) {
      console.error("Log payment error:", err);
      return false;
    }
  };

  const refreshTasks = useCallback(async () => {
  await Promise.all([fetchTasks(), fetchAllTasks()]);
}, [fetchTasks, fetchAllTasks]);

  // Stats: Only count tasks with payment stages
  const stats = useMemo(() => {
    const tasksWithStages = tasks.filter(task => 
      task.paymentStages && task.paymentStages.length > 0
    );
    
    const total = tasksWithStages.length;
    const paid = tasksWithStages.filter((t) => (t.paidPercentage || 0) >= 100).length;
    const partial = tasksWithStages.filter(
      (t) => (t.paidPercentage || 0) > 0 && (t.paidPercentage || 0) < 100
    ).length;
    const unpaid = tasksWithStages.filter((t) => (t.paidPercentage || 0) === 0).length;
    const avgPercentage = total > 0
      ? tasksWithStages.reduce((sum, t) => sum + (t.paidPercentage || 0), 0) / total
      : 0;
    
    return { total, paid, partial, unpaid, avgPercentage: Math.round(avgPercentage) };
  }, [tasks]);

  // Filtered tasks: Only show tasks with payment stages
  const filteredTasks = useMemo(() => {
    // Start with tasks that HAVE payment stages configured
    let filtered = tasks.filter(task => 
      task.paymentStages && task.paymentStages.length > 0
    );

    // Apply payment status filter
    if (filter === "paid") {
      filtered = filtered.filter((t) => (t.paidPercentage || 0) >= 100);
    } else if (filter === "partial") {
      filtered = filtered.filter(
        (t) => (t.paidPercentage || 0) > 0 && (t.paidPercentage || 0) < 100
      );
    } else if (filter === "unpaid") {
      filtered = filtered.filter((t) => (t.paidPercentage || 0) === 0);
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.taskName.toLowerCase().includes(term) ||
          (t.clientName && t.clientName.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [tasks, filter, searchTerm]);

  // useEffect(() => {
  //   fetchTasks();
  //   fetchAllTasks();
  // }, [fetchTasks, fetchAllTasks]);

  useEffect(() => {
  Promise.all([fetchTasks(), fetchAllTasks()]);
}, [fetchTasks, fetchAllTasks]);

  return {
    tasks,
    allTasks,
    loading,
    filter,
    searchTerm,
    stats,
    filteredTasks,
    setFilter,
    setSearchTerm,
    saveStages,
    logPayment,
    fetchTasks,    
    fetchAllTasks, 
     refreshTasks,
  };
};
