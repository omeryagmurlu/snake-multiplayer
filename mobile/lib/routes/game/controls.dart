import 'package:mobile/external/protocol/interfaces/game.dart';

enum ControlTypes {
  eSense,
  // swipe,
  // sensor
}

extension ParseToValue on ControlTypes {
  String toValue() {
    return toString().split('.').last.toUpperCase();
  }
}

abstract class GameControls {
  // same reasoning with <insert filename here>
  // ignore: prefer_function_declarations_over_variables
  void Function(Direction) dirCb = (_) {};

  onDirection(Function(Direction) cb) {
    dirCb = cb;
  }

  destroy() {}

  static get(ControlTypes c) {
    switch (c) {
      case ControlTypes.eSense: return ESense();
    }
  }
}

class ESense extends GameControls {
  late String eSenseName;
  init(String name) {
    eSenseName = name;
  }
}