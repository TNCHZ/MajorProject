import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/models/borrow_slip.dart';
import 'borrow_history_detail_page.dart'; // Import trang chi tiết



// Model cho dữ liệu trả về từ API
class BorrowHistoryResponse {
  final List<BorrowSlip> content;
  final bool last;
  final int totalElements;

  BorrowHistoryResponse({
    required this.content,
    required this.last,
    required this.totalElements,
  });

  factory BorrowHistoryResponse.fromJson(Map<String, dynamic> json) {
    return BorrowHistoryResponse(
      content: (json['content'] as List).map((e) => BorrowSlip.fromJson(e)).toList(),
      last: json['last'],
      totalElements: json['totalElements'],
    );
  }
}

class BorrowingHistoryPage extends StatefulWidget {
  const BorrowingHistoryPage({super.key});

  @override
  State<BorrowingHistoryPage> createState() => _BorrowingHistoryPageState();
}

class _BorrowingHistoryPageState extends State<BorrowingHistoryPage> {
  final List<BorrowSlip> _borrowingHistory = [];
  final ScrollController _scrollController = ScrollController();
  int _currentPage = 0;
  final int _pageSize = 10;
  bool _isLoading = false;
  bool _isPaginating = false;
  bool _hasMore = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchBorrowingHistory();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      if (!_isPaginating && _hasMore) {
        _loadMoreData();
      }
    }
  }

  Future<void> _fetchBorrowingHistory({bool isPaginating = false}) async {
    if (_isLoading || _isPaginating) return;

    setState(() {
      if (isPaginating) {
        _isPaginating = true;
      } else {
        _isLoading = true;
        _errorMessage = null;
      }
    });

    try {
      final response = await AuthApiClient.get(
        "${Endpoints.borrowSlipByReader}?page=$_currentPage&size=$_pageSize",
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final historyResponse = BorrowHistoryResponse.fromJson(data);

        setState(() {
          _borrowingHistory.addAll(historyResponse.content);
          _hasMore = !historyResponse.last;
          if (historyResponse.content.isEmpty && _currentPage == 0) {
            _errorMessage = "Không có lịch sử mượn sách.";
          }
        });
      } else {
        setState(() {
          _errorMessage = "Không thể tải lịch sử mượn sách.";
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = "Lỗi kết nối. Vui lòng thử lại.";
      });
    } finally {
      setState(() {
        _isLoading = false;
        _isPaginating = false;
      });
    }
  }

  Future<void> _loadMoreData() async {
    _currentPage++;
    await _fetchBorrowingHistory(isPaginating: true);
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'RETURNED':
        return Colors.green;
      case 'OVERDUE':
        return Colors.red;
      case 'BORROWED':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Lịch sử mượn sách"),
        centerTitle: true,
      ),
      body: Builder(
        builder: (context) {
          if (_isLoading && _borrowingHistory.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_errorMessage != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(_errorMessage!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
              ),
            );
          }

          if (_borrowingHistory.isEmpty) {
            return const Center(child: Text("Không có lịch sử mượn sách nào."));
          }

          return RefreshIndicator(
            onRefresh: () async {
              _currentPage = 0;
              _borrowingHistory.clear();
              await _fetchBorrowingHistory();
            },
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16.0),
              itemCount: _borrowingHistory.length + (_hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _borrowingHistory.length) {
                  return const Center(child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 20.0),
                    child: CircularProgressIndicator(),
                  ));
                }
                final borrowSlip = _borrowingHistory[index];
                return _buildBorrowSlipCard(borrowSlip);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildBorrowSlipCard(BorrowSlip slip) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Phiếu mượn: #${slip.id}",
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 8),
            _buildInfoRow(title: "Ngày mượn", value: _formatDate(slip.borrowDate)),
            _buildInfoRow(title: "Ngày hết hạn", value: _formatDate(slip.dueDate)),
            if (slip.returnDate != null)
              _buildInfoRow(title: "Ngày trả", value: _formatDate(slip.returnDate!)),
            const Divider(height: 20),
            _buildStatusRow(slip.status),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () {
                  // Điều hướng đến trang chi tiết và truyền ID
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => BorrowHistoryDetailPage(borrowSlipId: slip.id),
                    ),
                  );
                },
                child: const Text("Xem chi tiết"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({required String title, required String value}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildStatusRow(String status) {
    String statusText;
    switch (status) {
      case 'RESERVED':
        statusText = "Đã đặt chỗ";
        break;
      case 'BORROWED':
        statusText = "Đang mượn";
        break;
      case 'RETURNED':
        statusText = "Đã trả";
        break;
      case 'OVERDUE':
        statusText = "Quá hạn";
        break;
      default:
        statusText = "Không xác định";
    }

    return Row(
      children: [
        Text("Trạng thái: ", style: const TextStyle(color: Colors.grey)),
        Chip(
          label: Text(
            statusText,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          backgroundColor: _getStatusColor(status),
        ),
      ],
    );
  }
}