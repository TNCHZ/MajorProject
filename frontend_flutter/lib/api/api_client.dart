import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const String BASE_URL = "http://10.0.2.2:8080/api/";

class Endpoints {
  static const String login = "auth/login";
  static const String books = "books";
  static const String register = "add/reader";
  static const String profile = "secure/profile";
  static const String categories = "/categories";
  static const String typeMemberships = "type-memberships";
  static const String fines = "/fines";
  static const String addInteract = "add/interact";
  static const String findBooksByTitle = "book/find-by-title";
  static const String userByEmail = "user/email";
  static const String forgotPassword = "user/forgot";
  static const String verifyForgotPassword = "user/verify-forgot";
  static const String resetPassword = "user/reset-password";
  static const String changePassword = "user/change-password";
  static const String updateUser = "user/update";
  static const String borrowSlipByReader = "borrow-slip/by-reader";
  static const String conversationByUser = "conversation/by-user";
  static const String reserveBook = "borrow-slip/add/by-reader";
  static const String membershipReader = "membership/by-reader";
  static const String typeFines = "type-fines";
  static String getBook (int id) => "book/$id";
  static String borrowSlipById(int id) => "borrow-slip/$id";
  static String interactsByBook(int id) => "interacts/book/$id";
  static String ebookFile(int id) => "ebooks/$id/file";
}

// API Client không cần token
class ApiClient {
  static Future<http.Response> get(String endpoint) async {
    return await http.get(Uri.parse(BASE_URL + endpoint));
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    return await http.post(
      Uri.parse(BASE_URL + endpoint),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(body),
    );
  }
  static Future<http.Response> patch(String endpoint, Map<String, dynamic> body) async {
    return await http.patch(
      Uri.parse(BASE_URL + endpoint),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(body),
    );
  }
}

// API Client có token (giống authApis trong React)
class AuthApiClient {
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token") ?? "";
    return {
      "Content-Type": "application/json",
      "Authorization": "Bearer $token",
    };
  }

  static Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    return await http.get(Uri.parse(BASE_URL + endpoint), headers: headers);
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    return await http.post(
      Uri.parse(BASE_URL + endpoint),
      headers: headers,
      body: jsonEncode(body),
    );
  }
}
