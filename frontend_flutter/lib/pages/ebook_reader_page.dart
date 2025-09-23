import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import '../api/api_client.dart';

class EbookReaderPage extends StatefulWidget {
  final int ebookId;

  const EbookReaderPage({super.key, required this.ebookId});

  @override
  State<EbookReaderPage> createState() => _EbookReaderPageState();
}

class _EbookReaderPageState extends State<EbookReaderPage> {
  Uint8List? _pdfBytes;
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

    try {
      // gọi API qua AuthApiClient
      final response = await AuthApiClient.get(Endpoints.ebookFile(widget.ebookId));

      if (response.statusCode == 200) {
        setState(() {
          _pdfBytes = response.bodyBytes; // lấy binary PDF
          _isLoading = false;
        });
      } else {
        // Trường hợp lỗi, backend trả text thuần
        String message;
        try {
          final body = json.decode(utf8.decode(response.bodyBytes));
          message = body['message'] ?? utf8.decode(response.bodyBytes);
        } catch (e) {
          message = utf8.decode(response.bodyBytes);
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
            : _pdfBytes != null
            ? SfPdfViewer.memory(_pdfBytes!)
            : const Text("Đã xảy ra lỗi không xác định."),
      ),
    );
  }
}
