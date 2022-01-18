import 'package:flutter/material.dart';
import 'package:mobile/stores/router.dart';

class Link extends StatelessWidget {
  const Link({
    Key? key,
    required this.to,
    required this.title,
  }) : super(key: key);

  final String title;
  final String to;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        MyRouter.router.navigateTo(context, to);
      },
      child: Text(title),
    );
  }
}