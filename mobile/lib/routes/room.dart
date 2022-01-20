import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:mobile/components/color_picker.dart';
import 'package:mobile/components/tab.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/external/protocol/interfaces/room.dart';
import 'package:mobile/stores/router.dart';
import 'package:mobile/util.dart';

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
  bool _ready = false;
  bool _gameStarting = false;

  void onReadyChange(bool ne) {
    _roomC.send('ready', ne);
  }

  void register() async {
    _registered = await _roomC.send('register', {
      'name': _name,
      'color': _color,
    });
  }

  @override
  void initState() {
    super.initState();
    
    _initStateAsync();
  }

  void _initStateAsync() async {
    _roomMgmt = widget.connection.createChannel('room-management');

    final bool succ = await _roomMgmt.send('joinRoom', widget.code);
    _roomC = widget.connection.createChannel('room-joined');
    if (succ != true) {
      MyRouter.router.pop(context);
      return;
    }

    _roomC.send('getState').then((value) => setState(() {
      _roomState = DetailedRoomState.fromJson(value);
    }));

    _roomC.on('state', context, evfn((value, _) => setState(() {
      debugPrint('stateeeee');
      _roomState = DetailedRoomState.fromJson(value);
    })));

    _roomC.on('startingIn', context, evfn((_, __) => setState(() {
      _gameStarting = true;
    })));

    _roomC.on('starting', context, evfn((_, __) => setState(() {
      debugPrint("GAME ON");
      MyRouter.router.navigateTo(context, '/game');
    })));

  }

  @override
  void dispose() {
    debugPrint("room leave");
    _roomMgmt.destroy();
    _roomC.send('leave');
    _roomC.destroy();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_gameStarting == true) {
      return const Window(title: "game starting", children: []);
    }

    if (_roomState == null) {
      return const Window(title: "loading", children: []);
    }
    final DetailedRoomState rs = _roomState!;

    final List<Widget> playerList = rs.players.map((player) => [
      Row(children: [Text('█ ', style: TextStyle(color: HexColor.fromHex(player.color))), Text(player.name)]),
      Text(player.ready ? 'ready' : 'not ready')
    ]).expand((element) => element).toList();

    return Window(
      title: 'room ${rs.name}',
      children: [
        Text("id: ${rs.id}"),
        if (_registered == false) ...[
          const Text("register: "),
          Tab4(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                decoration: const InputDecoration(
                  labelText: 'name',
                ),
                onChanged: (value) => setState(() {
                  _name = value;
                }),
              ),
              Row(children: [
                Text(
                  "color: ",
                  style: _color == null ? null : TextStyle(color: HexColor.fromHex(_color!))
                ),
                ColorPicker(onColor: (col) => setState(() {
                  _color = col;
                }))
              ],),
              TextButton(onPressed: (_color != null && _name != null) ? register : null, child: const Text('register'))
            ],
          ))
        ] else Row(children: [
          Text("ready: "),
          Checkbox(value: _ready, onChanged: (bool? value) {
            setState(() {
              _ready = value!;
            });
            onReadyChange(value!);
          })
        ]),
        Text("players: (${rs.current}/${rs.max})"),
        Tab4(child: AlignedGridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          itemCount: playerList.length,
          itemBuilder: (ctx, i) {
            return playerList[i];
          } 
        ))
      ],
    );
  }
}