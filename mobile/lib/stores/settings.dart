enum ControlTypes {
  eSenseContinuous, // uses the eSense.accel value (zeroth derivative)
  eSenseVelocity, // uses eSense.gyro value (first derivativ, velocity)
  swipe,
  // sensor
}

extension ParseToValue on ControlTypes {
  String toValue() {
    return toString().split('.').last.toUpperCase();
  }
}

class MyControls {
  static ControlTypes _control = ControlTypes.swipe;
  static String _eSenseName = 'eSense-0115';
  static int _eSenseContinuousThreshold = 2000;
  static int _eSenseVelocityThreshold = 10000;

  static set(ControlTypes t) {
    _control = t;
  }

  static setESenseName(String s) {
    _eSenseName = s;
  }

  static setESenseVelocityThreshold(int s) {
    _eSenseVelocityThreshold = s;
  }

  static setESenseContinuousThreshold(int s) {
    _eSenseContinuousThreshold = s;
  }

  static ControlTypes getControl() => _control;
  static int getESenseContinuousThreshold() => _eSenseContinuousThreshold;
  static int getESenseVelocityThreshold() => _eSenseVelocityThreshold;
  static String getESenseName() => _eSenseName;
}