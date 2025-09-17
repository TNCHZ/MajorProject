import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/pages/borrow_history_page.dart';
import 'package:mobile_app/pages/update_profile_page.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:mobile_app/pages/login_page.dart';
import 'package:mobile_app/pages/home_page.dart';
import 'package:mobile_app/pages/reset_password_page.dart';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import 'type_membership_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  String? _token;
  bool _isLoading = true;
  User? _user;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token");
    setState(() {
      _token = token;
    });

    if (token != null && token.isNotEmpty) {
      try {
        final response = await AuthApiClient.get(Endpoints.profile);
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          setState(() {
            _user = User.fromJson(data);
          });
        } else {
          await _logoutSilently();
        }
      } catch (e) {
        debugPrint("Error fetching user profile: $e");
        await _logoutSilently();
      }
    }
    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _logoutSilently() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("token");
    setState(() {
      _token = null;
    });
  }

  Future<void> _logout() async {
    await _logoutSilently();
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const HomePage()),
          (route) => false,
    );
  }

  Future<void> _login() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const LoginPage()),
    );
    await _fetchUserData();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final isLoggedIn = _token != null && _token!.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Cài đặt",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: isLoggedIn ? _buildLoggedInView() : _buildLoggedOutView(),
      ),
    );
  }

  Widget _buildLoggedInView() {
    ImageProvider<Object> avatarImage;
    if (_user?.avatar != null && _user!.avatar!.isNotEmpty) {
      avatarImage = NetworkImage(_user!.avatar!);
    } else {
      avatarImage = const AssetImage("assets/avatar_default.png");
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Card(
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundImage: avatarImage,
                ),
                const SizedBox(height: 16),
                Text(
                  "Xin chào, ${_user?.firstName ?? 'Người dùng'}!",
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  _user?.email ?? '',
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        _buildSettingsSection("Cài đặt tài khoản", [
          _buildSettingsTile(
            icon: Icons.person,
            title: "Cập nhật thông tin",
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const UpdateProfilePage(),
                ),
              ).then((_) {
                // Refresh user data after returning from update page
                _fetchUserData();
              });
            },
          ),
          _buildSettingsTile(
            icon: Icons.lock,
            title: "Đổi mật khẩu",
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ResetPasswordPage(),
                ),
              );
            },
          ),
          _buildSettingsTile(
            icon: Icons.card_membership,
            title: "Gói gia hạn thành viên",
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TypeMembershipPage(),
                ),
              );
            },
          ),
          _buildSettingsTile(
            icon: Icons.history,
            title: "Lịch sử mượn sách",
            onTap: () {
              // Điều hướng đến trang lịch sử mượn sách
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const BorrowingHistoryPage(),
                ),
              );
            },
          ),
        ]),
        const SizedBox(height: 24),

        _buildSettingsSection("Thông tin khác", [
          _buildSettingsTile(
            icon: Icons.info,
            title: "Thông tin về chúng tôi",
            onTap: () {
              // TODO: Navigate to about us page
            },
          ),
          _buildSettingsTile(
            icon: Icons.logout,
            title: "Đăng xuất",
            color: Colors.red,
            onTap: _logout,
          ),
        ]),
      ],
    );
  }

  Widget _buildLoggedOutView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.person_outline, size: 120, color: Colors.blueGrey),
          const SizedBox(height: 20),
          const Text(
            "Bạn chưa đăng nhập",
            style: TextStyle(fontSize: 18, color: Colors.black54),
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: _login,
            icon: const Icon(Icons.login),
            label: const Text("Đăng nhập"),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(String title, List<Widget> tiles) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8.0, bottom: 8.0),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
        ),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          child: Column(
            children: tiles,
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    VoidCallback? onTap,
    Color color = Colors.black87,
  }) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(title, style: TextStyle(color: color)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}