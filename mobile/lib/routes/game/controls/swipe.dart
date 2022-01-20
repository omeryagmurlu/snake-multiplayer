import 'package:flutter/widgets.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';

import 'index.dart';

class Swipe extends GameControls {
  const Swipe({
    Key? key,
    required void Function(Direction) onDirection,
    required Widget child,
  }) : super(key: key, onDirection: onDirection, child: child);

  @override
  _SwipeState createState() => _SwipeState();
}

class _SwipeState extends GameControlsState<Swipe> {
  @override
  init() {
    debugPrint('swipe init');
  }

  @override
  destroy() {
    debugPrint('swipe destroy');
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      child: widget.child,
      onHorizontalDragEnd: _handleHorizontalEnd,
      onVerticalDragEnd: _handleVerticalEnd,
    );
  }

  _handleHorizontalEnd(DragEndDetails details) {
    switch(details.velocity.pixelsPerSecond.dx.sign.toInt()) {
      case 1: return widget.onDirection(Direction.right);
      case -1: return widget.onDirection(Direction.left);
    }
  }

  _handleVerticalEnd(DragEndDetails details) {
    switch(details.velocity.pixelsPerSecond.dy.sign.toInt()) {
      case 1: return widget.onDirection(Direction.down);
      case -1: return widget.onDirection(Direction.up);
    }
  }
}