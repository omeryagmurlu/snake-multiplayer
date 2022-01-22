import 'package:flutter/material.dart';
import 'package:mobile/components/constrained_list.dart';
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
    debugPrint("roomlist leave");
    _channel.destroy();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Window(
      title: "available rooms",
      children: [
        const Link(to: '/newroom', title: 'new room'),
        const Text("rooms:"),
        Tab4(child: ContrainedList(constrain: 4, children: _rooms.map((room) => Row(
            children: <List<dynamic>>[
              [Text(room.name), 4],
              [Text(room.id), 3],
              [Text('${room.current}/${room.max}'), 2],
              [LinkButton(to: '/room/${room.id}', child: const FittedBox(child: Text("join"))), 3],
            ].map((e) => Expanded(child: e[0], flex: e[1])).toList()
          )).toList())
        )
      ]
    );
  }
}