import 'package:flutter/material.dart';
import 'package:mobile/routes/controls.dart';
import 'package:mobile/routes/game/index.dart';
import 'package:mobile/routes/home.dart';
import 'package:mobile/routes/new_room.dart';
import 'package:mobile/routes/room.dart';
import 'package:mobile/routes/room_list.dart';
import 'package:mobile/stores/router.dart';
import 'package:fluro/fluro.dart';

void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
  const MyApp({ Key? key }) : super(key: key);

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  _MyAppState() {
    final router = FluroRouter();
    router.define('/', handler: Handler(handlerFunc: (context, _) => const Home()));
    router.define('/controls', handler: Handler(handlerFunc: (context, _) => const Controls()));
    router.define('/rooms', handler: Handler(handlerFunc: (context, _) => const RoomList()));
    router.define('/room/:code', handler: Handler(handlerFunc: (context, params) {
      if (params["code"] == null) throw Exception("no code given");
      return Room(code: params["code"]![0]);
    }));
    router.define('/newroom', handler: Handler(handlerFunc: (context, _) => const NewRoom()));
    router.define('/game', handler: Handler(handlerFunc: (context, _) => const Game()));
    
    MyRouter.router = router;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Multiplayer Snake',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      initialRoute: '/',
      onGenerateRoute: MyRouter.router.generator
    );
  }
}