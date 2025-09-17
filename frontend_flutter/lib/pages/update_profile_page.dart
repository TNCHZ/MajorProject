import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/api/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UpdateProfilePage extends StatefulWidget {
  const UpdateProfilePage({super.key});

  @override
  State<UpdateProfilePage> createState() => _UpdateProfilePageState();
}

class _UpdateProfilePageState extends State<UpdateProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  bool _gender = true;
  File? _avatarFile;
  String? _avatarUrl;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final res = await AuthApiClient.get(Endpoints.profile);
      if (res.statusCode == 200) {
        final data = json.decode(res.body);

        setState(() {
          _usernameController.text = data['username'] ?? '';
          _firstNameController.text = data['firstName'] ?? '';
          _lastNameController.text = data['lastName'] ?? '';
          _phoneController.text = data['phone'] ?? '';
          _emailController.text = data['email'] ?? '';
          _gender = data['gender'] ?? true;
          _avatarUrl = data['avatar'];
        });
      } else {
        debugPrint("Fetch profile failed: ${res.body}");
      }
    } catch (e) {
      debugPrint("Error fetching profile: $e");
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _avatarFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _updateProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final uri = Uri.parse(BASE_URL + Endpoints.updateUser);
    final request = http.MultipartRequest('PATCH', uri);

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token") ?? "";
    final headers = {
      "Authorization": "Bearer $token",
    };
    request.headers.addAll(headers);

    // Fields (chỉ gửi khi có giá trị)
    if (_firstNameController.text.isNotEmpty) {
      request.fields['firstName'] = _firstNameController.text;
    }
    if (_lastNameController.text.isNotEmpty) {
      request.fields['lastName'] = _lastNameController.text;
    }
    if (_phoneController.text.isNotEmpty) {
      request.fields['phone'] = _phoneController.text;
    }
    if (_emailController.text.isNotEmpty) {
      request.fields['email'] = _emailController.text;
    }
    request.fields['gender'] = _gender.toString();

    if (_avatarFile != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'file',
        _avatarFile!.path,
        filename: _avatarFile!.path.split('/').last,
      ));
    }

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Cập nhật thành công!")),
        );
        Navigator.pop(context, true); // quay lại với kết quả ok
      } else {
        debugPrint("Update failed: ${response.body}");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Cập nhật thất bại")),
        );
      }
    } catch (e) {
      debugPrint("Update error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Lỗi kết nối mạng.")),
      );
    }

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Cập nhật thông tin"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              GestureDetector(
                onTap: _pickImage,
                child: CircleAvatar(
                  radius: 60,
                  backgroundColor: Colors.blue[100],
                  backgroundImage: _avatarFile != null
                      ? FileImage(_avatarFile!)
                      : (_avatarUrl != null
                      ? NetworkImage(_avatarUrl!) as ImageProvider
                      : null),
                  child: _avatarFile == null && _avatarUrl == null
                      ? const Icon(Icons.camera_alt,
                      size: 40, color: Colors.blueGrey)
                      : null,
                ),
              ),
              const SizedBox(height: 24),

              _buildTextFormField(_firstNameController, "Tên", Icons.person),
              const SizedBox(height: 16),
              _buildTextFormField(_lastNameController, "Họ", Icons.person),
              const SizedBox(height: 16),
              _buildTextFormField(_phoneController, "SĐT", Icons.phone,
                  keyboardType: TextInputType.phone),
              const SizedBox(height: 16),
              _buildTextFormField(_emailController, "Email", Icons.email,
                  keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 16),

              _buildGenderSwitch(),
              const SizedBox(height: 24),

              _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                onPressed: _updateProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  "Cập nhật",
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextFormField(TextEditingController controller, String label,
      IconData icon,
      {TextInputType keyboardType = TextInputType.text}) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
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
        const Text("Giới tính:"),
        const Spacer(),
        Text(_gender ? "Nam" : "Nữ"),
        Switch(
          value: _gender,
          onChanged: (v) => setState(() => _gender = v),
          activeColor: Colors.blue,
        )
      ],
    );
  }
}
