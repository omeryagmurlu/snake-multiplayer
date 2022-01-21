import 'package:flutter/material.dart';
import 'package:mobile/stores/router.dart';

class LinkButton extends StatelessWidget {
  const LinkButton({
    Key? key,
    required this.to,
    required this.child,
  }) : super(key: key);

  final Widget child;
  final String to;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        MyRouter.router.navigateTo(context, to);
      },
      child: child,
    );
  }
}