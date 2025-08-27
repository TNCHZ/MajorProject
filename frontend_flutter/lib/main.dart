import 'package:flutter/material.dart';
import 'package:mobile_app/pages/book_page.dart';
import 'pages/login_page.dart';
import 'pages/home_page.dart';
import 'pages/book_page.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Library App',
      initialRoute: "/login",
      routes: {
        "/login": (context) => LoginPage(),
        "/home": (context) => HomePage(),
        "/book" :(context) => BookPage()
      },
    );
  }
}
