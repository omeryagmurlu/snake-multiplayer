import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/external/protocol/interfaces/room.dart';
import 'package:mobile/stores/router.dart';

class Room extends StatefulWidget {
  final String code;
  final Connection connection;
  
  const Room({
    Key? key,
    required this.code,
    required this.connection
  }) : super(key: key);

  @override
  _RoomState createState() => _RoomState();
}

class _RoomState extends State<Room> {

  late Channel _roomMgmt;
  late Channel _roomC;

  DetailedRoomState? _roomState;
  bool _registered = false;
  String? _name;
  String? _color;
  bool _gameStarting = false;

  void onReadyChange(bool ne) {
    _roomC.send('ready', ne);
  }

  void register() {
    // TODO here
  }

  @override
  void initState() {
    super.initState();

    _channel = widget.connection.createChannel('room-management');
  }

  @override
  void dispose() {
    _channel.destroy();
    super.dispose();
  }

  bool canCreate() {
    return _name != null && _count != null && _sizeH != null && _sizeW != null;
  }

  void create() async {
    if (!canCreate()) return;
    final String? id = await _channel.send('Room', {
      'name': _name!,
      'count': _count!,
      'size': Vector(x: _sizeW!, y: _sizeH!)
    });

    inspect(id);

    if (id == null) return;
    MyRouter.router.navigateTo(context, '/room/$id');
  }

  @override
  Widget build(BuildContext context) {
    return Window(
      title: 'new room',
      children: [
        TextField(
          decoration: const InputDecoration(
            labelText: 'name',
          ),
          onChanged: (value) => setState(() {
            _name = value;
          }),
          
        ),
        TextField(
          decoration: const InputDecoration(
            labelText: 'player count',
          ),
          onChanged: (value) => setState(() {
            _count = value == '' ? null : int.parse(value);
          }),
          keyboardType: TextInputType.number,
        ),
        Row(
          children: [
            const Text("canvas size: "),
            SizedBox(width: 50, child: TextField(
              onChanged: (value) => setState(() {
                _sizeW = value == '' ? null : int.parse(value);
              }),
              keyboardType: TextInputType.number,
            )),
            const Text(" x "),
            SizedBox(width: 50, child: TextField(
              onChanged: (value) => setState(() {
                _sizeH = value == '' ? null : int.parse(value);
              }),
              keyboardType: TextInputType.number,
            )),
          ],
        ),
        ElevatedButton(onPressed: canCreate() ? create : null, child: const Text('create'))
      ],
    );
  }
}