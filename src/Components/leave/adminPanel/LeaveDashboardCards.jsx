import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion"; // ✅ import framer-motion

const LeaveDashboardCards = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("https://taskbe.sharda.co.in/api/leave");
        setStats({
          total: data.length,
          pending: data.filter((l) => l.status === "Pending").length,
          approved: data.filter((l) => l.status === "Approved").length,
          users: new Set(data.map((l) => l.userId)).size,
        });
        setError(null);
      } catch (err) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardData = [
    {
      title: "Pending Requests",
      value: stats.pending,
      color: "bg-yellow-100 text-yellow-600",
      icon: <ClockIcon className="w-6 h-6" />,
    },
    {
      title: "Total Approved",
      value: stats.approved,
      color: "bg-green-100 text-green-600",
      icon: <CheckCircleIcon className="w-6 h-6" />,
    },
    {
      title: "Active Users",
      value: stats.users,
      color: "bg-blue-100 text-blue-600",
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      title: "All Requests",
      value: stats.total,
      color: "bg-purple-100 text-purple-600",
      icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-40 text-gray-500 text-lg">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-40 text-red-500 text-lg">{error}</div>;
  }

  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-8 text-center">
          Leave Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map(({ title, value, icon, color }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: index < 2 ? -100 : 100 }} // first 2 from left, last 2 from right
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} shadow-md`}>
                {icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeaveDashboardCards;







// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const LeaveDashboardCards = () => {
//   const [stats, setStats] = useState({
//     pending: 0,
//     approved: 0,
//     total: 0,
//     users: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const { data } = await axios.get("https://taskbe.sharda.co.in/api/leave");
//         setStats({
//           total: data.length,
//           pending: data.filter((l) => l.status === "Pending").length,
//           approved: data.filter((l) => l.status === "Approved").length,
//           users: new Set(data.map((l) => l.userId)).size,
//         });
//         setError(null);
//       } catch (err) {
//         setError("Failed to load data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const cardData = [
//     {
//       title: "Pending Requests",
//       value: stats.pending,
//       icon: (
//         <svg
//           className="w-7 h-7 text-gray-600"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//           aria-hidden="true"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//       ),
//     },
//     {
//       title: "Total Approved",
//       value: stats.approved,
//       icon: (
//         <svg
//           className="w-7 h-7 text-gray-600"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//           aria-hidden="true"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//         </svg>
//       ),
//     },
//     {
//       title: "Active Users",
//       value: stats.users,
//       icon: (
//         <svg
//           className="w-7 h-7 text-gray-600"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//           aria-hidden="true"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-10a4 4 0 11-8 0 4 4 0 018 0z"
//           />
//         </svg>
//       ),
//     },
//     {
//       title: "All Requests",
//       value: stats.total,
//       icon: (
//         <svg
//           className="w-7 h-7 text-gray-600"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//           aria-hidden="true"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h6M9 17l-3 3m0 0l-3-3m3 3V10" />
//         </svg>
//       ),
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-40 text-gray-500 text-lg">Loading dashboard...</div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-40 text-red-500 text-lg">{error}</div>
//     );
//   }

//   return (
//     <>
//       <style>{`
//         .rgb-animated-border {
//           position: relative;
//           border-radius: 0.5rem; /* Rounded-lg */
//           background: white;
//           padding: 2rem;
//           box-sizing: border-box;
//           cursor: default;
//           overflow: visible;
//           transition: box-shadow 0.3s ease;
//           z-index: 0;
//         }
//         /* The animated border */
//         .rgb-animated-border::before {
//           content: "";
//           position: absolute;
//           top: -3px;
//           left: -3px;
//           right: -3px;
//           bottom: -3px;
//           border-radius: 0.75rem; /* slightly bigger than container radius */
//           padding: 3px;
//           background: linear-gradient(270deg, 
//             #ff0000, #ffa500, #ffff00, #008000, #0000ff, #4b0082, #ee82ee, #ff0000);
//           background-size: 1600% 1600%;
//           animation: rgbRotate 8s linear infinite;
//           -webkit-mask:
//             linear-gradient(#fff 0 0) content-box, 
//             linear-gradient(#fff 0 0);
//           -webkit-mask-composite: destination-out;
//           mask-composite: exclude;
//           z-index: -1;
//         }
//         .rgb-animated-border:hover {
//           box-shadow: 0 0 12px rgba(0,0,0,0.12);
//         }
//         @keyframes rgbRotate {
//           0% {
//             background-position: 0% 50%;
//           }
//           100% {
//             background-position: 100% 50%;
//           }
//         }
//       `}</style>

//       <section className="h-120 bg-gray-100 py-12 px-6">
//         <div className="max-w-5xl mx-auto">
//           <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-12 text-center tracking-wide ">
//             Leave Dashboard
//           </h1>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 ">
//             {cardData.map(({ title, value, icon }) => (
//               <article key={title} className="  rgb-animated-border flex flex-col items-center text-center rounded-lg border border-gray-200 shadow-sm cursor-default">
//                 <div className="mb-4 p-4 rounded-full bg-gray-100">{icon}</div>
//                 <p className="text-lg font-medium text-gray-700 mb-1">{title}</p>
//                 <p className="text-3xl font-extrabold text-gray-900">{value}</p>
//               </article>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default LeaveDashboardCards;