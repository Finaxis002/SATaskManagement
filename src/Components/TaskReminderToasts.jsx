// src/components/TaskReminderToasts.js
// import React, { useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';
// import  '../styles/TaskReminderToastsStyle.css';
// import reminderSound from '../assets/reminderSound.mp3'

// const socket = io('http://localhost:5000');

// const TaskReminderToasts = () => {
//   const [toasts, setToasts] = useState([]);
//   const audioRef = useRef(null);

//   // Load audio file
//   useEffect(() => {
//     audioRef.current = new Audio(reminderSound);
//     audioRef.current.volume = 0.3; // Set volume to 30%
//   }, []);

//   useEffect(() => {
//     const handleReminder = (data) => {
//       if (data?.message) {
//         const newToast = {
//           id: Date.now(),
//           message: data.message,
//           type: data.message.includes('TODAY') ? 'urgent' : 'regular'
//         };
        
//         setToasts((prev) => [...prev, newToast]);
//         // Play sound
//         if (audioRef.current) {
//           audioRef.current.currentTime = 0; // Rewind to start
//           audioRef.current.play().catch(e => console.log("Audio play failed:", e));
//         }
        
//         // Auto-remove after 5 seconds
//         setTimeout(() => {
//           setToasts((prev) => prev.filter(t => t.id !== newToast.id));
//         }, 10000);
//       }
//     };

//     socket.on('task-reminder', handleReminder);
//     return () => socket.off('task-reminder', handleReminder);
//   }, []);

//   // useEffect(() => {
//   //   const handleReminder = (data) => {
//   //     const userEmail = localStorage.getItem('userId');
//   //     const userRole = localStorage.getItem('role');
      
//   //     // Check if this notification is for the current user or admin
//   //     if ((data.assigneeEmail === userEmail) || (userRole === 'admin')) {
//   //       const newToast = {
//   //         id: Date.now(),
//   //         message: data.message,
//   //         type: data.message.includes('TODAY') ? 'urgent' : 'regular'
//   //       };
        
//   //       setToasts((prev) => [...prev, newToast]);
        
//   //       // Play sound if enabled
//   //       if (audioRef.current) {
//   //         audioRef.current.currentTime = 0;
//   //         audioRef.current.play().catch(e => console.log("Audio play failed:", e));
//   //       }
  
//   //       setTimeout(() => {
//   //         setToasts((prev) => prev.filter(t => t.id !== newToast.id));
//   //       }, 5000);
//   //     }
//   //   };
  
//   //   socket.on('task-reminder', handleReminder);
//   //   return () => socket.off('task-reminder', handleReminder);
//   // }, []);

//   const handleClose = (id) => {
//     setToasts((prev) => prev.filter(t => t.id !== id));
//   };

//   return (
//     <div className="toast-container">
//       {toasts.map((toast) => (
//         <div 
//           key={toast.id}
//           className={`toast ${toast.type}`}
//         >
//           <div className="toast-message">{toast.message}</div>
//           <button 
//             className="toast-close"
//             onClick={() => handleClose(toast.id)}
//             aria-label="Close notification"
//           >
//             &times;
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TaskReminderToasts;
////////////////////////////////////////////////////////////////////////////////

// import React, { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import '../styles/TaskReminderToastsStyle.css';
// import notificationSound from '../assets/reminderSound.mp3';

// const socket = io('http://localhost:5000');

// const TaskReminderToasts = () => {
//   // const [toasts, setToasts] = useState([]);
//   // const audioRef = useRef(null);
//   const [notifications, setNotifications] = useState([]);

//   // Initialize audio
//   // useEffect(() => {
//   //   audioRef.current = new Audio(notificationSound);
//   //   audioRef.current.volume = 0.3;
//   //   return () => {
//   //     if (audioRef.current) {
//   //       audioRef.current.pause();
//   //       audioRef.current = null;
//   //     }
//   //   };
//   // }, []);

//   // useEffect(() => {
//   //   console.log('Setting up socket listeners...');

//   //   // Register user
//   //   const userEmail = localStorage.getItem('userId');
//   //   const userName = localStorage.getItem('name');
    
//   //   if (userEmail && userName) {
//   //     socket.emit('register', userEmail, userName);
//   //     console.log('User registered:', userEmail);
//   //   }

//   //   const handleReminder = (message) => {
//   //     console.log('RAW MESSAGE RECEIVED:', message);
      
//   //     const newToast = {
//   //       id: Date.now(),
//   //       message: message,
//   //       type: message.includes('TODAY') ? 'urgent' : 'regular'
//   //     };

//   //     console.log('ADDING TOAST:', newToast);
//   //     setToasts(prev => [...prev, newToast]);

//   //     // Play sound
//   //     try {
//   //       audioRef.current.currentTime = 0;
//   //       audioRef.current.play();
//   //     } catch (e) {
//   //       console.log('Sound error:', e);
//   //     }

//   //     // Auto-dismiss after 5 seconds
//   //     setTimeout(() => {
//   //       setToasts(prev => prev.filter(t => t.id !== newToast.id));
//   //     }, 5000);
//   //   };

//   //   socket.on('task-reminder', handleReminder);
//   //   console.log('Socket listener set up for task-reminder');

//   //   // Test notification (remove in production)
//   //   setTimeout(() => {
//   //     handleReminder("🔔 TEST REMINDER: System is working!");
//   //   }, 2000);

//   //   return () => {
//   //     socket.off('task-reminder', handleReminder);
//   //   };
//   // }, []);

//   // const handleClose = (id) => {
//   //   setToasts((prev) => prev.filter(t => t.id !== id));
//   // };
//   useEffect(() => {
//     console.log("Setting up socket listener...");
    
//     // Direct message handler - no transformations
//     const handleReminder = (message) => {
//       console.log("Displaying toast:", message);
//       setNotifications(prev => [...prev, {
//         id: Date.now(), // Simple unique ID
//         text: message   // Directly use the raw string
//       }]);
      
//       // Auto-remove after 5 seconds
//       setTimeout(() => {
//         setNotifications(prev => prev.slice(1)); // Remove oldest
//       }, 5000);
//     };

//     socket.on('task-reminder', handleReminder);
    
//     return () => {
//       socket.off('task-reminder', handleReminder);
//     };
//   }, []);

//   return (
//   //   <div className="toast-container">
//   //   {toasts.map((toast) => (
//   //     <div 
//   //       key={toast.id}
//   //       className={`toast ${toast.type}`}
//   //     >
//   //       <div className="toast-content">
//   //         <span className="toast-icon">🔔</span>
//   //         <span className="toast-message">{toast.message}</span>
//   //       </div>
//   //       <button 
//   //         className="toast-close"
//   //         onClick={() => handleClose(toast.id)}
//   //       >
//   //         ×
//   //       </button>
//   //     </div>
//   //   ))}
//   // </div>
//   <div className="toast-container">
//       {notifications.map(notification => (
//         <div key={notification.id} className="toast">
//           {notification.text}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TaskReminderToasts;






////////////////////////////////////////////////////////////////////////////////////
// import React, { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import '../styles/TaskReminderToastsStyle.css';  // Ensure the CSS is loaded
// import notificationSound from '../assets/reminderSound.mp3';  // Notification sound

// const socket = io('http://localhost:5000');  // Backend URL

// const TaskReminderToasts = () => {
//   const [notifications, setNotifications] = useState([]);
  
//   const audioRef = useRef(null); // Reference for audio
  
//   // Initialize audio for reminder sound
//   useEffect(() => {
//     audioRef.current = new Audio(notificationSound);
//     audioRef.current.volume = 0.3; // Set volume to 30%
//   }, []);

//   useEffect(() => {
//     console.log("Setting up socket listener...");

//     // Register user if already connected
//     const userEmail = localStorage.getItem('userId');
//     const userName = localStorage.getItem('name');
//     if (socket.connected && userEmail && userName) {
//       socket.emit('register', userEmail, userName); // Emit 'register' event with email and username
//     }

//     // Handle incoming reminders
//     // const handleReminder = (message) => {
//     //   console.log('RAW REMINDER MESSAGE:', message);

//     //   if (message) {
//     //     const newToast = {
//     //       id: Date.now(), // Generate a unique ID for each reminder
//     //       message: message,
//     //       type: message.includes('TODAY') ? 'urgent' : 'regular', // Assign a type based on message content
//     //     };

//     //     setNotifications(prev => [...prev, newToast]);

//     //     // Play reminder sound if available
//     //     if (audioRef.current) {
//     //       audioRef.current.currentTime = 0;
//     //       audioRef.current.play().catch(e => console.log("Audio play failed:", e));
//     //     }

//     //     // Remove the toast after 5 seconds
//     //     // setTimeout(() => {
//     //     //   setNotifications(prev => prev.filter(t => t.id !== newToast.id)); // Remove the toast by its ID
//     //     // }, 5000); // Auto-remove after 5 seconds
//     //   }
//     // };
//     const handleReminder = (message) => {
//       console.log('RAW REMINDER MESSAGE:', message);
    
//       if (message) {
//         const newToast = {
//           id: Date.now(),
//           message: message,
//           type: message.includes('TODAY') ? 'urgent' : 'regular',
//         };
    
//         setNotifications(prev => [...prev, newToast]);
    
//         if (audioRef.current && isAudioUnlocked) {
//           audioRef.current.currentTime = 0;
//           audioRef.current.play().then(() => console.log('Audio played ✅')).catch((e) => console.log("Audio play failed:", e));
//         } else {
//           console.log('Audio not unlocked yet 🚫');
//         }
    
//         // Set timeout to remove this particular toast after 5 seconds
//         setTimeout(() => {
//           setNotifications(prev => prev.filter(t => t.id !== newToast.id));
//         }, 5000);
//       }
//     };
    

//     socket.on('task-reminder', handleReminder); // Listen for task reminder event

//     // Cleanup when component is unmounted
//     return () => {
//       socket.off('task-reminder', handleReminder);
//     };
//   }, []);

//   // useEffect(() => {
//   //   if (notifications.length > 0) {
//   //     const timer = setTimeout(() => {
//   //       setNotifications(prev => prev.slice(1)); // remove first toast
//   //     }, 5000); // Remove oldest after 5 seconds
  
//   //     return () => clearTimeout(timer); // Cleanup on unmount or update
//   //   }
//   // }, [notifications]);
  
//   console.log('CURRENT REMINDERS:', notifications);

//   return (
//     <div className="toast-container">
//       {notifications.length > 0 ? (
//         notifications.map((notification) => (
//           <div key={notification.id} className={`toast ${notification.type}`}>
//             <div className="toast-message">
//               <span className="toast-icon">🔔</span>
//               {notification.message}
//             </div>
//             <button 
//               className="toast-close"
//               onClick={() => setNotifications(prev => prev.filter(t => t.id !== notification.id))}
//             >
//               &times;
//             </button>
//           </div>
//         ))
//       ) : (
//         <p>🔔</p>
//       )}
//     </div>
//   );
// };

// export default TaskReminderToasts;


/////////////////////////////////////////////////////////////////////////////////////////////
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/TaskReminderToastsStyle.css';
import notificationSound from '../assets/reminderSound.mp3';

const TaskReminderToasts = () => {
  const [notifications, setNotifications] = useState([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const audioRef = useRef(null);
  const socketRef = useRef(null);  // 🆕 Correct way to store socket

  // 🛠 Create handleReminder OUTSIDE
  const handleReminder = (message) => {
    console.log('RAW REMINDER MESSAGE:', message);

    const newToast = {
      id: Date.now(),
      message,
      type: message.includes('TODAY') ? 'urgent' : 'regular',
    };

    setNotifications(prev => [...prev, newToast]);

    if (audioRef.current && isAudioUnlocked) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => console.log('Audio played ✅'))
        .catch((e) => console.log('Audio play failed:', e));
    } else {
      console.log('Audio not unlocked yet 🚫');
    }

    // Remove toast after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  // 🛠 Setup socket and unlock audio
  useEffect(() => {
    console.log('Initializing socket and audio...');

    // Correct socket connection inside component
    socketRef.current = io('http://localhost:5000', { transports: ['websocket'] });

    const audio = new Audio(notificationSound);
    audio.volume = 0.3;
    audioRef.current = audio;

    const unlockAudio = () => {
      setIsAudioUnlocked(true);
      console.log('Audio unlocked ✅');
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Setup socket listeners
    socketRef.current.on('connect', () => {
      console.log('Socket connected ✅');
      const userEmail = localStorage.getItem('userId');
      const userName = localStorage.getItem('name');
      if (userEmail && userName) {
        socketRef.current.emit('register', userEmail, userName);
      }
    });

    socketRef.current.on('task-reminder', handleReminder);

    // Cleanup when unmount
    return () => {
      console.log('Cleaning up socket and events...');
      if (socketRef.current) {
        socketRef.current.off('task-reminder', handleReminder);
        socketRef.current.disconnect();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`toast ${notification.type}`}>
          <div className="toast-message">
            <span className="toast-icon">🔔</span>
            {notification.message}
          </div>
          <button
            className="toast-close"
            onClick={() =>
              setNotifications(prev => prev.filter(t => t.id !== notification.id))
            }
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default TaskReminderToasts;
