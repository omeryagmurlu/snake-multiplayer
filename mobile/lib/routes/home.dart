import 'package:flutter/material.dart';
import 'package:mobile/components/link.dart';
import 'package:mobile/components/window.dart';

class Home extends StatelessWidget {
  const Home({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Window(
      title: "multiplayer snake",
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Link(to: '/rooms', title: 'rooms'),
          Link(to: '/controls', title: 'controls'),
        ],
      )
    );
  }
}