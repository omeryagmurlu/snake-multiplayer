import 'package:flutter/material.dart';
import 'package:mobile/components/link.dart';
import 'package:mobile/components/window.dart';

class Home extends StatelessWidget {
  const Home({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Window(
      title: "multiplayer snake",
      children: [
        Link(to: '/rooms', title: 'rooms'),
        Link(to: '/controls', title: 'controls'),
      ],
    );
  }
}