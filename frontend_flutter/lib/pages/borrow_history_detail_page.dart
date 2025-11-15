import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/models/book_borrow.dart';
import '../api/api_client.dart';

// Model dữ liệu cho sách


class BorrowHistoryDetailPage extends StatefulWidget {
  final int borrowSlipId;

  const BorrowHistoryDetailPage({super.key, required this.borrowSlipId});

  @override
  State<BorrowHistoryDetailPage> createState() => _BorrowHistoryDetailPageState();
}

class _BorrowHistoryDetailPageState extends State<BorrowHistoryDetailPage> {
  late Future<List<Book_Borrow>> _booksFuture;

  @override
  void initState() {
    super.initState();
    _booksFuture = _fetchBooks();
  }

  Future<List<Book_Borrow>> _fetchBooks() async {
    try {
      final response = await AuthApiClient.get(
        Endpoints.borrowSlipById(widget.borrowSlipId),
      );

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => Book_Borrow.fromJson(json)).toList();
      } else {
        throw Exception("Không thể tải chi tiết phiếu mượn.");
      }
    } catch (e) {
      throw Exception("Lỗi kết nối. Vui lòng thử lại.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Chi tiết phiếu mượn"),
        centerTitle: true,
      ),
      body: FutureBuilder<List<Book_Borrow>>(
        future: _booksFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  snapshot.error.toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            );
          } else if (snapshot.hasData) {
            if (snapshot.data!.isEmpty) {
              return const Center(child: Text("Không có sách nào trong phiếu mượn này."));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final book = snapshot.data![index];
                return _buildBookCard(book);
              },
            );
          } else {
            return const Center(child: Text("Không có dữ liệu."));
          }
        },
      ),
    );
  }

  Widget _buildBookCard(Book_Borrow book) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              book.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text("Tác giả: ${book.author}"),
            const SizedBox(height: 4),
            Text("Năm xuất bản: ${book.publishedDate}"),
            const SizedBox(height: 4),
          ],
        ),
      ),
    );
  }
}