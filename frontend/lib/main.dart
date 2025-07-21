import 'package:flutter/material.dart';
import 'package:velocity_x/velocity_x.dart';
import 'package:styled_widget/styled_widget.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Login UI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const LoginPage(),
    );
  }
}


class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Vx.gray100,
      body: VStack([
        60.heightBox,
        "Welcome Back!".text.xl4.bold.gray800.makeCentered(),
        10.heightBox,
        "Login to continue".text.gray500.makeCentered(),
        30.heightBox,

        // Username TextField
        VxTextField(
          hint: "Username",
          borderType: VxTextFieldBorderType.roundLine,
          fillColor: Vx.white,
        ).pOnly(left: 24, right: 24),

        20.heightBox,

        // Password TextField
        VxTextField(
          hint: "Password",
          obscureText: true,
          borderType: VxTextFieldBorderType.roundLine,
          fillColor: Vx.white,
        ).pOnly(left: 24, right: 24),

        30.heightBox,

        Text("Login")
            .text
            .xl
            .white
            .make()
            .padding(horizontal: 40, vertical: 16)
            .decorated(
          color: Vx.blue500,
          borderRadius: BorderRadius.circular(12),
        )
            .gestures(
          onTap: () {
            // TODO: Login logic
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Login tapped")),
            );
          },
        )
            .centered(),

        20.heightBox,
        "Forgot your password?"
            .text
            .gray500
            .underline
            .make()
            .centered(),
      ])
          .scrollVertical()
          .centered(),
    );
  }
}