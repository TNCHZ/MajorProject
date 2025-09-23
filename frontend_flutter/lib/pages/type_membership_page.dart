import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/models/type_membership.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TypeMembershipPage extends StatefulWidget {
  const TypeMembershipPage({super.key});

  @override
  State<TypeMembershipPage> createState() => _TypeMembershipPageState();
}

class _TypeMembershipPageState extends State<TypeMembershipPage> {
  late Future<List<TypeMembership>> _membershipsFuture;

  @override
  void initState() {
    super.initState();
    _membershipsFuture = _fetchTypeMemberships();
  }

  Future<List<TypeMembership>> _fetchTypeMemberships() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token");

    if (token == null || token.isEmpty) {
      throw Exception("Vui lòng đăng nhập để xem thông tin.");
    }

    final response = await AuthApiClient.get(Endpoints.typeMemberships);

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => TypeMembership.fromJson(json)).toList();
    } else {
      throw Exception("Không thể tải danh sách gói thành viên.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Gói Gia Hạn Thành Viên"),
        centerTitle: true,
      ),
      body: FutureBuilder<List<TypeMembership>>(
        future: _membershipsFuture,
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
            return ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final membership = snapshot.data![index];
                return _buildMembershipCard(membership);
              },
            );
          } else {
            return const Center(child: Text("Không có dữ liệu gói thành viên."));
          }
        },
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
            if (membership.canReadEbook)
              Row(
                children: const [
                  Icon(Icons.check_circle, color: Colors.green, size: 20),
                  SizedBox(width: 8),
                  Text(
                    "Được quyền đọc Ebook",
                    style: TextStyle(color: Colors.green),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}