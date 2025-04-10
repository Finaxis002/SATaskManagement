import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTaskToColumn } from '../redux/taskSlice';

const TaskBoard = () => {
  const taskColumns = useSelector((state) => state.tasks.taskColumns);
  const dispatch = useDispatch();

  return (
    <div className="p-6 bg-white w-full min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Tasks</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            dispatch(
              addTaskToColumn({
                columnIndex: 1, // example: adding to 'Do today'
                task: { name: 'Follow up report', due: 'Today' },
              })
            );
          }}
        >
          + Add task
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {taskColumns.map((column, idx) => (
          <div key={idx} className="bg-transparent rounded-lg p-2">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="font-semibold text-gray-700">
                {column.title}{' '}
                <span className="text-gray-500 text-sm">{column.tasks.length}</span>
              </h3>
              <button className="text-gray-400 hover:text-gray-600 text-lg">+</button>
            </div>

            <div className="bg-gray-100 rounded-md p-2 min-h-[150px]">
              {column.tasks.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-6">+ Add task</div>
              ) : (
                <div className="space-y-2">
                  {column.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-md p-3 shadow-sm hover:shadow-md cursor-pointer border border-gray-200"
                    >
                      <h4 className="text-gray-800 font-medium text-sm mb-1">{task.name}</h4>
                      <p className="text-xs text-gray-500">{task.due}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
