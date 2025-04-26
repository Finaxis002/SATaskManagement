
// import React, { useEffect, useState } from 'react';

// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// const TaskReminders = () => {
//   const [reminders, setReminders] = useState([]);

//   // useEffect(() => {
//   //   console.log("Setting up socket listeners");
    
//   //   const userEmail = localStorage.getItem('userId');
//   //   const userName = localStorage.getItem('name');

//   //   // Register user immediately if already connected
//   //   if (socket.connected && userEmail && userName) {
//   //     socket.emit('register', userEmail, userName);
//   //   }

//   //   const handleReminder = (data) => {
//   //     console.log('NEW REMINDER RECEIVED:', data);
//   //     if (!data?.message) {
//   //   console.log('No valid message in reminder data');
//   //   return;
//   // }
//   //     if (data?.message) {
//   //       setReminders(prev => {
//   //         const newReminder = {
//   //           id: Date.now(),
//   //           message: data.message,
//   //           timestamp: new Date().toLocaleTimeString()
//   //         };
//   //         console.log('ADDING REMINDER:', newReminder);
//   //         return [...prev, newReminder];
//   //       });
//   //     }
//   //   };

//   //   socket.on('task-reminder', handleReminder);
//   //   socket.on('task-reminder', (data) => {
//   //          console.log('Received reminder:', data);
      
//   //         // Add the reminder message to the state if it exists
//   //     if (data && data.message) {
//   //          setReminders((prevReminders) => [
//   //             ...prevReminders,
//   //              data.message,  // Add new reminder message
//   //           ]);
//   //         }
//   //       });
//   //   socket.on('connect', () => {
//   //     if (userEmail && userName) {
//   //       socket.emit('register', userEmail, userName);
//   //     }
//   //   });

//   //   return () => {
//   //     socket.off('task-reminder', handleReminder);
//   //   };
//   // }, []);
//   useEffect(() => {
//     console.log("Initializing socket listeners...");

//     // Register user if already connected
//     const userEmail = localStorage.getItem('userId');
//     const userName = localStorage.getItem('name');
//     if (socket.connected && userEmail && userName) {
//       socket.emit('register', userEmail, userName);
//     }

//     // Directly handle the string message
//     const handleReminder = (message) => {
//       console.log('RAW REMINDER MESSAGE:', message);
//       setReminders(prev => [...prev, {
//         id: Date.now(),
//         message: message // Directly use the string
//       }]);
//     };

//     socket.on('task-reminder', handleReminder);
    
//     return () => {
//       socket.off('task-reminder', handleReminder);
//     };
//   }, []);
//   console.log('CURRENT REMINDERS:', reminders);

//   return (
//     <div style={{
//       padding: '20px',
//       background: '#fff',
//       borderRadius: '8px',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//       maxWidth: '500px',
//       margin: '20px auto'
//     }}>
//       <h2 style={{ marginBottom: '15px', color: '#333' }}>Task Reminders</h2>
      
//       {reminders.length > 0 ? (
//         <div style={{ marginTop: '10px' }}>
//           {reminders.map((reminder) => (
//             <div key={reminder.id} style={{
//               padding: '12px',
//               marginBottom: '8px',
//               background: '#f8f9fa',
//               borderRadius: '6px',
//               borderLeft: '4px solid #4a6bdf',
//               display: 'flex',
//               alignItems: 'center'
//             }}>
//               <span style={{ marginRight: '10px', fontSize: '1.2em' }}>🔔</span>
//               <div>
//                 <div style={{ fontWeight: '500' }}>{reminder.message}</div>
//                 <div style={{ fontSize: '0.8em', color: '#666' }}>
//                   {reminder.timestamp}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
//           No reminders yet
//         </div>
//       )}
//     </div>
//   );
// };

// export default TaskReminders;

////////////////////////////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // ✅ backend url

const TaskReminders = () => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    console.log("Initializing socket listeners for TaskReminders...");

    const userEmail = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');

    if (socket.connected && userEmail && userName) {
      socket.emit('register', userEmail, userName);
    }

    const handleReminder = (data) => {
      console.log('RAW REMINDER RECEIVED:', data);

      if (typeof data === 'string' && data.trim() !== '') {
        setReminders(prev => [
          ...prev,
          {
            id: Date.now(),
            message: data,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } else {
        console.log('Invalid reminder format received.');
      }
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
