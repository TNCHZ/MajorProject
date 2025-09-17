import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:mobile_app/pages/ebook_reader_page.dart';
import 'package:mobile_app/pages/login_page.dart' hide Endpoints;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:mobile_app/providers/cart_provider.dart';
import 'package:mobile_app/models/cart_item.dart';

class BookDetailPage extends StatefulWidget {
  final int bookId; // chỉ nhận id
  const BookDetailPage({super.key, required this.bookId});

  @override
  State<BookDetailPage> createState() => _BookDetailPageState();
}

class _BookDetailPageState extends State<BookDetailPage> {
  Map<String, dynamic>? _book; // dữ liệu chi tiết
  bool _loadingBook = true;

  int _page = 0;
  final int _size = 5;
  bool _isLoading = false;
  bool _hasMore = true;
  final List<dynamic> _comments = [];
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchBook();
    _fetchComments();

    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 100 &&
          !_isLoading &&
          _hasMore) {
        _fetchComments();
      }
    });
  }

  Future<void> _fetchBook() async {
    try {
      final response = await ApiClient.get(Endpoints.getBook(widget.bookId));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _book = data;
          _loadingBook = false;
        });
      } else {
        setState(() => _loadingBook = false);
      }
    } catch (e) {
      debugPrint("Error loading book: $e");
      setState(() => _loadingBook = false);
    }
  }

  Future<void> _fetchComments() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);
    try {
      final response = await ApiClient.get(
        "${Endpoints.interactsByBook(widget.bookId)}?page=$_page&size=$_size",
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final content = data['content'] as List<dynamic>;
        setState(() {
          _comments.addAll(content);
          _hasMore = !data['last'];
          if (_hasMore) _page++;
        });
      }
    } catch (e) {
      debugPrint("Error loading comments: $e");
    }
    setState(() => _isLoading = false);
  }

  Future<bool> _requireLogin(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token");
    if (token == null || token.isEmpty) {
      bool? login = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Yêu cầu đăng nhập',
              style: TextStyle(fontWeight: FontWeight.bold)),
          content: const Text('Vui lòng đăng nhập để thực hiện hành động này.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueAccent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              child: const Text('Đăng nhập'),
            ),
          ],
        ),
      );
      return login ?? false;
    }
    return true;
  }

  void _showCommentDialog(BuildContext context) async {
    if (!await _requireLogin(context)) return;

    int rating = 0;
    final commentController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(builder: (context, setState) {
          return AlertDialog(
            shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Text('Viết đánh giá',
                style: TextStyle(fontWeight: FontWeight.bold)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Đánh giá:', style: TextStyle(fontSize: 16)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return IconButton(
                      icon: Icon(
                        index < rating ? Icons.star_rounded : Icons.star_border,
                        color: Colors.amber,
                        size: 32,
                      ),
                      onPressed: () => setState(() => rating = index + 1),
                    );
                  }),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: commentController,
                  decoration: InputDecoration(
                    hintText: "Nhập cảm nhận của bạn...",
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Hủy"),
              ),
              ElevatedButton(
                onPressed: () async {
                  if (rating > 0) {
                    try {
                      final response = await AuthApiClient.post(
                        Endpoints.addInteract,
                        {
                          'react': rating.toString(),
                          'comment': commentController.text,
                          'bookId': widget.bookId,
                        },
                      );
                      if (response.statusCode == 200) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Đã gửi đánh giá thành công 🎉')),
                        );
                        Navigator.pop(context);
                        setState(() {
                          _comments.clear();
                          _page = 0;
                          _hasMore = true;
                        });
                        _fetchComments();
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Có lỗi khi gửi đánh giá ❌')),
                        );
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Mất kết nối mạng 🌐')),
                      );
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                child: const Text("Gửi"),
              ),
            ],
          );
        });
      },
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Widget _buildBookInfo() {
    if (_loadingBook) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_book == null) {
      return const Center(child: Text("Không tìm thấy dữ liệu sách ❌"));
    }

    // Calculate available copies
    final totalCopy = _book!['totalCopy'] ?? 0;
    final borrowCount = _book!['borrowCount'] ?? 0;
    final availableCopies = totalCopy - borrowCount;

    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Hero(
              tag: widget.bookId.toString(),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _book!['image'] != null
                    ? Image.network(
                  _book!['image'],
                  width: 220,
                  height: 320,
                  fit: BoxFit.cover,
                )
                    : _buildPlaceholderImage(),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              _book!['title'] ?? "Không có tiêu đề",
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87),
            ),
            const SizedBox(height: 8),
            Text("✍️ Tác giả: ${_book!['author'] ?? "Ẩn danh"}"),
            Text("🏢 NXB: ${_book!['publisher'] ?? "Không rõ"}"),
            Text("📅 Năm XB: ${_book!['publishedDate'] ?? "?"}"),
            const SizedBox(height: 12),
            // Updated section with new fields
            Text("📍 Vị trí kệ: ${_book!['shelfLocation'] ?? "N/A"}"),
            Text("📦 Tổng số bản: $totalCopy"),
            Text("📚 Sẵn có: $availableCopies"),
            const SizedBox(height: 24),
            Text(
              _book!['description'] ?? "Chưa có mô tả",
              style: TextStyle(color: Colors.grey[700], fontSize: 15),
              textAlign: TextAlign.justify,
            ),
            const SizedBox(height: 24),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      width: 220,
      height: 320,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: Icon(Icons.image_not_supported, size: 64, color: Colors.grey),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        _actionButton(
          icon: Icons.bookmark_add,
          text: "Đặt sách",
          color: Colors.green,
          onPressed: () async {
            if (_book == null) return;
            if (await _requireLogin(context)) {
              final cartProvider =
              Provider.of<CartProvider>(context, listen: false);
              final exists = cartProvider.items
                  .any((item) => item.bookId == _book!['id']);
              if (exists) {
                _showSnackBar("📚 Sách đã có trong giỏ hàng");
              } else {
                cartProvider.addToCart(
                  CartItem(
                    bookId: _book!['id'],
                    title: _book!['title'] ?? "Không rõ",
                    image: _book!['image'] ?? "",
                    quantity: 1,
                  ),
                );
                _showSnackBar("✅ Đã thêm sách vào giỏ");
              }
            }
          },
        ),
        const SizedBox(height: 12),
        _actionButton(
          icon: Icons.menu_book,
          text: "Đọc E-book",
          color: Colors.blueAccent,
          onPressed: () async {
            if (await _requireLogin(context) && _book != null) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => EbookReaderPage(ebookId: _book!['id']),
                ),
              );
            }
          },
        ),
        const SizedBox(height: 12),
        _actionButton(
          icon: Icons.reviews,
          text: "Viết đánh giá",
          color: Colors.orange,
          onPressed: () => _showCommentDialog(context),
        ),
      ],
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String text,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon, size: 24),
        label: Text(text, style: const TextStyle(fontSize: 16)),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          elevation: 4,
        ),
      ),
    );
  }

  Widget _buildComments() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 40, thickness: 1),
        Text(
          "💬 Đánh giá & Bình luận",
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold, color: Colors.blueAccent),
        ),
        const SizedBox(height: 16),
        if (_comments.isEmpty && !_isLoading)
          const Center(
            child: Text(
              "Chưa có đánh giá nào cho sách này. Hãy là người đầu tiên!",
              style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
              textAlign: TextAlign.center,
            ),
          ),
        ListView.builder(
          controller: _scrollController,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _comments.length + (_hasMore ? 1 : 0),
          itemBuilder: (context, index) {
            if (index < _comments.length) {
              final c = _comments[index];
              final int rating = int.tryParse(c['react'].toString()) ?? 0;

              return Card(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
                margin: const EdgeInsets.symmetric(vertical: 8),
                elevation: 2,
                child: ListTile(
                  contentPadding: const EdgeInsets.all(12),
                  leading: CircleAvatar(
                    radius: 28,
                    backgroundImage:
                    c['avatar'] != null ? NetworkImage(c['avatar']) : null,
                    backgroundColor: Colors.blueGrey[100],
                    child: c['avatar'] == null
                        ? const Icon(Icons.person, color: Colors.blueGrey)
                        : null,
                  ),
                  title: Text(
                    c['name'] ?? "Người dùng",
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: List.generate(5, (i) {
                          return Icon(
                            i < rating
                                ? Icons.star_rounded
                                : Icons.star_border_rounded,
                            color: Colors.amber,
                            size: 20,
                          );
                        }),
                      ),
                      const SizedBox(height: 6),
                      Text(c['comment'] ?? "",
                          style:
                          TextStyle(color: Colors.grey[800], fontSize: 14)),
                    ],
                  ),
                ),
              );
            } else {
              return _isLoading
                  ? const Padding(
                padding: EdgeInsets.all(20),
                child: Center(
                    child: CircularProgressIndicator(
                        color: Colors.blueAccent)),
              )
                  : const SizedBox.shrink();
            }
          },
        ),
      ],
    );
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue[50],
      appBar: AppBar(
        title: Text(
          _book?['title'] ?? 'Chi tiết sách',
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.blueAccent,
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart),
            onPressed: () {
              Navigator.pushNamed(context, "/cart");
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildBookInfo(),
            const SizedBox(height: 20),
            _buildComments(),
          ],
        ),
      ),
    );
  }
}
