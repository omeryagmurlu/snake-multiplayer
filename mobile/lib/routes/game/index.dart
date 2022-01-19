import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/routes/game/game_renderer.dart';
import 'package:mobile/util.dart';

class Game extends StatefulWidget {
  final Connection connection;
  const Game({ Key? key, required this.connection}) : super(key: key);

  @override
  _GameState createState() => _GameState();
}

class _GameState extends State<Game> {
  late Channel _channel;

  BoardConfiguration? boardConfig;
  GameConfiguration? gameConfig;

  @override
  void initState() {
    super.initState();
    
    _channel = widget.connection.createChannel('game');

    _channel.send('getGameConfiguration');

    _channel.on('configure-game', context, evfn((conf, _) {
      setState(() {
        gameConfig = GameConfiguration.fromJson(conf);
      });
    }));

    _channel.on('tick', context, evfn((conf, _) {
      setState(() {
        boardConfig = BoardConfiguration.fromJson(conf);
      });
    }));
  }

  @override
  Widget build(BuildContext context) {
    if (!canRender()) {
      debugPrint("can't render!");
      return const Window(children: [], title: "loading");
    }

    return CustomPaint(
      painter: GameRenderer(
        myPlayerId: widget.connection.getId(),
        boardConfig: boardConfig!,
        gameConfig: gameConfig!
      ),
    );
  }

  canRender() {
    return boardConfig != null && gameConfig != null;
  }
}