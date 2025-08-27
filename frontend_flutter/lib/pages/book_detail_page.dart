import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:mobile_app/pages/ebook_reader_page.dart';

class BookDetailPage extends StatefulWidget {
  final dynamic book;
  const BookDetailPage({super.key, required this.book});

  @override
  State<BookDetailPage> createState() => _BookDetailPageState();
}

class _BookDetailPageState extends State<BookDetailPage> {
  int _page = 0;
  final int _size = 5;
  bool _isLoading = false;
  bool _hasMore = true;
  List<dynamic> _comments = [];
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchComments();

    // lắng nghe scroll để load thêm
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 100 &&
          !_isLoading &&
          _hasMore) {
        _fetchComments();
      }
    });
  }

  Future<void> _fetchComments() async {
    setState(() => _isLoading = true);
    try {
      final response = await AuthApiClient.get(
        "${Endpoints.interactsByBook}?page=$_page&size=$_size",
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final content = data['content'];
        setState(() {
          _comments.addAll(content);
          _hasMore = !data['last']; // backend Spring trả về last=true khi hết trang
          if (_hasMore) _page++;
        });
      }
    } catch (e) {
      debugPrint("Lỗi khi load comments: $e");
    }
    setState(() => _isLoading = false);
  }

  void _showCommentDialog(BuildContext context) {
    int rating = 0;
    TextEditingController commentController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Thêm bình luận'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Đánh giá:'),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return IconButton(
                        icon: Icon(
                          index < rating ? Icons.star : Icons.star_border,
                          color: Colors.yellow[700],
                        ),
                        onPressed: () {
                          setState(() {
                            rating = index + 1;
                          });
                        },
                      );
                    }),
                  ),
                  TextField(
                    controller: commentController,
                    decoration: const InputDecoration(
                      labelText: 'Bình luận',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Hủy'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (rating > 0 && widget.book['id'] != null) {
                      try {
                        final response = await AuthApiClient.post(
                          Endpoints.addInteract,
                          {
                            'react': rating.toString(),
                            'comment': commentController.text,
                            'bookId': widget.book['id'],
                          },
                        );
                        if (response.statusCode == 200) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Đã gửi bình luận!')),
                          );
                          Navigator.pop(context);

                          // Reset list và load lại từ đầu
                          setState(() {
                            _comments.clear();
                            _page = 0;
                            _hasMore = true;
                          });
                          _fetchComments();
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Lỗi khi gửi bình luận')),
                          );
                        }
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Lỗi kết nối')),
                        );
                      }
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Vui lòng chọn số sao và thử lại')),
                      );
                    }
                  },
                  child: const Text('Gửi'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  // Widget hiển thị phần thông tin sách
  Widget _buildBookInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: widget.book['image'] != null
              ? Image.network(
            widget.book['image'],
            width: 200,
            height: 300,
            fit: BoxFit.cover,
          )
              : Container(
            width: 200,
            height: 300,
            color: Colors.grey[300],
            child: const Center(child: Text("No image")),
          ),
        ),
        const SizedBox(height: 16),
        Text('Tên sách: ${widget.book['title'] ?? 'Không có tên'}',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text('Tác giả: ${widget.book['author'] ?? 'Không rõ'}',
            style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        Text('NXB: ${widget.book['publisher'] ?? 'Không rõ'}',
            style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        Text('Năm XB: ${widget.book['publishedDate'] ?? 'Không rõ'}',
            style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        Text('Giá: ${widget.book['price']?.toString() ?? '0'} VNĐ',
            style: const TextStyle(fontSize: 16, color: Colors.blue)),
        const SizedBox(height: 16),
        Text('Mô tả:', style: const TextStyle(fontSize: 18)),
        const SizedBox(height: 4),
        Text(widget.book['description'] ?? 'Không có mô tả',
            style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 24),
        Center(
          child: Column(
            children: [
              ElevatedButton(
                onPressed: () {
                  // TODO: gọi API đặt trước
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đặt trước thành công!')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  backgroundColor: Colors.green,
                ),
                child: const Text('Đặt trước'),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  if (widget.book['id'] != null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => EbookReaderPage(ebookId: widget.book['id']),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Sách này chưa có ebook 📭')),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  backgroundColor: Colors.blue,
                ),
                child: const Text('Xem Ebook'),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => _showCommentDialog(context),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  backgroundColor: Colors.orange,
                ),
                child: const Text('Thêm bình luận'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Widget hiển thị danh sách bình luận
  Widget _buildComments() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(),
        const Text("Bình luận:", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ListView.builder(
          controller: _scrollController,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _comments.length + 1,
          itemBuilder: (context, index) {
            if (index < _comments.length) {
              final c = _comments[index];
              return ListTile(
                leading: const Icon(Icons.comment, color: Colors.blue),
                title: Text(c['comment'] ?? ""),
                subtitle: Text("⭐ ${c['react'] ?? '0'}"),
              );
            } else {
              return _isLoading
                  ? const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Center(child: CircularProgressIndicator()))
                  : const SizedBox.shrink();
            }
          },
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.book['title'] ?? 'Chi tiết sách')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBookInfo(),
            const SizedBox(height: 24),
            _buildComments(),
          ],
        ),
      ),
    );
  }
}
