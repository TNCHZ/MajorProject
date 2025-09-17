import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { authApis, endpoints } from "./Apis";

let stompClient = null;
let currentUserId = null;

/**
 * Kết nối WebSocket và lấy thông tin user
 */
export const connectWS = async ({ token, onMessage }) => {
  try {
    const response = await authApis().get(endpoints.profile);
    const data = await response.data ?? response.json(); // hỗ trợ cả axios & fetch
    currentUserId = data.id;
    console.log("🔑 Using user ID:", currentUserId);
  } catch (err) {
    console.error("❌ Error fetching user info:", err);
    currentUserId = `guest-${Date.now()}`;
  }

  const wsUrl = token
    ? `http://localhost:8080/ws?token=${encodeURIComponent(token)}`
    : "http://localhost:8080/ws";

  stompClient = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: (str) => console.log("STOMP: ", str),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log("✅ Connected to WS");
      stompClient.subscribe(`/user/${currentUserId}/queue/messages`, (msg) => {
        if (msg.body) onMessage(JSON.parse(msg.body));
      });
    },
    onStompError: (frame) => {
      console.error("❌ Broker error: " + frame.headers["message"]);
    },
  });

  stompClient.activate();
  return currentUserId;
};

/**
 * Đăng ký nhận tin nhắn theo conversation
 * Trả về hàm unsubscribe để cleanup khi đổi conversation hoặc unmount
 */
export const subscribeToChat = (receiverId, onMessage) => {
  if (stompClient && stompClient.connected) {
    const chatId = `user_${receiverId}`;
    const subscription = stompClient.subscribe(`/topic/chat/${chatId}`, (msg) => {
      if (msg.body) onMessage(JSON.parse(msg.body));
    });
    console.log(`📥 Subscribed to /topic/chat/${chatId}`);

    // 👉 trả về hàm cleanup
    return () => {
      subscription.unsubscribe();
      console.log(`🔕 Unsubscribed from /topic/chat/${chatId}`);
    };
  } else {
    console.warn("⚠️ Cannot subscribe, not connected to WS");
    return () => {}; // noop
  }
};

/**
 * Gửi tin nhắn qua WS
 */
export const sendMessageWS = (message) => {
  if (stompClient && stompClient.connected) {
    message.senderId = currentUserId;
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    });
    console.log("📤 Sent: ", message);
  } else {
    console.warn("⚠️ Not connected to WebSocket");
  }
};

/**
 * Ngắt kết nối WS
 */
export const disconnectWS = () => {
  if (stompClient) stompClient.deactivate();
  currentUserId = null;
  console.log("🔌 Disconnected");
};
