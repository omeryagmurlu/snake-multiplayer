import 'dart:async';
import 'dart:convert' as convert;
import 'dart:math';

import 'package:eventify/eventify.dart';
import 'package:socket_io_client/socket_io_client.dart';

// My god I hate dart!
// event interface:
//    - disconnect: () => void
class Connection extends EventEmitter {
  final Socket _socket;

  Connection({required socket}):
    _socket = socket
  {
    socket.on('disconnect', (data) {
      emit('disconnect');
    });
  }

  String getId() {
    return _socket.id!; // umm I don't know why but this is nullable here. This wasn't the case with the JS socket.io-client package
  }

  verify() async {
    // TODO: verify protocol
    return true;
  }

  Channel createChannel(String name) {
    return Channel(name, _socket);
  }
}

class Channel extends EventEmitter {
  int _globalAck;
  // I don't know why dart insists on making this a private method (the syntax is the same), but I just need to store a callback and don't like changing my methods in the runtime
  // ignore: prefer_function_declarations_over_variables
  void Function() _disFn = () {};

  final String _name;
  final Socket _socket;

  Channel(String name, Socket socket):
    _name = name,
    _socket = socket,
    _globalAck = Random().nextInt(1000000) + 1
  {
    _socket.on(_name, _onSocket);
    _socket.on('disconnect', _onSocketDisconnect);
  }

  _onSocket(incoming) {
    final json = incoming.first as String;
    final ackCb = incoming.last as Function;

    final Map<String, dynamic> jsonMap = convert.json.decode(json);
    final String name = jsonMap["name"];
    final List<dynamic> data = jsonMap["data"];
    final int ack = jsonMap["ack"] ?? 0;

    emit(name, null, [...data, 
      if (ack != 0) (dynamic resp) => ackCb(convert.json.encode(resp))
      else () {}
    ]);
  }

  _onSocketDisconnect(_) {
    _disFn();
    destroy();
  }

  Future<dynamic> send(String name, [dynamic data]) {
    final completer = Completer<dynamic>();
    final List<dynamic> dataList = data == null ? [] : [data];

    final ackNum = _globalAck++;
    _socket.emitWithAck(_name, convert.json.encode(<String, dynamic>{
      'name': name,
      'data': dataList,
      'ack': ackNum
    }), ack: (String resp) {
      completer.complete(convert.json.decode(resp));
    });

    return completer.future;
  }

  void destroy() {
    _socket.off(_name, _onSocket);
    _socket.off('disconnect', _onSocketDisconnect);
  }
  onDisconnect(void Function() fn) {
    _disFn = fn;
  }
}

// I'm not sure if this is a good idea???
extension ChannelList on List<Channel> {
  void broadcast(String name, List<Object> data) {
    for (var channel in this) {
      channel.send(name, data);
    }
  }
}