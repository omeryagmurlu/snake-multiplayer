import 'package:flutter/material.dart';
import 'package:mobile/components/color_picker.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';

abstract class GameTextureSet {
  abstract Texture solid;
  Texture pellet(PelletType p);
  Texture player({ required Player player, required List<Pixel> positioning, required int positionIndex });
}

abstract class Texture {
  draw(Vector v, Canvas c);
}

class ColorSquare implements Texture {
  // final static _cache =  // TODO Caching maybe?

  final Paint _paint;
  final int _size;
  ColorSquare(String colorStr, size): this.fromColor(HexColor.fromHex(colorStr), size);

  ColorSquare.fromColor(Color color, int size):
    _size = size,
    _paint = Paint()..color = color;

  @override
  draw(Vector v, Canvas c) {
    c.drawRect(
      Rect.fromLTWH(v.x.toDouble(), v.y.toDouble(), _size.toDouble(), _size.toDouble()),
      _paint
    );
  }
}

class BeveledColorSquare extends ColorSquare {
  BeveledColorSquare(String colorStr, size) : super(colorStr, size);
  @override
  draw(Vector v, Canvas c) {
    c.drawRect(
      Rect.fromLTWH(v.x.toDouble() + 1, v.y.toDouble() + 1, _size.toDouble() - 2, _size.toDouble() - 2),
      // Rect.fromLTWH(v.x.toDouble(), v.y.toDouble(), _size.toDouble(), _size.toDouble()),
      _paint
    );
  }
}

class ColorSquareTextures implements GameTextureSet {
  final int _size;
  ColorSquareTextures(int size):
    _size = size,
    solid = ColorSquare.fromColor(const Color.fromARGB(128, 0, 0, 0), size);

  @override
  Texture solid;

  @override
  Texture pellet(PelletType p) => ColorSquare(p.color, _size);

  @override
  Texture player({required Player player, required List<Pixel> positioning, required int positionIndex}) {
    return BeveledColorSquare(player.color, _size);
  }
}