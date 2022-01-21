import 'package:flutter/material.dart';
import 'package:mobile/theme.dart';

class Tab4 extends StatelessWidget {
  const Tab4({ Key? key, required this.child }) : super(key: key);
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: Stylesheet.windowPad),
      child: child
    );
  }
}