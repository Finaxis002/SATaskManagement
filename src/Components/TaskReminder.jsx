// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// // Connect to your backend Socket.IO server
// const socket = io('http://localhost:5000');  // Replace with your actual backend URL

// const TaskReminders = () => {
//   const [reminders, setReminders] = useState([]);

//   useEffect(() => {
//     // Listen for reminders from the backend
//     socket.on('task-reminder', (data) => {
//       console.log('Received reminder:', data);
      
//       // If the message exists, add it to the reminders state
//       if (data && data.message) {
//         setReminders((prevReminders) => [
//           ...prevReminders,
//           data.message,  // Add the new reminder message
//         ]);
//       }
//     });

//     return () => {
//       // Clean up the listener when the component is unmounted
//       socket.off('task-reminder');
//     };
//   }, []);


//   return (
//     <div>
//       <h2>Task Reminders</h2>
//       <ul>
//         {reminders.length > 0 ? (
//           reminders.map((reminder, index) => (
//             <li key={index}>{reminder}</li>
//           ))
//         ) : (
//           <p>No reminders yet</p>  // Display message when no reminders are present
//         )}
//       </ul>
//     </div>
//   );
// };

// export default TaskReminders;


//////////////////////////////////////////////////////////////////////////////////////



// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');  // Backend URL

// const TaskReminders = () => {
//   const [reminders, setReminders] = useState([]);
 
//   console.log("TaskReminders component rendered");
//   // useEffect(() => {
//   //   console.log("useEffect triggered"); 
   
//   //   const userEmail = localStorage.getItem('userId');  // Get the user email from localStorage
//   //   const userName = localStorage.getItem('name');    // Get the user's name from localStorage

//   //   // Check if email and name exist in localStorage
//   //   if (userEmail && userName) {
//   //     socket.emit('register', userEmail, userName);  // Emit 'register' event with email and username
//   //     console.log("Register event emitted with:", userEmail, userName);
//   //   } else {
//   //     console.log('Error: User email or name not found in localStorage');
//   //   }

//   //   // Listen for task reminders from the backend
//   //   socket.on('task-reminder', (data) => {
//   //     console.log('Received reminder:', data);

//   //     // Add the reminder message to the state if it exists
//   //     if (data && data.message) {
//   //       setReminders((prevReminders) => [
//   //         ...prevReminders,
//   //         data.message,  // Add new reminder message
//   //       ]);
//   //     }
//   //   });

//   //   socket.on("connect", () => {
//   //     console.log("Reconnected to socket");
//   //     if (userEmail && userName) {
//   //       socket.emit("register", userEmail, userName); // Re-register on reconnect
//   //     }
//   //   });
  
//   //   return () => {
//   //     // Clean up the listener on unmount
//   //     socket.off('task-reminder');
//   //     socket.off("connect"); 
//   //   };
//   // }, []);
//   useEffect(() => {
//     console.log("useEffect triggered");
  
//     const userEmail = localStorage.getItem('userId');  // Get the user email from localStorage
//     const userName = localStorage.getItem('name');    // Get the user's name from localStorage
  
//     // Check if email and name exist in localStorage
//     if (userEmail && userName) {
//       // Listen for socket connection first
//       socket.on("connect", () => {
//         console.log("Socket connected, emitting register event.");
//         socket.emit('register', userEmail, userName);  // Emit 'register' event with email and username
//         console.log("Register event emitted with:", userEmail, userName);
//       });
//     } else {
//       console.log('Error: User email or name not found in localStorage');
//     }
  
//     // Listen for task reminders from the backend
//     socket.on('task-reminder', (data) => {
//       console.log('Received reminder:', data);
  
//       // Add the reminder message to the state if it exists
//       if (data && data.message) {
//         setReminders((prevReminders) => [
//           ...prevReminders,
//           data.message,  // Add new reminder message
//         ]);
//       }
//     });
  
//     // Cleanup on unmount
//     return () => {
//       // Clean up the listener on unmount
//       socket.off('task-reminder');
//       socket.off("connect");  // Clean up the connect event listener
//     };
//   }, []);
  
//   return (
//     <div>
//       <h2>Task Reminders</h2>
//       <ul>
//         {/* {reminders.length > 0 ? (
//           reminders.map((reminder, index) => (
//             <li key={index}>{reminder}</li>
//           ))
//         ) : (
//           <p>No reminders yet</p>  // Display message when no reminders are present
//         )} */}
//         {reminders.length > 0 ? (
//           reminders.map((reminder, index) => (
//             <li key={index}>{reminder}</li>  // Display each reminder in the list
//           ))
//         ) : (
//           <p>No reminders yet</p>  // Display message when no reminders are present
//         )}
//       </ul>
//     </div>
//   );
// };

// export default TaskReminders;



/////////////////////////////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const TaskReminders = () => {
  const [reminders, setReminders] = useState([]);

  // useEffect(() => {
  //   console.log("Setting up socket listeners");
    
  //   const userEmail = localStorage.getItem('userId');
  //   const userName = localStorage.getItem('name');

  //   // Register user immediately if already connected
  //   if (socket.connected && userEmail && userName) {
  //     socket.emit('register', userEmail, userName);
  //   }

  //   const handleReminder = (data) => {
  //     console.log('NEW REMINDER RECEIVED:', data);
  //     if (!data?.message) {
  //   console.log('No valid message in reminder data');
  //   return;
  // }
  //     if (data?.message) {
  //       setReminders(prev => {
  //         const newReminder = {
  //           id: Date.now(),
  //           message: data.message,
  //           timestamp: new Date().toLocaleTimeString()
  //         };
  //         console.log('ADDING REMINDER:', newReminder);
  //         return [...prev, newReminder];
  //       });
  //     }
  //   };

  //   socket.on('task-reminder', handleReminder);
  //   socket.on('task-reminder', (data) => {
  //          console.log('Received reminder:', data);
      
  //         // Add the reminder message to the state if it exists
  //     if (data && data.message) {
  //          setReminders((prevReminders) => [
  //             ...prevReminders,
  //              data.message,  // Add new reminder message
  //           ]);
  //         }
  //       });
  //   socket.on('connect', () => {
  //     if (userEmail && userName) {
  //       socket.emit('register', userEmail, userName);
  //     }
  //   });

  //   return () => {
  //     socket.off('task-reminder', handleReminder);
  //   };
  // }, []);
  useEffect(() => {
    console.log("Initializing socket listeners...");

    // Register user if already connected
    const userEmail = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');
    if (socket.connected && userEmail && userName) {
      socket.emit('register', userEmail, userName);
    }

    // Directly handle the string message
    const handleReminder = (message) => {
      console.log('RAW REMINDER MESSAGE:', message);
      setReminders(prev => [...prev, {
        id: Date.now(),
        message: message // Directly use the string
      }]);
    };

    socket.on('task-reminder', handleReminder);
    
    return () => {
      socket.off('task-reminder', handleReminder);
    };
  }, []);
  console.log('CURRENT REMINDERS:', reminders);

  return (
    <div style={{
      padding: '20px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '20px auto'
    }}>
      <h2 style={{ marginBottom: '15px', color: '#333' }}>Task Reminders</h2>
      
      {reminders.length > 0 ? (
        <div style={{ marginTop: '10px' }}>
          {reminders.map((reminder) => (
            <div key={reminder.id} style={{
              padding: '12px',
              marginBottom: '8px',
              background: '#f8f9fa',
              borderRadius: '6px',
              borderLeft: '4px solid #4a6bdf',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '10px', fontSize: '1.2em' }}>🔔</span>
              <div>
                <div style={{ fontWeight: '500' }}>{reminder.message}</div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  {reminder.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
          No reminders yet
        </div>
      )}
    </div>
  );
};

export default TaskReminders;