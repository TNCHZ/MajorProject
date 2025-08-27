import React, { useContext, useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { MyUserContext } from "../configs/Context";

const ChatBox = ({ reader, onClose }) => {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const chatHistoryRef = useRef();
  const currentUser = useContext(MyUserContext);

  useEffect(() => {
    if (!currentUser?.data || !reader) return;

    const userId = currentUser.data.id;
    const chatId = [userId, reader.id].sort().join("_");
    const token = currentUser.data.token; // Assuming token is in currentUser.data

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8080/ws?access_token=${token}`),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log("STOMP Debug:", str); // Log all STOMP debug messages
      },
      onConnect: () => {
        console.log("WebSocket connected for user:", userId);
        console.log("reader.id:", reader.id);
        console.log("chatId:", chatId);

        // Subscribe to user-specific queue
        stompClient.subscribe(`/user/${userId}/queue/messages`, (msg) => {
          const body = JSON.parse(msg.body);
          console.log("Received message:", body);
          if (body.chatId === chatId) {
            setMessages((prev) => [...prev, body]);
          }
        });

        // Subscribe to chat-specific topic
        stompClient.subscribe(`/topic/chat/${chatId}`, (msg) => {
          const body = JSON.parse(msg.body);
          console.log("Received topic message:", body);
          setMessages((prev) => [...prev, body]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onWebSocketClose: (event) => {
        console.log("WebSocket closed:", event);
        console.log("Reconnection will attempt in 5 seconds...");
      },
      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      console.log("Deactivating WebSocket client");
      stompClient.deactivate();
    };
  }, [currentUser, reader]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!client || !content.trim() || !currentUser?.data?.id) {
      console.error("Cannot send message: client or user ID missing");
      return;
    }
    const chatId = [currentUser.data.id, reader.id].sort().join("_");
    const message = {
      senderId: currentUser.data.id,
      receiverId: reader.id,
      chatId: chatId,
      content,
    };
    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    });
    console.log("Message sent:", message);
    setContent("");
  };

  if (!currentUser?.data || !reader) {
    return (
      <div className="flex flex-col h-[60vh] justify-center items-center text-gray-600">
        Vui lòng đăng nhập để sử dụng tính năng chat.
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Chat với {reader.name || reader.fullName}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          &times;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50" ref={chatHistoryRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded max-w-xs ${
              m.senderId === currentUser.data.id
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex p-4 border-t border-gray-200 bg-white">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;