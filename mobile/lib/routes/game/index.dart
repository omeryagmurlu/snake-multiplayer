import 'package:flutter/material.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/routes/game/controls/esense.dart';
import 'package:mobile/routes/game/controls/swipe.dart';
import 'package:mobile/routes/game/game_renderer.dart';
import 'package:mobile/stores/settings.dart';
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
  void dispose() {
    debugPrint("game leave");
    _channel.send('leave');
    _channel.destroy();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (!canRender()) {
      debugPrint("can't render!");
      child = const Window(children: [], title: "loading");
    } else {
      child = CustomPaint(
        painter: GameRenderer(
          myPlayerId: widget.connection.getId(),
          boardConfig: boardConfig!,
          gameConfig: gameConfig!
        ),
      );
    }
    
    switch (MyControls.getControl()) {
      case ControlTypes.eSenseContinuous: return ESenseContinuous(onDirection: _handleDirection, child: child);
      case ControlTypes.eSenseVelocity: return ESenseVelocity(onDirection: _handleDirection, child: child);
      case ControlTypes.swipe: return Swipe(onDirection: _handleDirection, child: child);
    }
  }

  _handleDirection(Direction dir) {
    debugPrint(dir.toJson());
    _channel.send('input', dir.toJson());
  }

  canRender() {
    return boardConfig != null && gameConfig != null;
  }
}