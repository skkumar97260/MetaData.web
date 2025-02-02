import React, { useState, useEffect, useRef } from "react";
import profile from "../../images/profile3.jpg";
import { FaPaperPlane } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { GoPlus } from "react-icons/go";
import { MdVideocam } from "react-icons/md";
import { PiChatTeardropText } from "react-icons/pi";
import { HiStatusOnline } from "react-icons/hi";
import { MdPeople } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { IoCall } from "react-icons/io5";
import Header from "../../components/header";
import { getUser } from "../../api/user";
import { getChat,userSendMessage } from "../../api/chat";
import { getToken, getUserId } from "../../utils/Storage";
import {formatDate,groupMessagesByDate} from "../../utils/DateFormat";
import axios from "axios";
import { GoogleGenerativeAI } from '@google/generative-ai';
import io from "socket.io-client";
const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUserId = getUserId();
  const messagesContainerRef = useRef(null);
  const messagesContainerRef2 = useRef(null);
 const [newsocket, setSocket] = useState(null);
 const [connectedUsers, setConnectedUsers] = useState([]);
 const [unreadedMessages, setUnreadMessages] = useState({});
 const [input, setInput] = useState("");
 const [chatmessages,setChatMessages]=useState([]);
 const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const toggleAccordion = () => setIsOpen(!isOpen);


  const selectUser = (user) => {
    setSelectedUser(user);
    getMessages(user?._id);
    setUnreadMessages((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      // Handle sending message logic
      const messageData = {
        userFrom: currentUserId,
        userTo: selectedUser?._id,
        message: newMessage,
        senderType: currentUserId,
        sentOn: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
       sentDate: formatDate(new Date()), // Add the date in your desired format
      };
      // setMessages([...messages, messageData]);
      // setNewMessage("");
      
      userSendMessage(messageData)
        .then((res) => {
          newsocket.emit('sendMessage', messageData);
          console.log("sk raja",messageData?.message);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const userList = async () => {
    try {
      const res = await getUser();
      const data = res?.data?.result.filter((item) => item._id !== currentUserId);
  
      // Fetch all chats and find the last message for each user
      const allChats = await getChat();
      const enrichedUsers = data.map((user) => {
        const userChats = allChats?.data?.result.filter(
          (chat) =>
            (chat.userFrom === currentUserId && chat.userTo === user._id) ||
            (chat.userFrom === user._id && chat.userTo === currentUserId)
        );
  
        // Get the last message if exists
        const lastMessage = userChats.length ? userChats[userChats.length - 1].message : '';
        const lastTime = userChats.length ? userChats[userChats.length - 1].sentOn : '';
        const lastDate = userChats.length ? userChats[userChats.length - 1].sentDate : '';
        return {
          ...user,
          lastMessage,
          lastTime,
          lastDate,
        };
      });
  
      setUsers(enrichedUsers); // Set the enriched user list with last messages
    } catch (error) {
      console.log(error);
    }
  };
  
  const getMessages = async (selectedUserId) => {
    try {
      const res = await getChat();
      const data = res?.data?.result.filter(
        (item) =>
          (item?.userFrom === currentUserId && item?.userTo === selectedUserId) ||
          (item?.userFrom === selectedUserId && item?.userTo === currentUserId)
      );
      setMessages(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    userList();
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
   
  }, [messages]);
  useEffect(() => {
    const socket = io("http://a0490b0f25a3045ccbd7cf3712b7c0e9-325173303.us-east-1.elb.amazonaws.com/"); // Adjust the URL
    setSocket(socket);
  
    socket.emit('new-users-add', currentUserId);
    
    // Update the connected users list when a new user connects
    socket.on('get-users', (users) => {
      setConnectedUsers(users);
    });
  
    // Listen for incoming messages and update the chat messages state
    socket.on('newMessage', (newMessageData) => {
      // Check if the message belongs to the current conversation
      if (
        (newMessageData.userFrom === currentUserId && newMessageData.userTo === selectedUser?._id) ||
        (newMessageData.userFrom === selectedUser?._id && newMessageData.userTo === currentUserId)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessageData]);
      }
      else {
        setUnreadMessages((prevUnread) => ({
          ...prevUnread,
          [newMessageData.userFrom]: (prevUnread[newMessageData.userFrom] || 0) + 1,
        }));
      }
    });
  
    return () => {
      socket.disconnect(); // Clean up the socket connection when the component unmounts
    };
  }, [selectedUser?._id, currentUserId]);
  const isUserOnline = (userId) => {
    return connectedUsers.some((user) => user.userId === userId && user.online);
  };


  const chatGptSendMessage = async () => {
  

    if (!input.trim()) return;
    
    try {
      const userMessage = {
        text: input,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setChatMessages((prevMessages) => [...prevMessages, userMessage]);

      // Make the request to Google Generative AI
      const result = await model.generateContent(input);

      // Get the response text from the AI
      const botMessage = {
        text: result.response.text(),
        sender: 'system',
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
      
      // Update the chat with the bot's response
      setChatMessages((prevMessages) => [...prevMessages, botMessage]);
      setInput('');  // Clear input field after sending
    } catch (error) {
      console.error('Error in generating AI response:', error.message);
    }
  };

  // Automatically call GPT when the component mounts (optional logic)
  useEffect(() => {
    console.log('chatMessages', chatmessages);
    if (messagesContainerRef2.current) {
      messagesContainerRef2.current.scrollTop = messagesContainerRef2.current.scrollHeight;
    }
  }, [chatmessages]); 

    // Utility function to detect code block (if the message contains code)
    const isCodeBlock = (message) => {
      return message.text.startsWith('```') && message.text.endsWith('```');
    };
  
    // Utility function to format code blocks properly
    const formatCodeBlock = (codeText) => {
      return codeText.replace(/```(python|js|html)?/g, "").trim();
    };
    
  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row mx-4 sm:mx-8 gap-4 border border-gray-300 mt-2 p-3 sm:p-5">
        {/* Left Sidebar */}
        <div
          className={`flex-shrink-0 bg-blue-500 w-full lg:w-1/4 border border-gray-300 p-3 ${
            selectedUser ? "hidden md:hidden lg:block xl:block" : "block"
          }`}
        >
          <input placeholder="🔍 Search for ..." className="w-full border border-gray-300 p-3 rounded-full" />
          <div className="h-[65vh] overflow-y-scroll scrollbar-thin bg-white p-5 mt-1 rounded-tl-3xl rounded-br-3xl">
            {users?.map((data, index) => (
              <div
                key={index}
                className={`hover:bg-gradient-to-r from-indigo-300 via-purple-500 to-pink-500 shadow-2xl flex justify-between border border-gray-300 bg-white p-3 mb-3 ${
                  selectedUser?._id === data?._id
                    ? "shadow-xl border-r-pink-600 border-r-4 rounded-r-lg border-l-pink-600 border-l-4 rounded-l-lg"
                    : "block"
                }`}
                onClick={() => selectUser(data)}
              >
                <div className="flex items-center gap-3">
                  <img src={profile} alt="profile" height={40} width={40} className="profile rounded-full border border-gray-300" />
                  <div className="flex flex-col">
                    <p className="text-lg font-bold text-pink-600">{data?.username}</p>
                    <p className="text-xs"> {data.lastMessage ? (data.lastMessage.length > 10  ? `${data.lastMessage.slice(0, 10)}...` : data.lastMessage): "No messages yet"}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-0">
                  <div className="text-sm font-weight-200 text-pink-600">{formatDate(data?.lastDate)}</div>
                  <div className="flex justify-end">
                  {unreadedMessages[data._id] > 0 && selectedUser?._id !== data._id && (
                      <div className="bg-green-600 text-xs text-white rounded-full w-4 h-4 flex justify-center items-center">
                        {unreadedMessages[data._id]}
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className={`flex-grow w-full lg:w-3/4 border p-2 mt-5 lg:mt-0 border-gray-300 ${selectedUser ? "block" : "hidden lg:block"}`}>
        {selectedUser ? (
    <>
      {/* Chat Header */}
      <div className="flex justify-between items-center bg-white shadow-2xl border border-gray-300">
        <div className="flex items-center gap-3 p-2">
          <img
            src={profile}
            alt="profile"
            height={40}
            width={40}
            className="profile rounded-full border border-gray-300"
          />
          <div className="flex flex-col">
            <p className="text-lg font-bold text-pink-600">{selectedUser?.username}</p>
            <p className={`text-xs ${isUserOnline(selectedUser._id) ? 'text-green-600' : 'text-red-600'}`}>
              {isUserOnline(selectedUser._id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <MdVideocam className="text-2xl" />
          <BsThreeDots className="text-2xl" />
        </div>
      </div>

      {/* Message Thread */}
      <div className="shadow-2xl flex flex-col gap-5 bg-gradient-to-r from-white to-blue-500 border border-gray-300 h-[50vh] sm:h-[55vh] bg-white mt-2 overflow-hidden overflow-y-scroll p-5" ref={messagesContainerRef}>
        {/* Grouped Messages */}
        {Object.entries(groupMessagesByDate(messages)).map(([date, messagesOnDate], idx) => (
          <div key={idx}>
            {/* Display Date Group Header */}
            <div className="flex justify-center items-center my-3">
              <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-4 py-1 rounded-full">
              {date} - {messagesOnDate.length} {messagesOnDate.length > 1 ? 'messages' : 'message'}
              </span>
            </div>

            {/* Display Individual Messages */}
            {messagesOnDate.map((data, index) => (
              <div key={index}>
                {data?.senderType === selectedUser?._id ? (
                  <div className="flex items-start justify-start gap-2 mt-2">
                    <div className="flex flex-col h-full justify-between">
                      <img
                        src={profile}
                        alt="profile"
                        height={40}
                        width={40}
                        className="profile rounded-full border border-gray-300"
                      />
                      <div className="text-5xl font-bold text-pink-600 rounded flex items-end">...</div>
                    </div>
                    <div className="shadow-3xl bg-pink-600 p-3 rounded-tr-3xl rounded-br-3xl rounded-tl-3xl">
                      <p className="text-xs text-white">{data?.message}</p>
                      <p className="text-xs font-bold text-blue-500 flex justify-start mt-1">{data?.sentOn}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-end gap-2 p-1">
                    <div className="flex flex-col bg-white p-3 rounded-tr-3xl rounded-bl-3xl rounded-tl-3xl shadow-2xl">
                      <p className="text-xs text-black">{data?.message}</p>
                      <p className="text-xs font-bold text-blue-500 flex justify-start mt-1">{data?.sentOn}</p>
                    </div>
                    <div className="flex flex-col h-full justify-between">
                      <img
                        src={profile}
                        alt="profile"
                        height={40}
                        width={40}
                        className="profile rounded-full border border-gray-300"
                      />
                      <div className="text-5xl font-bold text-white rounded flex items-end">...</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div
        className="shadow-2xl flex justify-between items-center border border-gray-300 bg-white p-1 mt-2 gap-3"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            const messageText = e.target.value.trim();
            if (messageText !== "") {
              handleSendMessage(messageText);
              e.target.value = "";
            }
          }
        }}
      >
        <GoPlus className="text-2xl m-3 rounded-full p-1 border border-gray-300" />
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here ..."
          className="w-full p-3"
        />
        <button className="bg-pink-600 text-white p-2" onClick={handleSendMessage}>
          <FaPaperPlane className="text-white" />
        </button>
      </div>
    </>
  ) : (
          

        <>
       <div>
      {/* Header */}
      <div className="flex justify-between items-center bg-white shadow-2xl border border-gray-300">
        <div className="flex items-center gap-3 p-2">
          <img
            src={profile}
            alt="profile"
            height={40}
            width={40}
            className="profile rounded-full border border-gray-300" />
          <div className="flex flex-col">
            <p className="text-lg font-bold text-pink-600">MetaData AI</p>
            <p className="text-xs text-green-600">you can chat with your MetaData</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2">
          <MdVideocam className="text-2xl" />
          <BsThreeDots className="text-2xl" />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="shadow-2xl flex flex-col gap-5 bg-gradient-to-r from-white to-blue-500 border border-gray-300 h-[50vh] sm:h-[55vh] bg-white mt-2 overflow-hidden overflow-y-scroll p-5" ref={messagesContainerRef2}>
      {chatmessages.map((message, index) => (
        <div
          key={index}
          className={`flex items-start justify-${message.sender === 'user' ? 'end' : 'start'} gap-2 mt-2`}
        >
          {message.sender === 'system' && (
            <div className="flex flex-col h-full justify-between">
              <img
                src={profile}
                alt="profile"
                height={40}
                width={40}
                className="profile rounded-full border border-gray-300"
              />
            </div>
          )}
          <div className={`shadow-3xl ${message.sender === 'user' ? 'bg-pink-600' : 'bg-white'} p-3 rounded-tr-3xl rounded-br-3xl rounded-tl-3xl`}>
            {/* Display formatted text or code block */}
            {isCodeBlock(message) ? (
              <pre className={`bg-gray-800 text-white p-3 rounded-lg overflow-x-scroll`}>
                <code>{formatCodeBlock(message.text)}</code>
              </pre>
            ) : (
              <p className={`text-xs ${message.sender === 'user' ? 'text-white' : 'text-black'}`}>
                {message.text}
              </p>
            )}
            <p className="text-xs font-bold text-blue-500 flex justify-start mt-1">
              {message.timestamp}
            </p>
          </div>
          {message.sender === 'user' && (
            <div className="flex flex-col h-full justify-between">
              <img
                src={profile}
                alt="profile"
                height={40}
                width={40}
                className="profile rounded-full border border-gray-300"
              />
            </div>
          )}
        </div>
      ))}
    </div>

      {/* Input Field */}
      <div className="shadow-2xl flex justify-between items-center border border-gray-300 bg-white p-1 mt-2 gap-3"
       onKeyPress={(e) => {
        if (e.key === "Enter") {
          const messageText = e.target.value.trim();
          if (messageText !== "") {
            chatGptSendMessage(messageText);
            e.target.value = "";
          }
        }
      }}
      >
        <GoPlus className="text-2xl m-3 rounded-full p-1 border border-gray-300" />
        <input
          placeholder="Type your message here ..."
          className="w-full p-3"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-pink-600 text-white p-2" onClick={chatGptSendMessage}>
          <FaPaperPlane className="text-white" />
        </button>
      </div>
    </div>
    
      
        </>
          )}
        </div>

       
 <div className={`hidden lg:block  flex-shrink-0 bg-blue-500 w-full lg:w-1/4 md:w-full border border-gray-300 p-2 ${selectedUser ? "block" : "hidden md:hidden lg:block xl:block"}`}>
        <div className="flex flex-col items-center bg-white p-1 shadow-2xl rounded-2xl">
         <div className="flex  gap-2  border-gray-100 "> <img
            src={profile}
            alt="profile"
            height={40}
            width={40}
            className="profile rounded-full border border-gray-300" />
          <div className="mt-3">{selectedUser?.username?selectedUser?.username:""}</div>
          </div>
          <div>6383669620</div>
          <div>skkumar@gmail.com</div>
        </div>
        <div className="h-[60vh] bg-white p-5 mt-1 rounded-tl-3xl rounded-br-3xl overflow-y-scroll ">
          <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
            <img
              src={profile}
              alt="profile"
              height={40}
              width={40}
              className="profile rounded-full border border-gray-300" />
            <div className="flex flex-col ">
              <p className="text-lg font-bold text-pink-600">Update profile</p>
              <p className="text-xs">Click here to update your profile</p>
              
            </div>
          </div>
          
          <div className="mt-3" id="accordion-nested-parent" data-accordion="collapse">
      <h2 id="accordion-collapse-heading-2">
        <button
          type="button"
          className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border   dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
          data-accordion-target="#accordion-collapse-body-2"
          aria-expanded={isOpen}
          aria-controls="accordion-collapse-body-2"
          onClick={toggleAccordion}
        >
          <span>Is there a Figma file available?</span>
          <svg
            data-accordion-icon
            className={`w-3 h-3 transform ${
              isOpen ? "rotate-180" : ""
            } transition-transform duration-300`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5L5 1 1 5"
            />
          </svg>
        </button>
      </h2>
      <div
        id="accordion-collapse-body-2"
        className={`${isOpen ? "" : "hidden"}`}
        aria-labelledby="accordion-collapse-heading-2"
      >
        <div className="p-5 border border-gray-200 dark:border-gray-700">
          <p className="mb-2 text-gray-500 dark:text-gray-400">
            Flowbite is first conceptualized and designed using the Figma
            software so everything you see in the library has a design
            equivalent in our Figma file.
          </p>
          
        </div>
      </div>
    </div>

   
        </div>
      </div>
      <div className="grid grid-cols-6 position-fixed bottom-0 bg-pink-600  md:grid grid-cols-6 lg:flex flex-col">
        <div>
          <PiChatTeardropText className="text-3xl m-3 font-weight-800 rounded-full p-1 border border-white text-white" />
        </div>
        <div>
          <HiStatusOnline className="text-3xl m-3 rounded-full p-1 border border-white text-white" />
        </div>
        <div>
          <MdPeople className="text-3xl m-3 rounded-full p-1 border border-white text-white" />
        </div>
        <div>
          <IoMdSettings className="text-3xl m-3 rounded-full p-1 border border-white text-white" />
        </div>
        <div>
          <IoCall className="text-3xl m-3 rounded-full p-1 border border-white text-white" />
        </div>
        <div className="h-full flex items-end  justify-center">
          <img
            src={profile}
            alt="profile"
            height={40}
            width={40}
            className="profile rounded-full border border-gray-300" />
        </div>
      </div>
      </div>
    </>
  );
};

export default Chat;
