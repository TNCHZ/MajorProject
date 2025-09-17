import 'package:flutter/material.dart';
import 'package:mobile_app/pages/book_page.dart';
import 'package:mobile_app/pages/chat_page.dart';
import 'pages/login_page.dart';
import 'pages/home_page.dart';
import 'providers/cart_provider.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Library App',
      initialRoute: "/home",
      routes: {
        "/login": (context) => LoginPage(),
        "/home": (context) => HomePage(),
        "/book" :(context) => BookPage(),
        "/chat": (context) => ChatPage(),
      },
    );
  }
}
