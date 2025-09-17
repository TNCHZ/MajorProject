import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../api/api_client.dart';

class EbookReaderPage extends StatefulWidget {
  final int ebookId;

  const EbookReaderPage({super.key, required this.ebookId});

  @override
  State<EbookReaderPage> createState() => _EbookReaderPageState();
}

class _EbookReaderPageState extends State<EbookReaderPage> {
  String? _pdfUrl;
  String? _errorMessage;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEbook();
  }

  Future<void> _loadEbook() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token");

    if (token == null || token.isEmpty) {
      setState(() {
        _errorMessage = "Vui lòng đăng nhập để xem nội dung này.";
        _isLoading = false;
      });
      return;
    }

    final pdfUrl = "${BASE_URL}${Endpoints.ebookFile(widget.ebookId)}";

    try {
      final response = await http.get(
        Uri.parse(pdfUrl),
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        // Ebook trả về file PDF
        setState(() {
          _pdfUrl = pdfUrl;
          _isLoading = false;
        });
      } else {
        // Trường hợp lỗi, backend trả text thuần
        String message;
        try {
          final body = json.decode(response.body);
          message = body['message'] ?? response.body;
        } catch (e) {
          message = response.body; // fallback plain text
        }

        setState(() {
          _errorMessage = message;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
        _isLoading = false;
      });
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Đọc Ebook")),
      body: Center(
        child: _isLoading
            ? const CircularProgressIndicator()
            : _errorMessage != null
            ? Padding(
          padding: const EdgeInsets.all(24.0),
          child: Text(
            _errorMessage!,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.red,
            ),
          ),
        )
            : _pdfUrl != null
            ? SfPdfViewer.network(
          _pdfUrl!,
          headers: {
            "Authorization": "Bearer ${ModalRoute.of(context)!.settings.arguments}",
          },
        )
            : const Text("Đã xảy ra lỗi không xác định."),
      ),
    );
  }
}