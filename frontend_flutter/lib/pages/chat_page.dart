import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/chat_service.dart';
import '../models/chat_message.dart';
import '../api/api_client.dart';
import '../pages/login_page.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final List<ChatMessage> _messages = [];
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  bool _isLoading = true;
  bool _isLoggedIn = false;
  bool _isFetchingMore = false;

  String _currentSenderType = "READER";
  int _page = 0;
  final int _size = 10;
  bool _hasMore = true;

  String? _token;

  @override
  void initState() {
    super.initState();
    _checkLoginAndFetch();

    // lắng nghe scroll: nếu gần cuối list thì load thêm
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 50 &&
          !_isFetchingMore &&
          _hasMore) {
        _fetchChatHistory(_token!, loadMore: true);
      }
    });
  }

  Future<void> _checkLoginAndFetch() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token");

    if (token == null || token.isEmpty) {
      if (mounted) {
        setState(() {
          _isLoggedIn = false;
          _isLoading = false;
        });
      }
      return;
    }

    _isLoggedIn = true;
    _token = token;
    await _fetchChatHistory(token, loadMore: false);

    // kết nối websocket
    ChatService.connect(
      token: token,
      onMessage: (data) {
        if (mounted) {
          setState(() {
            _messages.insert(0, ChatMessage.fromJson(data)); // thêm vào đầu list vì reverse = true
          });
          _scrollToBottom();
        }
      },
    );
  }

  Future<void> _fetchChatHistory(String token, {bool loadMore = false}) async {
    if (loadMore) {
      setState(() => _isFetchingMore = true);
      _page++;
    } else {
      setState(() {
        _isLoading = true;
        _page = 0;
        _messages.clear();
      });
    }

    try {
      final response = await AuthApiClient.get(
        "${Endpoints.conversationByUser}?page=$_page&size=$_size",
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final List<ChatMessage> fetchedMessages =
        data.map((json) => ChatMessage.fromJson(json)).toList();

        if (mounted) {
          setState(() {
            if (loadMore) {
              // reverse = true → thêm vào cuối list
              _messages.addAll(fetchedMessages);
            } else {
              _messages.addAll(fetchedMessages);
            }
            _isLoading = false;
            _isFetchingMore = false;
            if (fetchedMessages.length < _size) {
              _hasMore = false;
            }
          });

          if (!loadMore) {
            _scrollToBottom();
          }
        }
      } else {
        if (mounted) {
          _isLoading = false;
          _isFetchingMore = false;
        }
      }
    } catch (e) {
      if (mounted) {
        _isLoading = false;
        _isFetchingMore = false;
      }
    }
  }

  void _sendMessage() {
    if (_controller.text.trim().isEmpty) return;

    final msg = ChatMessage(
      senderType: _currentSenderType,
      content: _controller.text.trim(),
    );

    ChatService.sendMessage(msg.toJson());
    _controller.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0.0, // vì reverse = true → 0.0 là cuối list
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    ChatService.disconnect();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("💬 Trò chuyện")),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : !_isLoggedIn
          ? Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.lock_outline,
                size: 60, color: Colors.grey),
            const SizedBox(height: 16),
            const Text(
              "Vui lòng đăng nhập để sử dụng chức năng này",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const LoginPage()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueAccent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.symmetric(
                    horizontal: 24, vertical: 12),
              ),
              child: const Text("Đăng nhập"),
            ),
          ],
        ),
      )
          : Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? const Center(
                child: Text("Bắt đầu cuộc trò chuyện..."))
                : ListView.builder(
              reverse: true, // quan trọng
              controller: _scrollController,
              itemCount:
              _messages.length + (_isFetchingMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (_isFetchingMore &&
                    index == _messages.length) {
                  return const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Center(
                        child: CircularProgressIndicator()),
                  );
                }

                final msg = _messages[index];
                bool isLibrarian =
                    msg.senderType == "LIBRARIAN";

                Color bubbleColor = isLibrarian
                    ? Colors.blue[100]!
                    : Colors.green[100]!;

                String label =
                isLibrarian ? "Thủ thư" : "Bạn";

                return Align(
                  alignment: isLibrarian
                      ? Alignment.centerLeft
                      : Alignment.centerRight,
                  child: Column(
                    crossAxisAlignment: isLibrarian
                        ? CrossAxisAlignment.start
                        : CrossAxisAlignment.end,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(
                          left: 10,
                          top: 8,
                          bottom: 2,
                        ),
                        child: Text(
                          label,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(
                          vertical: 4,
                          horizontal: 10,
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 14,
                        ),
                        decoration: BoxDecoration(
                          color: bubbleColor,
                          borderRadius: BorderRadius.only(
                            topLeft:
                            const Radius.circular(12),
                            topRight:
                            const Radius.circular(12),
                            bottomLeft: isLibrarian
                                ? Radius.zero
                                : const Radius.circular(12),
                            bottomRight: isLibrarian
                                ? const Radius.circular(12)
                                : Radius.zero,
                          ),
                        ),
                        child: Text(msg.content),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: "Nhập tin nhắn...",
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
