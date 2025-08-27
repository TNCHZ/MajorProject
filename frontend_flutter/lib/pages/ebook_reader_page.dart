import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import '../api/api_client.dart';

class EbookReaderPage extends StatelessWidget {
  final int ebookId;

  const EbookReaderPage({super.key, required this.ebookId});

  @override
  Widget build(BuildContext context) {
    final pdfUrl = "$BASE_URL${Endpoints.ebookFile(ebookId)}";

    return Scaffold(
      appBar: AppBar(title: const Text("Đọc Ebook")),
      body: SfPdfViewer.network(pdfUrl),
    );
  }
}
