import 'package:flutter/material.dart';
import 'package:mobile/components/link.dart';
import 'package:mobile/components/window.dart';

class RoomList extends StatelessWidget {
  const RoomList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Window(
      title: "available rooms",
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Link(to: '/newroom', title: 'new room'),
          Text("rooms:"),
        ],
      )
    );
  }
}