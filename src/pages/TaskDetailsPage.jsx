// import React, { useEffect, useState } from 'react';
// import { useParams } from "react-router-dom";


// const TaskDetailsPage = ({ match }) => {
//      const { taskId } = useParams(); // Get the taskId from the URL
//   const [task, setTask] = useState(null);
//   const [message, setMessage] = useState(''); // To store the message entered by the user
//   const [isLoading, setIsLoading] = useState(false); // To manage loading state

//   // Fetch task details based on taskId from URL
//   useEffect(() => {
//     const fetchTask = async () => {
//       try {
//         const response = await fetch(`https://taskbe.sharda.co.in/api/tasks/${match.params.taskId}`);
//         const data = await response.json();
//         setTask(data);
//       } catch (error) {
//         console.error('Error fetching task details:', error);
//       }
//     };

//     fetchTask();
//   }, [match.params.taskId]);

//   // Handle message input change
//   const handleMessageChange = (event) => {
//     setMessage(event.target.value);
//   };

//   // Handle the "Send" button click
//   const sendWhatsAppMessage = async () => {
//     if (!message.trim()) {
//       alert('Please enter a message.');
//       return;
//     }

//     try {
//       setIsLoading(true); // Set loading state to true
//       const phoneNumber = task?.assignees[0]?.phoneNumber; // Assuming task has assignees with phone numbers
//       const apiUrl = 'https://your-whatsapp-api-url'; // Replace with your actual API URL

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           phoneNumber: phoneNumber,
//           message: message, // Send the custom message
//         }),
//       });

//       if (response.ok) {
//         alert('Message sent!');
//         setMessage(''); // Clear message after sending
//       } else {
//         throw new Error('Failed to send message');
//       }
//     } catch (error) {
//       // console.error('Error sending WhatsApp message:', error);
//       alert('Error sending message. Please try again.');
//     } finally {
//       setIsLoading(false); // Reset loading state
//     }
//   };

//   if (!task) return <div>Loading...</div>;

//   return (
//     <div className="task-details-page">
//       <h1 className="text-2xl font-bold mb-4">{task.taskName}</h1>
//       <p className="mb-6">{task.workDesc}</p>

//       <div className="message-form">
//         <h2 className="text-xl font-semibold mb-2">Send a Message</h2>
        
//         <textarea
//           value={message}
//           onChange={handleMessageChange}
//           rows="5"
//           placeholder="Write your message here..."
//           className="w-full p-3 border border-gray-300 rounded-lg mb-4"
//         ></textarea>

//         <div className="flex justify-end">
//           <button
//             onClick={sendWhatsAppMessage}
//             disabled={isLoading}
//             className={`px-6 py-2 text-white rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition`}
//           >
//             {isLoading ? 'Sending...' : 'Send'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TaskDetailsPage;
