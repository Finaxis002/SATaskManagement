import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../redux/userSlice";
import ChatSidebar from "../Components/Inbox/ChatSidebar";
import ChatMessages from "../Components/Inbox/ChatMessages";
import MessageInput from "../Components/Inbox/MessageInput";

// Assume socket.io client setup
const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
});

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupUnreadCounts, setGroupUnreadCounts] = useState({});
  const [showGroups, setShowGroups] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // For personal chat
  const [users, setUsers] = useState([]); // ✅ Must be an array
  const [userUnreadCounts, setUserUnreadCounts] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageInputRef = useRef(null); // Add a ref for the input field
  const [admins, setAdmins] = useState([]);
  const [regularUsers, setRegularUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessagesHeader, setNewMessagesHeader] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  //download pdf
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(null);

  // Replace single file state with arrays
  const [files, setFiles] = useState([]); // Array of File objects
  const [filePreviews, setFilePreviews] = useState([]); // Array of preview URLs
  const [uploadProgress, setUploadProgress] = useState([]); // Array of progress numbers




  //recentUserChat

  const currentUser = {
    name: localStorage.getItem("name") || "User",
    department: localStorage.getItem("department"),
    role: localStorage.getItem("role"),
    userId: localStorage.getItem("userId"), // add this if you use userId elsewhere
  };

  // Add this function to handle emoji selection
  const onEmojiClick = (emojiObject) => {
    const cursorPosition = messageInputRef.current.selectionStart;
    const textBeforeCursor = messageText.substring(0, cursorPosition);
    const textAfterCursor = messageText.substring(cursorPosition);

    setMessageText(textBeforeCursor + emojiObject.emoji + textAfterCursor);
    setShowEmojiPicker(false);

    // Focus back on input and set cursor position after emoji
    setTimeout(() => {
      messageInputRef.current.focus();
      messageInputRef.current.selectionEnd =
        cursorPosition + emojiObject.emoji.length;
    }, 0);
  };

  // Fetch groups when the component is mounted or updated
  useEffect(() => {
    const fetchUserDepartments = async () => {
      try {
        if (currentUser.role === "admin") {
          const res = await axios.get(
            "https://taskbe.sharda.co.in/api/departments"
          );
          setGroups(res.data.map((dept) => dept.name));
        } else {
          // Fetch all employees and find the current user
          const res = await axios.get(
            "https://taskbe.sharda.co.in/api/employees"
          );
          const currentEmployee = res.data.find(
            (emp) => emp.name === currentUser.name
          );
          if (currentEmployee && currentEmployee.department) {
            setGroups(currentEmployee.department);
            setSelectedGroup(currentEmployee.department[0]);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching departments:", err.message);
        // Fallback
        if (currentUser.department) {
          setGroups([currentUser.department]);
          setSelectedGroup(currentUser.department);
        }
      }
    };

    fetchUserDepartments();
  }, [currentUser.role, currentUser.name]);

  const scrollRef = useRef(null); // Your existing scrollRef

  // useEffect to auto-scroll whenever messages are updated
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        // Fetch regular employees from the Employee collection
        const employeesRes = await axios.get(
          "https://taskbe.sharda.co.in/api/employees"
        );

        // Fetch main admins from the MainAdmin collection
        const mainAdminsRes = await axios.get(
          "https://taskbe.sharda.co.in/api/mainadmins"
        );

        // console.log("Fetched employees:", employeesRes.data);
        // console.log("Fetched main admins:", mainAdminsRes.data);

        // Merge employees and main admins into one array
        const allUsers = [
          ...employeesRes.data, // Regular employees
          ...mainAdminsRes.data, // Main admin users
        ];

        // console.log("All users after merge:", allUsers); // Log merged data

        // Separate admins and regular users
        const adminUsers = allUsers.filter(
          (user) => user.role === "admin" || user.userId === "admin"
        ); // Check role for admins or match `userId`
        const nonAdminUsers = allUsers.filter(
          (user) => user.role !== "admin" && user.userId !== "admin"
        );

        setUsers(allUsers);
        setAdmins(adminUsers);
        setRegularUsers(nonAdminUsers);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err.message);
        setUsers([]);
        setAdmins([]);
        setRegularUsers([]);
      }
    };

    fetchAllUsers();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (selectedUser && selectedUser.name) {
          const res = await axios.get(
            `https://taskbe.sharda.co.in/api/messages/user/${selectedUser.name}`
          );

          const filteredMessages = res.data.messages.filter((msg) => {
            const trimmedSender = msg.sender
              ? msg.sender.trim().toLowerCase()
              : "";
            const trimmedRecipient = msg.recipient
              ? msg.recipient.trim().toLowerCase()
              : "";
            const trimmedLoggedInUser = currentUser.name.trim().toLowerCase();

            const isPersonalMessage =
              trimmedSender === trimmedLoggedInUser ||
              trimmedRecipient === trimmedLoggedInUser;

            return (
              isPersonalMessage && (msg.group === undefined || msg.group === "")
            );
          });

          const sortedMessages = [...filteredMessages].sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.timestamp}`);
            const timeB = new Date(`1970/01/01 ${b.timestamp}`);
            return timeA - timeB; // oldest to newest
          });
          setMessages(sortedMessages);
        } else if (selectedGroup) {
          const encodedGroup = encodeURIComponent(selectedGroup);
          const res = await axios.get(
            `https://taskbe.sharda.co.in/api/messages/${encodedGroup}`
          );
          setMessages(res.data.messages.reverse()); // No reverse here
        }
      } catch (err) {
        console.error("❌ Error fetching messages:", err.message);
      }
    };

    fetchMessages();
  }, [selectedUser, selectedGroup, currentUser.name]); // Ensure it triggers when the selected user or group changes

  // ========== [Add after fetchMessages useEffect in Inbox.jsx] ==========
  useEffect(() => {
    if ((selectedGroup || selectedUser) && messages.length) {
      markMessagesAsRead();
    }
    // eslint-disable-next-line
  }, [messages, selectedGroup, selectedUser]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Generate previews for each file
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);

    // Reset progress (set to 0 for each file)
    setUploadProgress(selectedFiles.map(() => 0));
  };

  const sendMessage = async () => {
    if (!messageText.trim() && files.length === 0) {
      return; // Nothing to send
    }

    let fileUrls = [];

    if (files.length > 0) {
      // For each file, upload separately and collect URL
      fileUrls = await Promise.all(
        files.map((file, idx) => {
          const formData = new FormData();
          formData.append("file", file);

          return axios
            .post("https://taskbe.sharda.co.in/api/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  setUploadProgress((prev) => {
                    const updated = [...prev];
                    updated[idx] = percent;
                    return updated;
                  });
                }
              },
            })
            .then((res) => res.data.fileUrl)
            .catch((uploadErr) => {
              setUploadProgress((prev) => {
                const updated = [...prev];
                updated[idx] = 0;
                return updated;
              });
              alert(`File upload failed: ${uploadErr.message}`);
              return null;
            });
        })
      );
      // Remove any nulls (failed uploads)
      fileUrls = fileUrls.filter(Boolean);
    }

    // or send separate messages for each file. Here, we'll send one message.
    const newMessage = {
      sender: currentUser.name === "Admin" ? "admin" : currentUser.name,
      text: messageText.trim(),
      fileUrls, // <-- array of all file URLs
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      readBy: [currentUser.name],
      ...(selectedUser && {
        recipient: selectedUser.userId || selectedUser.name,
      }),
      ...(selectedGroup && { group: selectedGroup }), // Group chat
    };

    // Optimistically update UI (for each file, if you want per-file message)
    if (selectedUser) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }

    try {
      if (selectedUser) {
        await axios.post(
          `https://taskbe.sharda.co.in/api/messages/user/${selectedUser.name}`,
          newMessage
        );
      } else if (selectedGroup) {
        await axios.post(
          `https://taskbe.sharda.co.in/api/messages/${encodeURIComponent(
            selectedGroup
          )}`,
          newMessage
        );
      }
    } catch (err) {
      console.error("❌ Failed to send message:", err.message);
    } finally {
      setMessageText("");
      setFiles([]);
      setFilePreviews([]);
      setUploadProgress([]);
      messageInputRef.current?.focus();
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setMessageText(value);
  };

  const markMessagesAsRead = async () => {
    let unreadMessageIds = [];

    // Find unread messages for the selected conversation
    if (selectedGroup) {
      unreadMessageIds = messages
        .filter(
          (msg) =>
            msg.group === selectedGroup &&
            !msg.readBy?.includes(currentUser.name)
        )
        .map((msg) => msg._id);
    } else if (selectedUser) {
      unreadMessageIds = messages
        .filter(
          (msg) =>
            ((msg.sender === selectedUser.name &&
              msg.recipient === currentUser.name) ||
              (msg.sender === currentUser.name &&
                msg.recipient === selectedUser.name)) &&
            !msg.readBy?.includes(currentUser.name) &&
            (!msg.group || msg.group === "")
        )
        .map((msg) => msg._id);
    }

    if (unreadMessageIds.length) {
      await axios.put("https://taskbe.sharda.co.in/api/mark-read", {
        messageIds: unreadMessageIds,
        userId: currentUser.name, // or userId if you have that uniquely
      });
    }
  };

  useEffect(() => {
    socket.on("markRead", (data) => {
      console.log("Message marked as read:", data.identifier);

      // If it's a group message
      if (selectedGroup && data.identifier === selectedGroup) {
        setGroupUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          updatedCounts[selectedGroup] = 0; // Reset unread count for the group
          return updatedCounts;
        });
      }

      // If it's a user message
      if (selectedUser && data.identifier === selectedUser.name) {
        setUserUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          updatedCounts[selectedUser.name] = 0; // Reset unread count for the user
          return updatedCounts;
        });
      }
    });

    return () => {
      socket.off("markRead");
    };
  }, [selectedGroup, selectedUser]);

  // When selecting a group
  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null); // Clear selected user when switching to a group

    // Mark messages as read for this group
    markMessagesAsRead(group);
  };

  const handleUserClick = async (user) => {
    // Handle if it's an admin (we use userId to identify)
    if (user.userId === "admin" || user.role === "admin") {
      setSelectedUser(user);
    } else {
      // For regular users, we check their `name`
      setSelectedUser(user);
    }
    setSelectedGroup(null);

    // Mark messages as read immediately when clicking the chat
    await markMessagesAsRead(user.userId || user.name);

    // Force update the unread counts
    setUserUnreadCounts((prev) => ({
      ...prev,
      [user.name || user.userId]: 0, // Immediately set to 0
    }));
  };

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      console.log("📨 Real-time message received:", msg);
      

      // For Group Messages
      if (msg.group) {
        if (selectedGroup === msg.group) {
          setMessages((prev) => [...prev, msg]); // Add the message to the state
          setNewMessagesHeader(false); // Remove "New Messages" header
        } else if (groups.includes(msg.group)) {
          setGroupUnreadCounts((prev) => ({
            ...prev,
            [msg.group]: (prev[msg.group] || 0) + 1,
          }));
          setNewMessagesHeader(true);
        }
      }

      // For Direct Messages
      else if (
        msg.recipient === currentUser.name &&
        msg.sender !== currentUser.name
      ) {
        if (selectedUser && selectedUser.name === msg.sender) {
          setMessages((prev) => [...prev, msg]); // Add the message to the state
          setNewMessagesHeader(false);
        }
        setUserUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
        setNewMessagesHeader(true);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedGroup, selectedUser, currentUser.name, groups]);

  useEffect(() => {
    const fetchGroupUnreadCounts = async () => {
      try {
        const name = localStorage.getItem("name");
        const res = await axios.get(
          "https://taskbe.sharda.co.in/api/group-unread-counts",
          { params: { name } }
        );
        setGroupUnreadCounts(res.data.groupUnreadCounts || {});
      } catch (err) {
        console.error("❌ Failed fetching group unread counts:", err.message);
      }
    };

    fetchGroupUnreadCounts();
    socket.on("inboxCountUpdated", fetchGroupUnreadCounts);
    return () => {
      socket.off("inboxCountUpdated", fetchGroupUnreadCounts);
    };
  }, []);

  useEffect(() => {
    const fetchUserUnreadCounts = async () => {
      try {
        const name = localStorage.getItem("name");
        const res = await axios.get(
          "https://taskbe.sharda.co.in/api/user-unread-counts",
          {
            params: {
              name,
              onlyDirectMessages: true, // Add this parameter
            },
          }
        );
        setUserUnreadCounts(res.data.userUnreadCounts || {});
      } catch (err) {
        console.error("❌ Failed to fetch user unread counts:", err.message);
      }
    };
    fetchUserUnreadCounts();
    socket.on("inboxCountUpdated", fetchUserUnreadCounts);

    return () => {
      socket.off("inboxCountUpdated", fetchUserUnreadCounts);
    };
  }, []);

  useEffect(() => {
    console.log("Selected Group:", selectedGroup);
    console.log("Selected User:", selectedUser);
  }, [selectedGroup, selectedUser]);

  const handleFileDownload = (fileUrl) => {
    const fullUrl = `https://taskbe.sharda.co.in${fileUrl}`; // Ensure this URL is correct
    const fileName = fileUrl.split("/").pop(); // Extract file name

    // Open the link in a new tab
    const newTab = window.open(fullUrl, "_blank");

    // Wait for the new tab to load, then trigger the download
    newTab.onload = () => {
      // Create an invisible download link in the new tab
      const link = newTab.document.createElement("a");
      link.href = fullUrl;
      link.download = fileName; // Force the browser to download the file
      newTab.document.body.appendChild(link); // Append the link to the new tab's body
      link.click(); // Trigger the download
      newTab.document.body.removeChild(link); // Clean up the link element in the new tab
    };
  };

  const downloadPdf = (fileUrl) => {
    setLoader(true);
    setError("");
    setDownloadProgress(0);

    const token = localStorage.getItem("tokenLocal");
    if (!token) return;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://taskbe.sharda.co.in${fileUrl}`, true);
    xhr.responseType = "arraybuffer";
    xhr.setRequestHeader("Accept", "application/pdf");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onprogress = function (event) {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded * 100) / event.total);
        setDownloadProgress(percent);
      }
    };

    xhr.onload = function () {
      setLoader(false);
      setDownloadProgress(null);

      if (xhr.status === 200) {
        let fileName = "example.pdf";
        if (fileUrl) {
          const parts = fileUrl.split("/");
          fileName = parts[parts.length - 1] || fileName;
        }
        const url = window.URL.createObjectURL(
          new Blob([xhr.response], { type: "application/pdf" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        setError("Failed to download PDF");
      }
    };

    xhr.onerror = function () {
      setLoader(false);
      setDownloadProgress(null);
      setError("Network error");
    };

    xhr.send();
  };

  const downloadImage = (fileUrl) => {
    setLoader(true);
    setError("");

    const token = localStorage.getItem("tokenLocal");
    if (token) {
      // Try to guess image MIME type from file extension
      let mimeType = "image/jpeg"; // default
      if (fileUrl.match(/\.png$/i)) mimeType = "image/png";
      else if (fileUrl.match(/\.gif$/i)) mimeType = "image/gif";
      else if (fileUrl.match(/\.webp$/i)) mimeType = "image/webp";
      else if (fileUrl.match(/\.svg$/i)) mimeType = "image/svg+xml";

      const axiosConfig = {
        responseType: "arraybuffer",
        headers: {
          Accept: mimeType,
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .get(`https://taskbe.sharda.co.in${fileUrl}`, axiosConfig)
        .then((response) => {
          setLoader(false);

          // Extract file name from URL (fallback: 'image')
          let fileName = "image";
          if (fileUrl) {
            const parts = fileUrl.split("/");
            fileName = parts[parts.length - 1] || fileName;
          }

          // Create Blob and download
          const url = window.URL.createObjectURL(
            new Blob([response.data], { type: mimeType })
          );
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
        })
        .catch((error) => {
          setLoader(false);
          setError(error.message);
        });
    }
  };

  
// Helper function to convert time string (e.g., "2:30 PM") to comparable value


// Filter out the current user (logged-in user) from the admins and regular users
const filteredAdmins = admins.filter(admin => admin.name !== currentUser.name);
const filteredRegularUsers = regularUsers.filter(user => user.name !== currentUser.name);


  return (
    <div className="w-full max-h-screen p-4 flex bg-gray-100">
      {/* Left column for groups */}
      <ChatSidebar
        showGroups={showGroups}
        groupUnreadCounts={groupUnreadCounts}
        currentUser={currentUser}
        userUnreadCounts={userUnreadCounts}
        groups={groups}
        selectedGroup={selectedGroup}
        handleGroupClick={handleGroupClick}
        setShowGroups={setShowGroups}
        searchTerm={searchTerm}
       admins={filteredAdmins}
        selectedUser={selectedUser}
        regularUsers={filteredRegularUsers}
        users={users}
        handleUserClick={handleUserClick}
        setSearchTerm={setSearchTerm}
        messages={messages}
       
      />

      {/* Right column for chat messages */}
      <div className="w-3/4 pl-4 flex flex-col">
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          selectedGroup={selectedGroup}
          scrollRef={scrollRef}
          currentUser={currentUser}
          downloadProgress={downloadProgress}
          downloadImage={downloadImage}
          downloadPdf={downloadPdf}
          handleFileDownload={handleFileDownload}
           groups={groups}
           users={users}
        />

        {/* Input field and Send button (Fixed at the bottom) */}
        <MessageInput
          dragActive={dragActive}
          showEmojiPicker={showEmojiPicker}
          handleFileChange={handleFileChange}
          files={files}
          messageInputRef={messageInputRef}
          messageText={messageText}
          handleChange={handleChange}
          handleKeyPress={handleKeyPress}
          sendMessage={sendMessage}
          uploadProgress={uploadProgress}
          setDragActive={setDragActive}
          setFiles={setFiles}
          setFilePreviews={setFilePreviews}
          setUploadProgress={setUploadProgress}
          setShowEmojiPicker={setShowEmojiPicker}
          onEmojiClick={onEmojiClick}
          filePreviews={filePreviews}
        />
      </div>
    </div>
  );
};

export default Inbox;
