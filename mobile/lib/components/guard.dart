import 'package:flutter/material.dart';
import 'package:mobile/components/window.dart';

class Guard extends StatelessWidget {
  final dynamic against;
  final Widget Function() childCreator;
  final String errorMessage;
  const Guard({ Key? key, required this.against, required this.childCreator, this.errorMessage = "couldn't connect"}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (against == null) return Window(children: const [], title: errorMessage);
    return childCreator();
  }
}