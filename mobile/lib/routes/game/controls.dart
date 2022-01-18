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