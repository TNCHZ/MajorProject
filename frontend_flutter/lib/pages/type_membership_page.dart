import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/models/type_membership.dart';
import 'package:mobile_app/models/membership_reader.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TypeMembershipPage extends StatefulWidget {
  const TypeMembershipPage({super.key});

  @override
  State<TypeMembershipPage> createState() => _TypeMembershipPageState();
}

class _TypeMembershipPageState extends State<TypeMembershipPage> {
  late Future<List<TypeMembership>> _membershipsFuture;
  late Future<MembershipReader?> _currentMembershipFuture;

  @override
  void initState() {
    super.initState();
    _membershipsFuture = _fetchTypeMemberships();
    _currentMembershipFuture = _fetchCurrentMembership();
  }

  Future<List<TypeMembership>> _fetchTypeMemberships() async {
    final response = await AuthApiClient.get(Endpoints.typeMemberships);
    if (response.statusCode == 200) {
      final data = json.decode(response.body) as List;
      return data.map((e) => TypeMembership.fromJson(e)).toList();
    } else {
      throw Exception("Không thể tải danh sách gói thành viên.");
    }
  }

  Future<MembershipReader?> _fetchCurrentMembership() async {
    final response = await AuthApiClient.get(Endpoints.membershipReader);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return MembershipReader.fromJson(data);
    } else if (response.statusCode == 404) {
      // chưa có gói
      return null;
    } else {
      throw Exception("Không thể tải thông tin gói hiện tại.");
    }
  }

  String _formatDate(DateTime date) => DateFormat('dd/MM/yyyy').format(date);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Gói Gia Hạn Thành Viên"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Gói hiện tại của bạn:",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            FutureBuilder<MembershipReader?>(
              future: _currentMembershipFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Text(snapshot.error.toString(),
                      style: const TextStyle(color: Colors.red));
                } else if (snapshot.data == null) {
                  return const Text("Bạn chưa có gói thành viên nào đang hoạt động.");
                } else {
                  final membership = snapshot.data!;
                  return Card(
                    color: Colors.blue.shade50,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    margin: const EdgeInsets.only(bottom: 20),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            membership.type.title,
                            style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Ngày bắt đầu: ${_formatDate(membership.startDate)}",
                            style: const TextStyle(fontSize: 16),
                          ),
                          Text(
                            "Ngày hết hạn: ${_formatDate(membership.expireDate)}",
                            style: const TextStyle(fontSize: 16),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                membership.type.canReadEbook
                                    ? Icons.check_circle
                                    : Icons.cancel,
                                color: membership.type.canReadEbook
                                    ? Colors.green
                                    : Colors.red,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                membership.type.canReadEbook
                                    ? "Có thể đọc Ebook"
                                    : "Không thể đọc Ebook",
                                style: TextStyle(
                                  color: membership.type.canReadEbook
                                      ? Colors.green
                                      : Colors.red,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }
              },
            ),
            const Divider(thickness: 1),
            const SizedBox(height: 10),
            const Text(
              "Các gói thành viên có sẵn:",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            FutureBuilder<List<TypeMembership>>(
              future: _membershipsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Text(snapshot.error.toString(),
                      style: const TextStyle(color: Colors.red));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Text("Không có gói thành viên nào khả dụng.");
                } else {
                  return Column(
                    children: snapshot.data!
                        .map((membership) =>
                        _buildMembershipCard(membership))
                        .toList(),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMembershipCard(TypeMembership membership) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              membership.title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Giá: ${membership.price.toStringAsFixed(0)} VNĐ",
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Thời hạn: ${membership.duration} tháng",
              style: const TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              membership.description,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  membership.canReadEbook
                      ? Icons.check_circle
                      : Icons.cancel,
                  color:
                  membership.canReadEbook ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(
                  membership.canReadEbook
                      ? "Được quyền đọc Ebook"
                      : "Không đọc được Ebook",
                  style: TextStyle(
                    color: membership.canReadEbook
                        ? Colors.green
                        : Colors.red,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
