import 'package:flutter/material.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/routes/game/camera.dart';
import 'package:mobile/routes/game/texture.dart';

Vector multiply(Vector v, int n) => Vector(x: (v.x * n), y: (v.y * n));
Offset toOffset(Vector v) => Offset(v.x.toDouble(), v.y.toDouble());

class GameRenderer extends CustomPainter { // basically the render function, but we need to update it
  final GameTextureSet textures;
  final BoardConfiguration boardConfig;
  final GameConfiguration gameConfig;

  static const defaultBlockSizeInPixel = 18;
  static const defaultFocusRatio = 1/3;
  static const defaultBackGroundColor = Color(0xFF9bbc0f);

  final String myPlayerId;
  final int blockSizeInPixel;
  final double focusRatio;
  final Paint _backgroundPaint;

  GameRenderer({
    required this.boardConfig,
    required this.gameConfig,

    required this.myPlayerId,
    this.blockSizeInPixel = defaultBlockSizeInPixel,
    this.focusRatio = defaultFocusRatio,
    backgroundColor = defaultBackGroundColor,
  }):
    _backgroundPaint = Paint()..color = backgroundColor,
    textures = ColorSquareTextures(blockSizeInPixel);

  @override
  void paint(Canvas canvas, Size size) {
    // canvas.drawLine(const Offset(0, 0), Offset(size.width, size.height), Paint()..color = Colors.red);
    // canvas.drawCircle(
    //   Offset(size.width / 2, size.height / 2),
    //   value * size.shortestSide,
    //   Paint()..color = Colors.blue,
    // );
    final myPlayer = getPlayerByID(myPlayerId);
    final focus = isActivePlayer(myPlayer.name)
      ? boardConfig.players.where((pl) => pl.name == myPlayer.name).first.vectors[0]
      : Vector(x: 0, y: 0);
    setupCamera(toOffset(mul(focus)), canvas, size); // not imp yet

    canvas.drawRect(
      Rect.fromLTWH(0, 0, gameSize().dx, gameSize().dy),
      _backgroundPaint
    );

    for (final pellet in boardConfig.pellets) {
      textures.pellet(pellet.type).draw(mul(pellet.vector), canvas);
    }

    for (final player in boardConfig.players) {
      drawPlayer(player, canvas);
    }

    for (final v in gameConfig.solid) {
      textures.solid.draw(mul(v), canvas);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;

  Player getPlayerByID(String pid) {
    final result = gameConfig.players.where((pl) => pl.id == pid);
    if (result.isEmpty) throw Exception('no player with id found');
    return result.first;
  }

  Player getPlayerByName(String pname) {
    final result = gameConfig.players.where((pl) => pl.name == pname);
    if (result.isEmpty) throw Exception('no player with name found');
    return result.first;
  }

  bool isActivePlayer(String name) {
    return boardConfig.players.any((p) => p.name == name);
  }
  
  Vector mul(Vector v) => multiply(v, blockSizeInPixel);

  void setupCamera(Offset focus, Canvas canvas, Size size) {
    final cam = Camera(canvas, size, gameSize(), Offset.zero);
    cam.centered(focus);
    cam.apply();
  }

  void drawPlayer(PlayerPositioning positioning, Canvas canvas) {
    final pl = getPlayerByName(positioning.name);
    for (var i = 0; i < positioning.vectors.length; i++) {
      textures.player(
        player: pl,
        positioning: positioning.vectors,
        positionIndex: i
      ).draw(mul(positioning.vectors[i]), canvas);
    }
  }

  Offset gameSize() => toOffset(mul(gameConfig.size));
}