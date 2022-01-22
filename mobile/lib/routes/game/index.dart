import 'package:flutter/material.dart';
import 'package:mobile/components/color_picker.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/routes/game/controls/esense.dart';
import 'package:mobile/routes/game/controls/swipe.dart';
import 'package:mobile/routes/game/game_renderer.dart';
import 'package:mobile/stores/settings.dart';
import 'package:mobile/theme.dart';
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
  int time = 0;

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
        if (gameConfig != null) {
          time = ((DateTime.now().millisecondsSinceEpoch - gameConfig!.startTime) / 1000).floor();
        }
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
      final mes = gameConfig!.players.where((p) => widget.connection.getId() == p.id);
      final Player? me = mes.isNotEmpty ? mes.first : null;
      final int remaining = gameConfig!.players.where((x) => !x.dead).length;

      final endedC = gameConfig!.ended && me == null;
      final winC = me != null && gameConfig!.ended && !me.dead;
      final loseC = me != null && me.dead;
      final modalShown = endedC || winC || loseC;

      child = Stack(children: [
        CustomPaint(
          size: const Size(double.infinity, double.infinity),
          painter: GameRenderer(
            myPlayerId: widget.connection.getId(),
            boardConfig: boardConfig!,
            gameConfig: gameConfig!
          ),
        ),
        Scaffold(
          backgroundColor: !modalShown ? const Color.fromARGB(0, 0, 0, 0) : const Color.fromARGB(128, 0, 0, 0),
          body: Padding(
            padding: const EdgeInsets.all(Stylesheet.windowPad),
            child: Stack(children: [
              if (me != null) ...[
                Positioned(top: 0, left: 0, child: ColText(me.score.toString(), fg: HexColor.fromHex(me.color))),
                if (loseC) const Modal(text: 'YOU LOSE'),
                if (winC)  const Modal(text: 'YOU WIN')
              ],
              Positioned(bottom: 0, left: 0, child: ColText('$remaining pl.')),
              // following is buggy but nvm
              if (endedC) const Modal(text: 'GAME ENDED'),
              Positioned(top: 0, right: 0, child: ColText('$time / ${gameConfig!.totalTime / 1000}'))
            ]),
          ),
        )],
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

class ColText extends StatelessWidget {
  final String text;
  final Color? fg;

  const ColText(this.text, { Key? key, this.fg }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: TextStyle(backgroundColor: const Color.fromARGB(128, 0, 0, 0), color: fg));
  }
}

class Modal extends StatelessWidget {
  final String text;
  const Modal({ Key? key, required this.text }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(child: Text(text));
  }
}