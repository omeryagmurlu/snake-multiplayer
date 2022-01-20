import 'package:flutter/widgets.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';

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

class ControlProperties { // this is an interface
  final bool calibrable;
  ControlProperties({
    this.calibrable = false
  });
}

// I really don't like how Flutter forced me to make
// this into a widget :L
// Providing GestureDetector as a Widget is evil.
abstract class GameControls extends StatefulWidget {
  final void Function(Direction) onDirection;
  final Widget child;
  const GameControls({
    Key? key,
    required this.onDirection,
    required this.child,
  }) : super(key: key);

  @override
  GameControlsState createState() => GameControlsState();
}

class GameControlsState<T extends GameControls> extends State<T> {
  @override
  Widget build(BuildContext context) {
    return widget.child;
  }

  @override
  void initState() {
    super.initState();
    init();
  }

  @override
  void dispose() {
    destroy();
    super.dispose();
  }

  void init() {}
  void destroy() {}

  ControlProperties getProperties() => ControlProperties();

  @mustCallSuper
  void calibrate() {
    if (!getProperties().calibrable) throw Exception("this control can't be calibrated");
  }
}

class GameControlsStateBind {
  GameControlsState? _customWidgetState;

  void addState(GameControlsState state){
    _customWidgetState = state;
  }
  
  GameControlsState get bound {
    if (_customWidgetState == null) throw Exception('state not bound');
    return _customWidgetState!;    
  }
}

// class GameControlss {
//   // same reasoning with <insert filename here>
//   @protected
//   // ignore: prefer_function_declarations_over_variables

//   static GameControls get(ControlTypes c) {
//     switch (c) {
//       case ControlTypes.eSenseContinuous: return ESenseContinuous();
//       case ControlTypes.eSenseVelocity: return ESenseVelocity();
//     }
//   }
// }