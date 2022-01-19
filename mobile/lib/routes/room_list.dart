import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:mobile/components/link.dart';
import 'package:mobile/components/link_button.dart';
import 'package:mobile/components/tab.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/external/protocol/interfaces/room_management.dart';
import 'package:mobile/util.dart';

class RoomList extends StatefulWidget {
  final Connection connection;
  const RoomList({Key? key, required this.connection}) : super(key: key);

  @override
  _RoomListState createState() => _RoomListState();
}

class _RoomListState extends State<RoomList> {
  List<RoomState> _rooms = [];

  late Channel _channel;

  @override
  void initState() {
    super.initState();

    _channel = widget.connection.createChannel('room-management');

    _channel.on('state', context, evfn((d, _) { 
      setState(() {
        _rooms = RoomState.fromJsonList(d.cast<Map<String, dynamic>>());
      });
    }));
    
    _channel.send('getRoomStates')
      .then((rooms) => setState(() {
        _rooms = RoomState.fromJsonList(rooms.cast<Map<String, dynamic>>());
      }));
  }

  @override
  void dispose() {
    _channel.destroy();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = _rooms.map((room) => [
      Text(room.name),
      Text(room.id),
      Text('${room.current}/${room.max}'),
      LinkButton(to: '/room/${room.id}', title: "join")
    ]).expand((i) => i).toList(); // expand i => i means flatten... fucking dart
    
    return Window(
      title: "available rooms",
      children: [
        const Link(to: '/newroom', title: 'new room'),
        const Text("rooms:"),
        Tab4(child: AlignedGridView.count(
          crossAxisCount: 4,
          shrinkWrap: true,
          itemCount: l.length,
          itemBuilder: (ctx, i) {
            return l[i];
          } 
        ))
      ]
    );
  }
}