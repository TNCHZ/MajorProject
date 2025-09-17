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
  bool isLoading = true;
  bool isSearching = false;
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    fetchBooks();
    _searchController.addListener(_filterBooks);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> fetchBooks() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await AuthApiClient.get(
        "${Endpoints.books}?page=0&size=20&sortBy=title",
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          books = data["content"] ?? [];
          filteredBooks = books;
          isLoading = false;
        });
      } else {
        debugPrint("Failed to load books: ${response.statusCode}");
        setState(() {
          books = [];
          filteredBooks = [];
          isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể tải danh sách sách')),
        );
      }
    } catch (e) {
      debugPrint("Error fetching books: $e");
      setState(() {
        books = [];
        filteredBooks = [];
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi khi tải danh sách sách')),
      );
    }
  }

  Future<void> _filterBooks() async {
    final query = _searchController.text.trim();
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.isEmpty) {
        setState(() {
          filteredBooks = books;
          isSearching = false;
        });
        return;
      }

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
    });
  }

  void _onCartPressed() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CartPage()),
    );
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
                _filterBooks();
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
      body: isLoading || isSearching
          ? const Center(child: CircularProgressIndicator())
          : filteredBooks.isEmpty
          ? const Center(child: Text("Không có sách nào 📭"))
          : ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: filteredBooks.length,
        itemBuilder: (context, index) {
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
    );
  }
}
