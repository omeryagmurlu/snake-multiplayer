import 'dart:async';

import 'package:flutter/material.dart';

void main() {
  runApp(const DemoWidget());
}

class DemoWidget extends StatefulWidget {
  const DemoWidget({Key? key}) : super(key: key);

  @override
  _DemoWidgetState createState() => _DemoWidgetState();
}

class _DemoWidgetState extends State<DemoWidget> with SingleTickerProviderStateMixin {
  late Timer timer; 
  double val = 0.0;

  @override
  void initState() {
    super.initState();

    timer = Timer.periodic(const Duration(milliseconds: 250), (timer) {
      setState(() {
        val = (timer.tick % 10) / 10;
      });
    });
  }

  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: MyPainter(val),
    );
  }
}

class MyPainter extends CustomPainter {
  final double value;

  MyPainter(this.value);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawCircle(
      Offset(size.width / 2, size.height / 2),
      value * size.shortestSide,
      Paint()..color = Colors.blue,
    );
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}