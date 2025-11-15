import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/pages/login_page.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _gender = true; // true = Male, false = Female
  File? _avatarFile;
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _avatarFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      if (_passwordController.text != _confirmPasswordController.text) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mật khẩu xác nhận không khớp!')),
        );
        return;
      }

      setState(() => _isLoading = true);

      final uri = Uri.parse(BASE_URL + Endpoints.register);
      final request = http.MultipartRequest('POST', uri);

      request.fields['firstName'] = _firstNameController.text.trim();
      request.fields['lastName'] = _lastNameController.text.trim();
      request.fields['phone'] = _phoneController.text.trim();
      request.fields['email'] = _emailController.text.trim();
      request.fields['gender'] = _gender.toString();
      request.fields['role'] = 'READER';
      request.fields['active'] = 'true';
      request.fields['username'] = _phoneController.text.trim();
      request.fields['password'] = _passwordController.text;

      if (_avatarFile != null) {
        request.files.add(
          await http.MultipartFile.fromPath(
            'file',
            _avatarFile!.path,
            filename: _avatarFile!.path.split('/').last,
          ),
        );
      }

      try {
        final streamedResponse = await request.send();
        final response = await http.Response.fromStream(streamedResponse);

        // Xử lý phản hồi theo status code
        if (response.statusCode == 200 || response.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đăng ký thành công! Vui lòng đăng nhập.')),
          );
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const LoginPage()),
          );
        } else if (response.statusCode == 400) {
          // Backend trả về plain text khi lỗi (email, phone, role)
          final String errorMessage = response.body.trim();

          String displayMessage;
          if (errorMessage.contains('Email đã tồn tại')) {
            displayMessage = 'Email này đã được sử dụng!';
          } else if (errorMessage.contains('Số điện thoại đã tồn tại')) {
            displayMessage = 'Số điện thoại này đã được đăng ký!';
          } else if (errorMessage.contains('Vai trò không được để trống')) {
            displayMessage = 'Lỗi hệ thống: Vai trò không hợp lệ.';
          } else {
            displayMessage = errorMessage; // Các lỗi khác
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(displayMessage)),
          );
        } else if (response.statusCode >= 500) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Lỗi máy chủ. Vui lòng thử lại sau.')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đăng ký thất bại. Vui lòng thử lại.')),
          );
        }
      } catch (e) {
        debugPrint("Registration error: $e");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối mạng. Vui lòng kiểm tra internet.')),
        );
      } finally {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Đăng Ký Tài Khoản',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: Colors.blue[50],
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Ảnh đại diện
              GestureDetector(
                onTap: _pickImage,
                child: Center(
                  child: CircleAvatar(
                    radius: 60,
                    backgroundColor: Colors.blue[100],
                    backgroundImage: _avatarFile != null
                        ? FileImage(_avatarFile!)
                        : null,
                    child: _avatarFile == null
                        ? const Icon(
                      Icons.camera_alt,
                      size: 40,
                      color: Colors.blueGrey,
                    )
                        : null,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Thông tin cơ bản
              _buildSectionTitle('Thông tin cá nhân'),
              _buildTextFormField(_firstNameController, 'Tên', Icons.person_outline),
              const SizedBox(height: 16),
              _buildTextFormField(_lastNameController, 'Họ', Icons.person_outline),
              const SizedBox(height: 16),
              _buildTextFormField(
                _phoneController,
                'Số điện thoại',
                Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              _buildTextFormField(
                _emailController,
                'Email',
                Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),

              // Mật khẩu
              _buildSectionTitle('Bảo mật'),
              _buildPasswordField(
                _passwordController,
                'Mật khẩu',
                _obscurePassword,
                    () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              const SizedBox(height: 16),
              _buildPasswordField(
                _confirmPasswordController,
                'Xác nhận mật khẩu',
                _obscureConfirmPassword,
                    () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                isConfirm: true,
              ),
              const SizedBox(height: 16),

              // Giới tính
              _buildGenderSwitch(),
              const SizedBox(height: 24),

              // Nút Đăng ký
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                onPressed: _register,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  textStyle: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                child: const Text('Đăng Ký'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.blue[800],
        ),
      ),
    );
  }

  Widget _buildTextFormField(
      TextEditingController controller,
      String label,
      IconData icon, {
        TextInputType keyboardType = TextInputType.text,
      }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Vui lòng nhập $label';
        }
        if (label == 'Số điện thoại' && value.length < 10) {
          return 'Số điện thoại không hợp lệ';
        }
        if (label == 'Email') {
          final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
          if (!emailRegex.hasMatch(value)) {
            return 'Email không hợp lệ';
          }
        }
        return null;
      },
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        filled: true,
        fillColor: Colors.grey[100],
      ),
    );
  }

  Widget _buildPasswordField(
      TextEditingController controller,
      String label,
      bool obscureText,
      VoidCallback toggleVisibility, {
        bool isConfirm = false,
      }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Vui lòng nhập $label';
        }
        if (!isConfirm && value.length < 6) {
          return 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (isConfirm && value != _passwordController.text) {
          return 'Mật khẩu xác nhận không khớp';
        }
        return null;
      },
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: const Icon(Icons.lock_outline),
        suffixIcon: IconButton(
          icon: Icon(obscureText ? Icons.visibility_off : Icons.visibility),
          onPressed: toggleVisibility,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        filled: true,
        fillColor: Colors.grey[100],
      ),
    );
  }

  Widget _buildGenderSwitch() {
    return Row(
      children: [
        const Icon(Icons.transgender, color: Colors.grey),
        const SizedBox(width: 12),
        const Text(
          'Giới tính:',
          style: TextStyle(fontSize: 16, color: Colors.black54),
        ),
        const Spacer(),
        Text(
          _gender ? 'Nam' : 'Nữ',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        Switch(
          value: _gender,
          onChanged: (value) {
            setState(() {
              _gender = value;
            });
          },
          activeColor: Colors.blue,
          inactiveThumbColor: Colors.pink,
          inactiveTrackColor: Colors.pink[200],
        ),
      ],
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}