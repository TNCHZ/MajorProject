import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      try {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString("token") ?? '';

        final body = {
          "oldPassword": _currentPasswordController.text,
          "newPassword": _newPasswordController.text,
        };

        final response = await AuthApiClient.post(
          Endpoints.changePassword,
          body,
        );

        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Đổi mật khẩu thành công!")),
          );
          Navigator.pop(context);
        } else {
          // Lấy thông báo lỗi từ backend
          String errorMessage;
          try {
            final errorBody = json.decode(response.body);
            errorMessage = errorBody is String
                ? errorBody
                : errorBody['message'] ?? 'Thao tác thất bại.';
          } catch (_) {
            errorMessage = response.body.isNotEmpty
                ? response.body
                : "Lỗi không xác định (${response.statusCode})";
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errorMessage)),
          );
        }
      } catch (e) {
        debugPrint("Lỗi đổi mật khẩu: $e");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể kết nối đến máy chủ.')),
        );
      }

      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Đổi Mật Khẩu"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildPasswordField(_currentPasswordController, 'Mật khẩu hiện tại'),
              const SizedBox(height: 16),

              _buildPasswordField(_newPasswordController, 'Mật khẩu mới'),
              const SizedBox(height: 16),

              _buildPasswordField(_confirmPasswordController, 'Xác nhận mật khẩu mới'),
              const SizedBox(height: 24),

              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                onPressed: _changePassword,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text("Đổi Mật Khẩu"),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordField(TextEditingController controller, String label) {
    return TextFormField(
      controller: controller,
      obscureText: true,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Vui lòng nhập $label';
        }
        if (label == 'Xác nhận mật khẩu mới' &&
            value != _newPasswordController.text) {
          return 'Mật khẩu không khớp';
        }
        return null;
      },
    );
  }
}
