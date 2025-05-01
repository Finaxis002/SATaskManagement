
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/TaskReminderToastsStyle.css';
// import reminderSound from '../assets/reminderSound.mp3';
import reminderSound from '../assets/reminderSound.mp3'
import moment from 'moment-timezone';

const TaskReminderToasts = () => {
  const [notifications, setNotifications] = useState([]);
  // const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const audioRef = useRef(null);
  const socketRef = useRef(null);  // 🆕 Correct way to store socket

  // 🛠 Create handleReminder OUTSIDE
  const handleReminder = (message) => {
    console.log('RAW REMINDER MESSAGE:', message);
    const reminderTime = moment(message.timestamp).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    console.log("reminder Time", reminderTime);
    const currentISTTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    console.log( "current IST Time ", currentISTTime);
    const newToast = {
      id: Date.now(),
      message,
      type: message.includes('TODAY') ? 'urgent' : 'regular',
    };

    setNotifications(prev => [...prev, newToast]);

    // if (audioRef.current && isAudioUnlocked) {
    //   audioRef.current.currentTime = 0;
    //   audioRef.current.play()
    //     .then(() => console.log('Audio played ✅'))
    //     .catch((e) => console.log('Audio play failed:', e));
    // } else {
    //   console.log('Audio not unlocked yet 🚫');
    // }

    // Remove toast after 5 seconds
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => console.log('Audio played ✅'))
        .catch((e) => console.log('Audio play failed:', e));
    } else {
      console.log('Audio not unlocked yet 🚫');
    }

    setTimeout(() => {
      setNotifications(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  // 🛠 Setup socket and unlock audio
  useEffect(() => {
    console.log('Initializing socket and audio...');

    // Correct socket connection inside component
    socketRef.current = io('https://sataskmanagementbackend.onrender.com', { transports: ['websocket'] });

    const audio = new Audio(reminderSound);
    audio.volume = 0.3;
    audioRef.current = audio;

    const unlockAudio = () => {
      // setIsAudioUnlocked(true);
      // console.log('Audio unlocked ✅');
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          console.log("Audio unlocked silently 🎧");
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 0.3;
          
        }).catch(err => {
          console.warn("Silent audio unlock failed 🚫", err);
        });
      }
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
