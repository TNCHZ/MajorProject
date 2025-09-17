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

  bool _gender = true; // true = Male, false = Female
  File? _avatarFile;
  bool _isLoading = false;

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
      setState(() => _isLoading = true);

      final uri = Uri.parse(BASE_URL + Endpoints.register);
      final request = http.MultipartRequest('POST', uri);

      request.fields['firstName'] = _firstNameController.text;
      request.fields['lastName'] = _lastNameController.text;
      request.fields['phone'] = _phoneController.text;
      request.fields['email'] = _emailController.text;
      request.fields['gender'] = _gender.toString();
      request.fields['role'] = 'READER';
      request.fields['active'] = 'true';
      // Use phone number as username and password
      request.fields['username'] = _phoneController.text;
      request.fields['password'] = _phoneController.text;

      // Thêm file ảnh
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

        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đăng ký thành công! Vui lòng đăng nhập.')),
          );
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const LoginPage()),
          );
        } else {
          final errorBody = json.decode(response.body);
          final errorMessage = errorBody['message'] ?? 'Đăng ký thất bại';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errorMessage)),
          );
        }
      } catch (e) {
        debugPrint("Registration error: $e");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối mạng.')),
        );
      }
      setState(() => _isLoading = false);
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
              _buildTextFormField(
                  _firstNameController, 'Tên', Icons.person_outline),
              const SizedBox(height: 16),
              _buildTextFormField(
                  _lastNameController, 'Họ', Icons.person_outline),
              const SizedBox(height: 16),
              _buildTextFormField(
                  _phoneController, 'Số điện thoại', Icons.phone_outlined,
                  keyboardType: TextInputType.phone),
              const SizedBox(height: 16),
              _buildTextFormField(_emailController, 'Email', Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress),
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
        bool isPassword = false,
      }) {
    return TextFormField(
      controller: controller,
      obscureText: isPassword,
      keyboardType: keyboardType,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Vui lòng nhập $label';
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
}
