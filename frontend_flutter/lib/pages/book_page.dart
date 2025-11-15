import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import '../api/api_client.dart';
import 'book_detail_page.dart';
import 'cart_page.dart';

class BookPage extends StatefulWidget {
  const BookPage({super.key});

  @override
  State<BookPage> createState() => _BookPageState();
}

class _BookPageState extends State<BookPage> {
  List<dynamic> books = [];
  List<dynamic> filteredBooks = [];
  bool isLoading = false;
  bool isLoadingMore = false;
  bool isSearching = false;
  int currentPage = 0;
  final int pageSize = 5;
  bool hasMore = true; // Kiểm tra còn trang để tải không
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    fetchBooks(page: 0, isRefresh: true);
    _searchController.addListener(_onSearchChanged);

    // Lắng nghe sự kiện cuộn
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent * 0.9) {
        if (!isLoadingMore && hasMore && !isSearching) {
          fetchBooks(page: currentPage + 1);
        }
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> fetchBooks({required int page, bool isRefresh = false}) async {
    if (isSearching) return;

    if (page == 0) {
      setState(() {
        isLoading = true;
        hasMore = true;
      });
    } else if (!hasMore || isLoadingMore) {
      return;
    } else {
      setState(() {
        isLoadingMore = true;
      });
    }

    try {
      final response = await AuthApiClient.get(
        "${Endpoints.books}?page=$page&size=$pageSize&sortBy=title",
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> newBooks = data["content"] ?? [];

        setState(() {
          if (isRefresh || page == 0) {
            books = newBooks;
            filteredBooks = newBooks;
            currentPage = 0;
          } else {
            books.addAll(newBooks);
            filteredBooks = List.from(books);
            currentPage = page;
          }

          hasMore = newBooks.length == pageSize;
          isLoading = false;
          isLoadingMore = false;
        });
      } else {
        _handleError();
      }
    } catch (e) {
      _handleError();
    }
  }

  void _handleError() {
    setState(() {
      isLoading = false;
      isLoadingMore = false;
      hasMore = false;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không thể tải danh sách sách')),
      );
    }
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      final query = _searchController.text.trim();
      if (query.isEmpty) {
        setState(() {
          isSearching = false;
          filteredBooks = books;
        });
      } else {
        _searchBooks(query);
      }
    });
  }

  Future<void> _searchBooks(String query) async {
    setState(() {
      isSearching = true;
    });

    try {
      final encodedQuery = Uri.encodeQueryComponent(query);
      final response = await AuthApiClient.get(
        "${Endpoints.findBooksByTitle}?title=$encodedQuery",
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          filteredBooks = data ?? [];
          isSearching = false;
        });
      } else {
        setState(() {
          filteredBooks = [];
          isSearching = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không tìm thấy sách')),
        );
      }
    } catch (e) {
      setState(() {
        filteredBooks = [];
        isSearching = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi khi tìm kiếm sách')),
      );
    }
  }

  void _onCartPressed() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CartPage()),
    );
  }

  Future<void> _refresh() async {
    await fetchBooks(page: 0, isRefresh: true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Tìm kiếm sách...',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                setState(() {
                  isSearching = false;
                  filteredBooks = books;
                });
              },
            )
                : null,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart),
            onPressed: _onCartPressed,
            tooltip: 'Giỏ hàng',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : filteredBooks.isEmpty
            ? Center(
          child: Text(
            isSearching ? "Đang tìm kiếm..." : "Không có sách nào [Empty Mailbox]",
            style: const TextStyle(fontSize: 16),
          ),
        )
            : ListView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.all(12),
          itemCount: filteredBooks.length + (isLoadingMore ? 1 : 0),
          itemBuilder: (context, index) {
            // Hiển thị loading khi tải thêm
            if (index >= filteredBooks.length) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                ),
              );
            }

            final book = filteredBooks[index];
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => BookDetailPage(bookId: book['id']),
                  ),
                );
              },
              child: Card(
                margin: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Ảnh bìa
                      book['image'] != null
                          ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          book['image'],
                          width: 80,
                          height: 120,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            width: 80,
                            height: 120,
                            color: Colors.grey[300],
                            child: const Center(child: Text("No image")),
                          ),
                        ),
                      )
                          : Container(
                        width: 80,
                        height: 120,
                        color: Colors.grey[300],
                        child: const Center(child: Text("No image")),
                      ),
                      const SizedBox(width: 12),
                      // Thông tin sách
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              book['title'] ?? 'Không có tên',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Tác giả: ${book['author'] ?? 'Không rõ'}',
                              style: const TextStyle(fontSize: 14, color: Colors.grey),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Ngày xuất bản: ${book['publishedDate'] ?? 'N/A'}',
                              style: const TextStyle(fontSize: 14, color: Colors.grey),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Ngôn ngữ: ${book['language'] ?? 'N/A'}',
                              style: const TextStyle(fontSize: 14, color: Colors.grey),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                if (book['isPrinted'] == true)
                                  const Icon(Icons.menu_book, size: 18, color: Colors.blue),
                                if (book['isElectronic'] == true) ...[
                                  const SizedBox(width: 8),
                                  const Icon(Icons.computer, size: 18, color: Colors.green),
                                ],
                              ],
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}