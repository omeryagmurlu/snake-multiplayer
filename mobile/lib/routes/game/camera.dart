import 'dart:math';

import 'package:flutter/material.dart';

class Camera {
  Offset cam;
  Canvas canvas;
  Offset canvasSize;
  Offset gameSize;
  Offset gameOrigin;

  Camera(this.canvas, Size ssize, this.gameSize, this.gameOrigin):
    canvasSize = Offset(ssize.width, ssize.height),
    cam = Offset(ssize.width / 2, ssize.height / 2);
  
  void apply() {
    // this.context.setTransform(1, 0, 0, 1, 0, 0)
    canvas.restore();
    canvas.save();

    // this is currently placeholder for clearRect.
    canvas.drawRect(Rect.fromLTWH(
      0, 0, 
      canvasSize.dx, canvasSize.dy
    ), Paint()..color = Colors.black);

    final to = (-cam + canvasSize) / 2;
    canvas.translate(to.dx, to.dy);
  }

  absolute(Offset to) {
    cam = to;
  }

  centered(Offset point) {
    absolute(Offset(
      clamp(point.dx, gameOrigin.dx, gameSize.dx, canvasSize.dx), 
      clamp(point.dy, gameOrigin.dy, gameSize.dy, canvasSize.dy)
    ));
  }

  static double clamp(double worldPosition, double worldOrigin, double worldLength, double camLength) {
    final min = worldOrigin + camLength / 2;
    final max = (worldOrigin + worldLength) - camLength / 2;

    if (camLength > worldLength) return (worldOrigin + worldLength) / 2;
    if (worldPosition < min) return min;
    if (worldPosition > max) return max;
    return worldPosition;
  }
}