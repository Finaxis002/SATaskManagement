// import React , {useState, useEffect} from "react";
// import { User2, Users } from "lucide-react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
// import {
//   FaUsers,
// } from "react-icons/fa";

// const ChatSidebar = ({
//   showGroups,
//   groupUnreadCounts,
//   currentUser,
//   userUnreadCounts,
//   groups,
//   selectedGroup,
//   handleGroupClick,
//   setShowGroups,
//   searchTerm ,
//   admins,
//   selectedUser,
//   regularUsers,
//   users,
//   handleUserClick,
//   setSearchTerm
// }) => {

  

//   return (
//     <div className="w-1/4 bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
//       {/* Toggle Buttons for Groups and Users/Personal Chat */}
//       <div className="flex gap-4 mb-4 relative">
//         {/* Groups Button */}
//         <button
//           onClick={() => setShowGroups(true)}
//           className={`relative px-4 py-2 text-sm rounded-lg ${
//             showGroups ? "bg-indigo-100" : "bg-gray-200"
//           }`}
//         >
//           Groups
//           {Object.values(groupUnreadCounts).reduce(
//             (acc, count) => acc + count,
//             0
//           ) > 0 && (
//             <span className="absolute top-[-6px] right-[-10px] bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
//               {Object.values(groupUnreadCounts).reduce(
//                 (acc, count) => acc + count,
//                 0
//               )}
//             </span>
//           )}
//         </button>

//         {/* Personal Chat/Users Button */}
//         <button
//           onClick={() => setShowGroups(false)}
//           className={`relative px-4 py-2 text-sm rounded-lg ${
//             !showGroups ? "bg-indigo-100" : "bg-gray-200"
//           }`}
//         >
//           {currentUser.role === "user" ? "Personal Chat" : "Users"}
//           {Object.values(userUnreadCounts).reduce(
//             (acc, count) => acc + count,
//             0
//           ) > 0 && (
//             <span className="absolute top-[-6px] right-[-10px] bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
//               {Object.values(userUnreadCounts).reduce(
//                 (acc, count) => acc + count,
//                 0
//               )}
//             </span>
//           )}
//         </button>
//       </div>

//       {/* Groups/Users Section */}
//       {showGroups ? (
//         <div className="flex-1 overflow-auto mb-6">
//           <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
//             {currentUser.role === "user" ? "Your Groups" : "Groups"}
//           </h3>
//           {groups.length === 0 ? (
//             <p className="text-center text-gray-400 italic">
//               No chat group assigned.
//             </p>
//           ) : (
//             <ul className="space-y-2">
//               {groups.map((group) => (
//                 <li
//                   key={group}
//                   onClick={() => handleGroupClick(group)}
//                   className={`relative cursor-pointer p-3 rounded-lg flex justify-between items-center transition-all duration-200 border ${
//                     selectedGroup === group
//                       ? "bg-indigo-100 border-indigo-300"
//                       : "hover:bg-gray-50 border-gray-200"
//                   }`}
//                 >
//                   <div className="flex flex-row items-center gap-2">
//                     <span className="text-indigo-600 flex gap-4 items-center font-medium text-sm hover:underline relative">
//                       <FaUsers className="text-indigo-600 text-lg" />
//                       {group}
//                     </span>
//                     {groupUnreadCounts[group] > 0 && (
//                       <span className="bg-red-500 text-white text-xs px-1 py-0 rounded-full">
//                         {groupUnreadCounts[group]}
//                       </span>
//                     )}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       ) : (
//         <div className="border-t border-gray-200 h-[70vh] overflow-y-auto">
//           <h3 className="text-xl font-bold mb-3 text-center text-gray-700">
//             {currentUser.role === "user" ? "Personal Chat" : "Users"}
//           </h3>
//           <div className="overflow-y-auto space-y-2 pr-1">
//             <div className="relative px-2 mb-3 py-2">
//               {/* Search Icon */}
//               <FontAwesomeIcon
//                 icon={faSearch}
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
//               />

//               {/* Input Field */}
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search user by name..."
//                 className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
//               />

//               {/* Clear Button */}
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm("")}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
//                 >
//                   <FontAwesomeIcon icon={faTimesCircle} />
//                 </button>
//               )}
//             </div>

//             {admins.length > 0 && (
//               <>
//                 <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2">
//                   Administrators
//                 </h4>
//                 {admins
//                   .filter(
//                     (admin) =>
//                       admin.name !== currentUser.name &&
//                       admin.userId !== currentUser.userId
//                   )
//                   .map((admin) => (
//                     <div
//                       key={admin._id || admin.userId}
//                       onClick={() => handleUserClick(admin)}
//                       className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
//                         selectedUser?._id === admin._id ||
//                         selectedUser?.userId === admin.userId
//                           ? "bg-indigo-100 border-indigo-300"
//                           : "bg-white hover:bg-gray-100 border-gray-200"
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
//                           {admin.name
//                             ? admin.name.charAt(0).toUpperCase()
//                             : admin.userId.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <span className="text-sm font-medium text-gray-800 block">
//                             {admin.name || admin.userId}{" "}
//                             {/* Fall back to `userId` if name is missing */}
//                           </span>
//                           {admin.position && (
//                             <span className="text-xs text-gray-500 block">
//                               {admin.position}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       {userUnreadCounts[admin.name || admin.userId] > 0 && (
//                         <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
//                           {userUnreadCounts[admin.name || admin.userId]}
//                         </span>
//                       )}
//                     </div>
//                   ))}
//               </>
//             )}

//             {regularUsers.length > 0 && (
//               <>
//                 <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2 mt-4">
//                   Team Members
//                 </h4>
//                 {regularUsers
//                   .filter(
//                     (user) =>
//                       user.name !== currentUser.name &&
//                       user.userId !== currentUser.userId
//                   )
//                   .map((user) => (
//                     <div
//                       key={user._id || user.userId} // Use `_id` or `userId` to uniquely identify each user
//                       onClick={() => handleUserClick(user)}
//                       className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
//                         selectedUser?._id === user._id ||
//                         selectedUser?.userId === user.userId
//                           ? "bg-indigo-100 border-indigo-300"
//                           : "bg-white hover:bg-gray-100 border-gray-200"
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
//                           {user.name?.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <span className="text-sm font-medium text-gray-800 block">
//                             {user.name}
//                           </span>
//                           {user.position && (
//                             <span className="text-xs text-gray-500 block">
//                               {user.position}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       {userUnreadCounts[user.name] > 0 && (
//                         <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
//                           {userUnreadCounts[user.name]}
//                         </span>
//                       )}
//                     </div>
//                   ))}
//               </>
//             )}

//             {users.length === 0 && (
//               <p className="text-sm text-gray-400 text-center">
//                 No users found.
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatSidebar;




import React from "react";
import { FaUsers } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const ChatSidebar = ({
  showGroups,
  groupUnreadCounts,
  currentUser,
  userUnreadCounts,
  groups,
  selectedGroup,
  handleGroupClick,
  setShowGroups,
  searchTerm,
  admins,
  selectedUser,
  regularUsers,
  users,
  handleUserClick,
  setSearchTerm,
  messages,
  sortGroups,
  sortUsers
}) => {
  // Sorting function to sort groups by the most recent message
const sortedGroups = sortGroups(groups, messages); // Ensure the groups are sorted
const sortedUsers = sortUsers(regularUsers, messages); // Ensure the users are sorted
console.log('Sorted Groups:', sortedGroups);
console.log('Sorted Users:', sortedUsers);


  return (
    <div className="w-1/4 bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
      {/* Toggle Buttons for Groups and Users/Personal Chat */}
      <div className="flex gap-4 mb-4 relative">
        {/* Groups Button */}
        <button
          onClick={() => setShowGroups(true)}
          className={`relative px-4 py-2 text-sm rounded-lg ${showGroups ? "bg-indigo-100" : "bg-gray-200"}`}
        >
          Groups
          {Object.values(groupUnreadCounts).reduce((acc, count) => acc + count, 0) > 0 && (
            <span className="absolute top-[-6px] right-[-10px] bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
              {Object.values(groupUnreadCounts).reduce((acc, count) => acc + count, 0)}
            </span>
          )}
        </button>

        {/* Personal Chat/Users Button */}
        <button
          onClick={() => setShowGroups(false)}
          className={`relative px-4 py-2 text-sm rounded-lg ${!showGroups ? "bg-indigo-100" : "bg-gray-200"}`}
        >
          {currentUser.role === "user" ? "Personal Chat" : "Users"}
          {Object.values(userUnreadCounts).reduce((acc, count) => acc + count, 0) > 0 && (
            <span className="absolute top-[-6px] right-[-10px] bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
              {Object.values(userUnreadCounts).reduce((acc, count) => acc + count, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Groups/Users Section */}
      {showGroups ? (
        <div className="flex-1 overflow-auto mb-6">
          <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
            {currentUser.role === "user" ? "Your Groups" : "Groups"}
          </h3>
          {sortedGroups.length === 0 ? (
            <p className="text-center text-gray-400 italic">No chat group assigned.</p>
          ) : (
            <ul className="space-y-2">
              {sortedGroups.map((group) => (
                <li
                  key={group}
                  onClick={() => handleGroupClick(group)}
                  className={`relative cursor-pointer p-3 rounded-lg flex justify-between items-center transition-all duration-200 border ${
                    selectedGroup === group
                      ? "bg-indigo-100 border-indigo-300"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-indigo-600 flex gap-4 items-center font-medium text-sm hover:underline relative">
                      <FaUsers className="text-indigo-600 text-lg" />
                      {group}
                    </span>
                    {groupUnreadCounts[group] > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1 py-0 rounded-full">
                        {groupUnreadCounts[group]}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-200 h-[70vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-3 text-center text-gray-700">
            {currentUser.role === "user" ? "Personal Chat" : "Users"}
          </h3>
          <div className="overflow-y-auto space-y-2 pr-1">
            <div className="relative px-2 mb-3 py-2">
              {/* Search Icon */}
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              />

              {/* Input Field */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user by name..."
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />

              {/* Clear Button */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              )}
            </div>

            {admins.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2">
                  Administrators
                </h4>
                {admins
                  .filter(
                    (admin) =>
                      admin.name !== currentUser.name &&
                      admin.userId !== currentUser.userId
                  )
                  .map((admin) => (
                    <div
                      key={admin._id || admin.userId}
                      onClick={() => handleUserClick(admin)}
                      className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
                        selectedUser?._id === admin._id ||
                        selectedUser?.userId === admin.userId
                          ? "bg-indigo-100 border-indigo-300"
                          : "bg-white hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {admin.name
                            ? admin.name.charAt(0).toUpperCase()
                            : admin.userId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800 block">
                            {admin.name || admin.userId}{" "}
                            {/* Fall back to `userId` if name is missing */}
                          </span>
                          {admin.position && (
                            <span className="text-xs text-gray-500 block">
                              {admin.position}
                            </span>
                          )}
                        </div>
                      </div>
                      {userUnreadCounts[admin.name || admin.userId] > 0 && (
                        <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {userUnreadCounts[admin.name || admin.userId]}
                        </span>
                      )}
                    </div>
                  ))}
              </>
            )}

            {sortedUsers.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2 mt-4">
                  Team Members
                </h4>
                {sortedUsers
                  .filter(
                    (user) =>
                      user.name !== currentUser.name &&
                      user.userId !== currentUser.userId
                  )
                  .map((user) => (
                    <div
                      key={user._id || user.userId} // Use `_id` or `userId` to uniquely identify each user
                      onClick={() => handleUserClick(user)}
                      className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
                        selectedUser?._id === user._id ||
                        selectedUser?.userId === user.userId
                          ? "bg-indigo-100 border-indigo-300"
                          : "bg-white hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800 block">
                            {user.name}
                          </span>
                          {user.position && (
                            <span className="text-xs text-gray-500 block">
                              {user.position}
                            </span>
                          )}
                        </div>
                      </div>
                      {userUnreadCounts[user.name] > 0 && (
                        <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {userUnreadCounts[user.name]}
                        </span>
                      )}
                    </div>
                  ))}
              </>
            )}

            {users.length === 0 && (
              <p className="text-sm text-gray-400 text-center">No users found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
