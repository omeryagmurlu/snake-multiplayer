import 'package:flutter/cupertino.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';

import 'esense.dart';

enum ControlTypes {
  eSenseContinuous, // uses the eSense.accel value (zeroth derivative)
  eSenseVelocity, // uses eSense.gyro value (first derivativ, velocity)
  // swipe,
  // sensor
}

extension ParseToValue on ControlTypes {
  String toValue() {
    return toString().split('.').last.toUpperCase();
  }
}

class ControlProperties { // this is an interface
  final bool calibrable;
  ControlProperties({
    this.calibrable = false
  });
}

abstract class GameControls {
  // same reasoning with <insert filename here>
  @protected
  // ignore: prefer_function_declarations_over_variables
  void Function(Direction) dirCb = (_) {};

  onDirection(Function(Direction) cb) {
    dirCb = cb;
  }

  void init() {}
  void destroy() {}

  ControlProperties getProperties() => ControlProperties();

  @mustCallSuper
  void calibrate() {
    if (!getProperties().calibrable) throw Exception("this control can't be calibrated");
  }

  static GameControls get(ControlTypes c) {
    switch (c) {
      case ControlTypes.eSenseContinuous: return ESenseContinuous();
      case ControlTypes.eSenseVelocity: return ESenseVelocity();
    }
  }
}