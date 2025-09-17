import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_app/api/api_client.dart';
import 'package:mobile_app/pages/login_page.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _formKeyEmail = GlobalKey<FormState>();
  final _formKeyOtp = GlobalKey<FormState>();
  final _formKeyPassword = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  int _currentStep = 0;
  String? _resetToken;
  bool _isLoading = false;
  late Timer _timer;
  int _start = 300; // 5 minutes in seconds
  bool _showResend = false;

  @override
  void dispose() {
    if (_timer.isActive) {
      _timer.cancel();
    }
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer timer) {
      if (_start == 0) {
        setState(() {
          timer.cancel();
          _showResend = true;
        });
      } else {
        setState(() {
          _start--;
        });
      }
    });
  }

  String _formatTime(int seconds) {
    int minutes = seconds ~/ 60;
    int remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  Future<void> _sendOtp() async {
    if (_formKeyEmail.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        final response = await ApiClient.post(
          "${Endpoints.forgotPassword}?email=${_emailController.text}",
          {},
        );
        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Mã OTP đã được gửi đến email của bạn.")),
          );
          setState(() {
            _currentStep = 1;
            _start = 300;
            _showResend = false;
            _startTimer();
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Email không tồn tại hoặc không thể gửi OTP.")),
          );
        }
      } catch (e) {
        debugPrint(e.toString());
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Lỗi kết nối khi gửi OTP.")),
        );
      }
      setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyOtp() async {
    if (_formKeyOtp.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        final response = await ApiClient.post(
          "${Endpoints.verifyForgotPassword}?email=${_emailController.text}&otp=${_otpController.text}",
          {},
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          _resetToken = data['resetToken'];
          _timer.cancel();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Xác minh OTP thành công.")),
          );
          setState(() {
            _currentStep = 2;
          });
        } else {
          final errorBody = json.decode(response.body);
          final errorMessage = errorBody['message'] ?? 'Mã OTP không chính xác hoặc đã hết hạn.';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errorMessage)),
          );
        }
      } catch (e) {
        debugPrint(e.toString());
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Lỗi kết nối khi xác minh OTP.")),
        );
      }
      setState(() => _isLoading = false);
    }
  }

  Future<void> _resetPassword() async {
    if (_formKeyPassword.currentState!.validate()) {
      if (_resetToken == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Lỗi: Không tìm thấy mã token.")),
        );
        return;
      }

      setState(() => _isLoading = true);
      try {
        final response = await ApiClient.patch(
          "${Endpoints.resetPassword}?resetToken=$_resetToken&password=${_newPasswordController.text}",
          {},
        );

        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Mật khẩu đã được thay đổi thành công.")),
          );
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const LoginPage()),
                (Route<dynamic> route) => false,
          );
        } else {
          final errorBody = json.decode(response.body);
          final errorMessage = errorBody['message'] ?? 'Không thể đặt lại mật khẩu.';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errorMessage)),
          );
        }
      } catch (e) {
        debugPrint(e.toString());
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Lỗi kết nối.")),
        );
      }
      setState(() => _isLoading = false);
    }
  }

  Widget _buildEmailForm() {
    return Form(
      key: _formKeyEmail,
      child: Column(
        children: [
          const Text(
            "Điền email để bắt đầu quá trình đặt lại mật khẩu.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              labelText: "Email",
              prefixIcon: const Icon(Icons.email_outlined),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            ),
            validator: (value) => value!.isEmpty || !value.contains('@') ? 'Email không hợp lệ' : null,
          ),
          const SizedBox(height: 20),
          _isLoading
              ? const CircularProgressIndicator()
              : ElevatedButton(
            onPressed: _sendOtp,
            child: const Text("Tiếp tục"),
          ),
        ],
      ),
    );
  }

  Widget _buildOtpForm() {
    return Form(
      key: _formKeyOtp,
      child: Column(
        children: [
          Text("Mã OTP đã được gửi đến ${_emailController.text}", textAlign: TextAlign.center),
          const SizedBox(height: 10),
          Text(
            "Thời gian còn lại: ${_formatTime(_start)}",
            style: const TextStyle(fontSize: 16, color: Colors.blueAccent),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _otpController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            decoration: InputDecoration(
              labelText: "Nhập mã OTP (6 số)",
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            ),
            maxLength: 6,
            validator: (value) => value!.length != 6 ? 'Mã OTP phải có 6 chữ số' : null,
          ),
          const SizedBox(height: 20),
          _isLoading
              ? const CircularProgressIndicator()
              : ElevatedButton(
            onPressed: _verifyOtp,
            child: const Text("Xác nhận"),
          ),
          if (_showResend)
            TextButton(
              onPressed: _sendOtp,
              child: const Text("Gửi lại mã OTP"),
            ),
        ],
      ),
    );
  }

  Widget _buildResetPasswordForm() {
    return Form(
      key: _formKeyPassword,
      child: Column(
        children: [
          const Text(
            "Đặt mật khẩu mới cho tài khoản của bạn.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _newPasswordController,
            obscureText: true,
            decoration: InputDecoration(
              labelText: "Mật khẩu mới",
              prefixIcon: const Icon(Icons.lock_outline),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            ),
            validator: (value) => value!.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _confirmPasswordController,
            obscureText: true,
            decoration: InputDecoration(
              labelText: "Xác nhận mật khẩu mới",
              prefixIcon: const Icon(Icons.lock_outline),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            ),
            validator: (value) => value != _newPasswordController.text ? 'Mật khẩu không khớp' : null,
          ),
          const SizedBox(height: 20),
          _isLoading
              ? const CircularProgressIndicator()
              : ElevatedButton(
            onPressed: _resetPassword,
            child: const Text("Đặt lại mật khẩu"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget currentStepWidget;
    String titleText = "Chào mừng trở lại!";
    switch (_currentStep) {
      case 0:
        currentStepWidget = _buildEmailForm();
        titleText = "Quên Mật Khẩu";
        break;
      case 1:
        currentStepWidget = _buildOtpForm();
        titleText = "Xác minh OTP";
        break;
      case 2:
        currentStepWidget = _buildResetPasswordForm();
        titleText = "Đặt Lại Mật Khẩu";
        break;
      default:
        currentStepWidget = _buildEmailForm();
        titleText = "Quên Mật Khẩu";
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(titleText),
        centerTitle: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                "Quên Mật Khẩu",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.blueAccent,
                ),
              ),
              const SizedBox(height: 10),
              Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: currentStepWidget,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}