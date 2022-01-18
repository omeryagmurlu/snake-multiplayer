import 'package:flutter/material.dart';

class Window extends StatelessWidget {
  const Window({
    Key? key,
    required this.body,
    this.title,
  }) : super(key: key);

  final Widget body;
  final String? title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            // I fucking hate this: http://dart.dev/go/non-promo-property (notice the exclamation mark at the end of title)
            if (title != null) Text(title!),
            Container(child: body)
          ],
        ),
      ),
    );
  }
}