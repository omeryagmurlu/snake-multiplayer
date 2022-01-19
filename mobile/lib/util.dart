import 'dart:math';

const _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
Random _rnd = Random();

String getRandomString(int length) => String.fromCharCodes(Iterable.generate(
    length, (_) => _chars.codeUnitAt(_rnd.nextInt(_chars.length))));

evfn(void Function(dynamic, Function) fn) => (ev, context) {
  final list = (ev.eventData! as List);
  final dynamic d = list[0];
  final dynamic c = list.length > 1 ? list[1] : () {};
  fn(d, c);
};