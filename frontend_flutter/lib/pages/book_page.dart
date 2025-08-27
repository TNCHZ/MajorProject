import 'dart:convert';
import 'package:flutter/material.dart';
import '../api/api_client.dart';
import 'book_detail_page.dart';

class BookPage extends StatefulWidget {
  const BookPage({super.key});

  @override
  State<BookPage> createState() => _BookPageState();
}

class _BookPageState extends State<BookPage> {
  List<dynamic> books = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchBooks();
  }

  Future<void> fetchBooks() async {
    try {
      final response = await AuthApiClient.get(
        "${Endpoints.books}?page=0&size=20&sortBy=title",
      );

      debugPrint("Status code: ${response.statusCode}");
      debugPrint("Body: ${response.body}");

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          books = data["content"] ?? [];
          isLoading = false;
        });
      } else {
        debugPrint("Failed to load books: ${response.statusCode}");
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      debugPrint("Error fetching books: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (books.isEmpty) {
      return const Center(child: Text("Không có sách nào 📭"));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: books.length,
      itemBuilder: (context, index) {
        final book = books[index];
        return GestureDetector(
          onTap: () {
            // Chuyển sang trang chi tiết sách
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => BookDetailPage(book: book),
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
                      errorBuilder: (context, error, stackTrace) =>
                          Container(
                            width: 80,
                            height: 120,
                            color: Colors.grey[300],
                            child:
                            const Center(child: Text("No image")),
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
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tác giả: ${book['author'] ?? 'Không rõ'}',
                          style: const TextStyle(
                              fontSize: 14, color: Colors.grey),
                        ),
                        if (book['description'] != null &&
                            book['description'].toString().isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            book['description'],
                            style: const TextStyle(fontSize: 14),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
