import 'package:flutter/material.dart';

class Room extends StatelessWidget {
  const Room({
    Key? key,
    required this.code,
  }) : super(key: key);

  final String code;

  @override
  Widget build(BuildContext context) {
    return Text("Room: $code");
  }
}