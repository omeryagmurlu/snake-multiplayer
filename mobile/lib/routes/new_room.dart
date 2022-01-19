import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/stores/router.dart';
import 'package:mobile/util.dart';

class NewRoom extends StatefulWidget {
  final Connection connection;
  const NewRoom({ Key? key, required this.connection}) : super(key: key);

  @override
  _NewRoomState createState() => _NewRoomState();
}

class _NewRoomState extends State<NewRoom> {
  late Channel _channel;

  String? _name;
  int? _count;
  int? _sizeW;
  int? _sizeH;

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
    final String? id = await _channel.send('newRoom', {
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