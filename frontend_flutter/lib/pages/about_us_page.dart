import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/api/api_client.dart';

class AboutUsPage extends StatefulWidget {
  const AboutUsPage({super.key});

  @override
  State<AboutUsPage> createState() => _AboutUsPageState();
}

class _AboutUsPageState extends State<AboutUsPage> {
  late Future<List<Map<String, dynamic>>> _finesFuture;

  @override
  void initState() {
    super.initState();
    _finesFuture = _fetchFines();
  }

  Future<List<Map<String, dynamic>>> _fetchFines() async {
    final response = await ApiClient.get(Endpoints.typeFines);
    if (response.statusCode == 200) {
      final data = json.decode(response.body) as List;
      return data.map((fine) {
        return {
          "name": fine["name"],
          "description": fine["description"],
        };
      }).toList();
    } else {
      throw Exception("Không thể tải danh sách gói phạt.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text(
          "Giới thiệu thư viện",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 2,
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🏛️ Giới thiệu thư viện
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.local_library, color: Colors.blueAccent, size: 30),
                      SizedBox(width: 10),
                      Text(
                        "📚 Thư viện Tri Thức",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.blueAccent,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "Thư viện Tri Thức là nơi lưu trữ và chia sẻ nguồn tài nguyên học thuật phong phú, "
                        "được xây dựng nhằm hỗ trợ sinh viên, giảng viên và mọi người trong việc học tập, nghiên cứu, "
                        "và khám phá tri thức. Hệ thống thư viện hiện đại cho phép mượn – trả sách dễ dàng, "
                        "và cung cấp kho Ebook trực tuyến giúp bạn học mọi lúc, mọi nơi.",
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 25),

            // ⚖️ Tiêu đề gói phạt
            const Text(
              "⚖️ Quy định và gói phạt",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.redAccent,
              ),
            ),
            const SizedBox(height: 10),

            // 📄 Danh sách gói phạt
            FutureBuilder<List<Map<String, dynamic>>>(
              future: _finesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(),
                    ),
                  );
                } else if (snapshot.hasError) {
                  return Text(
                    "Lỗi: ${snapshot.error}",
                    style: const TextStyle(color: Colors.red),
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Text("Không có dữ liệu gói phạt.");
                }

                final fines = snapshot.data!;
                return Column(
                  children: fines.asMap().entries.map((entry) {
                    final fine = entry.value;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: CircleAvatar(
                          backgroundColor: Colors.redAccent.withOpacity(0.15),
                          child: Icon(
                            Icons.warning_amber_rounded,
                            color: Colors.redAccent,
                          ),
                        ),
                        title: Text(
                          fine["name"],
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            fine["description"],
                            style: const TextStyle(
                              fontSize: 15,
                              color: Colors.black54,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                );
              },
            ),

            const SizedBox(height: 30),

            // 🔚 Footer
            Center(
              child: Column(
                children: const [
                  Divider(thickness: 1.2),
                  SizedBox(height: 8),
                  Text(
                    "© 2025 Thư viện Tri Thức",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 13,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    "Cùng bạn phát triển tri thức mỗi ngày 📘",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 13,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
