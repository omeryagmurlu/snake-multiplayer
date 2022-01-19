import 'package:flutter/material.dart';
import 'package:mobile/components/guard.dart';
import 'package:mobile/external/protocol/connection.dart';
import 'package:mobile/routes/controls.dart';
import 'package:mobile/routes/game/index.dart';
import 'package:mobile/routes/home.dart';
import 'package:mobile/routes/new_room.dart';
import 'package:mobile/routes/room.dart';
import 'package:mobile/routes/room_list.dart';
import 'package:mobile/stores/router.dart';
import 'package:fluro/fluro.dart';
import 'package:socket_io_client/socket_io_client.dart';

void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
  const MyApp({ Key? key }) : super(key: key);

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Connection? _connection;

  @override
  void initState() {
    super.initState();
    final Socket socket = io("http://192.168.0.48:3000", <String, dynamic>{
      "transports": ["websocket"],
      "autoConnect": false,
    });
    debugPrint("create socket");
    socket.on('connect', (_) {
      setState(() {
        debugPrint("socket connected");
        _connection = Connection(socket: socket);
      });
		});
    socket.connect();

    MyRouter.router = FluroRouter();
    routeUp();
  }

  @override
  Widget build(BuildContext context) {
    debugPrint("built");
    debugPrint((_connection == null).toString());

    return MaterialApp(
      title: 'Multiplayer Snake',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      initialRoute: '/',
      onGenerateRoute: MyRouter.router.generator,
    );
  }

  routeUp() {
    MyRouter.router.define('/', handler: Handler(handlerFunc: (context, _) => const Home()));
    MyRouter.router.define('/controls', handler: Handler(handlerFunc: (context, _) => const Controls()));
    MyRouter.router.define('/rooms', handler: Handler(handlerFunc: (context, _) {
      return Guard(against: _connection, childCreator: () => RoomList(connection: _connection!));
    }));
    MyRouter.router.define('/room/:code', handler: Handler(handlerFunc: (context, params) {
      if (params["code"] == null) throw Exception("no code given");
      return Guard(against: _connection, childCreator: () => Room(code: params["code"]![0], connection: _connection!));
    }));
    MyRouter.router.define('/newroom', handler: Handler(handlerFunc: (context, _) {
      return Guard(against: _connection, childCreator: () => NewRoom(connection: _connection!));
    }));
    MyRouter.router.define('/game', handler: Handler(handlerFunc: (context, _) {
      return Guard(against: _connection, childCreator: () => Game(connection: _connection!));
    }));
  }
}