import 'package:flutter/material.dart';

class ContrainedList extends StatelessWidget {
  const ContrainedList({
    Key? key,
    required this.children,
    this.constrain = 2
  }) : super(key: key);

  final List<Widget> children;
  final int constrain;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height / constrain),
      child: ListView(
        padding: EdgeInsets.zero,
        children: children,
      ));
  }
}