const UserDashboard = () => {
    const tasks = [
      { title: "New Task", date: "Today" },
      { title: "Draft project brief", date: "Monday" },
      { title: "Nexa Report", tag: "Cross-functional project", date: "Apr 9 - 11" },
    ];
  
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>
        </div>
        <div className="divide-y">
          {tasks.map((task, index) => (
            <div key={index} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="accent-blue-600" />
                <span className="text-gray-800">{task.title}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {task.tag && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    {task.tag}
                  </span>
                )}
                <span className="text-gray-500">{task.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default UserDashboard;
  