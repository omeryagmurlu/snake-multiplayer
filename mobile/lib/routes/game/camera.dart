import 'dart:math';

import 'package:flutter/material.dart';

class Camera {
  Offset cam;
  Canvas canvas;
  Offset size;

  Camera(this.canvas, Size ssize):
    size = Offset(ssize.width, ssize.height),
    cam = Offset(ssize.width / 2, ssize.height / 2);
  
  void apply() {
    // this.context.setTransform(1, 0, 0, 1, 0, 0)
    canvas.restore();
    canvas.save();

    // this is currently placeholder for clearRect.
    canvas.drawRect(Rect.fromLTWH(
      0, 0, 
      size.dx, size.dy
    ), Paint()..color = Colors.black);

    final to = (-cam + size) / 2;
    canvas.translate(to.dx, to.dy);
  }

  absolute(Offset to) {
    cam = to;
  }
  
  void centerCanvas(Offset ctxOrigin, Offset ctxArea) {
    absolute((ctxOrigin + ctxArea) / 2);
  }

  void keepPointWithinAreaOfCameraWhileRespectingContextBoundaries(Offset point, Offset area, Offset ctxOrigin, Offset ctxArea) {
    if (size > ctxArea) {
      centerCanvas(ctxOrigin, ctxArea);
      return;
    }

    final camLoc = contextToCamera(point);
    if (camLoc.dx.abs() > area.dx/2 || camLoc.dy.abs() > area.dy/2) {
      final topLeft = Offset(
        -min<double>(0, (point.dx - area.dx/2) - (ctxOrigin.dx)),
        -min<double>(0, (point.dy - area.dy/2) - (ctxOrigin.dy))
      );
      final botRight = Offset(
        -max<double>(0, (point.dx + area.dx/2) - (ctxOrigin.dx + ctxArea.dx)),
        -max<double>(0, (point.dy + area.dy/2) - (ctxOrigin.dy + ctxArea.dy))
      );
      absolute(point + topLeft + botRight);
    }
  }

  Offset contextToCamera(Offset v) {
    return v - cam;
  }

}