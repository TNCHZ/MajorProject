import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:stomp_dart_client/stomp_dart_client.dart';

class ChatService {
  static const String wsUrl = "http://10.0.2.2:8080/ws";
  static StompClient? _stompClient;
  static String? _currentUserId;

  static Future<void> connect({
    String? token,
    String? userId,
    required Function(Map<String, dynamic>) onMessage,
  }) async {
    // Nếu không có token, không kết nối
    if (token == null || token.isEmpty) {
      print("❌ No token provided, cannot connect");
      return;
    }

    // Lấy userId từ API /api/user
    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:8080/api/secure/profile'),
        headers: {"Authorization": "Bearer $token"},
      );
      if (response.statusCode == 200) {
        userId = jsonDecode(response.body)['id'].toString();
        print("🔑 Fetched user ID from API: $userId");
      } else {
        print("❌ Failed to fetch user ID: ${response.statusCode}");
        return; // Không tiếp tục nếu không lấy được userId
      }
    } catch (e) {
      print("❌ Error fetching user ID: $e");
      return; // Không tiếp tục nếu có lỗi
    }

    // Đảm bảo _currentUserId là String
    _currentUserId = userId;
    print("🔑 Current User ID: $_currentUserId");

    String connectUrl = wsUrl + '?token=${Uri.encodeQueryComponent(token)}';
    print("🔗 WS URL with token: $connectUrl");

    _stompClient = StompClient(
      config: StompConfig.sockJS(
        url: connectUrl,
        onConnect: (frame) {
          print("✅ Connected to WebSocket");

          // Subscribe queue cá nhân
          _stompClient?.subscribe(
            destination: "/user/$_currentUserId/queue/messages",
            callback: (frame) {
              if (frame.body != null) {
                onMessage(jsonDecode(frame.body!));
              }
            },
          );

          // Subscribe kênh chat của chính mình
          final chatId = "user_$_currentUserId";
          _stompClient?.subscribe(
            destination: "/topic/chat/$chatId",
            callback: (frame) {
              if (frame.body != null) {
                onMessage(jsonDecode(frame.body!));
              }
            },
          );
          print("📥 Subscribed to /topic/chat/$chatId");
        },
        onWebSocketError: (err) => print("❌ WS Error: $err"),
        onStompError: (frame) => print("❌ STOMP Error: ${frame.body}"),
        stompConnectHeaders: {"Authorization": "Bearer $token"},
      ),
    );
    _stompClient?.activate();
  }

  static void sendMessage(Map<String, dynamic> message) {
    if (_stompClient != null && _stompClient!.connected && _currentUserId != null) {
      message['senderId'] = _currentUserId;
      if (message['chatId'] == null) {
        message['chatId'] = "user_$_currentUserId";
      }
      _stompClient!.send(destination: "/app/chat.send", body: jsonEncode(message));
      print("📤 Sent: $message");
    } else {
      print("⚠️ Not connected to WS or missing currentUserId");
    }
  }

  static void disconnect() {
    _stompClient?.deactivate();
    _currentUserId = null;
    print("🔌 Disconnected");
  }

  static void subscribeToChat(String chatId, Function(Map<String, dynamic>) onMessage) {
    if (_stompClient != null && _stompClient!.connected) {
      _stompClient!.subscribe(
        destination: "/topic/chat/$chatId",
        callback: (frame) {
          if (frame.body != null) {
            onMessage(jsonDecode(frame.body!));
          }
        },
      );
      print("📥 Subscribed to /topic/chat/$chatId");
    } else {
      print("⚠️ Cannot subscribe, not connected to WS");
    }
  }
}