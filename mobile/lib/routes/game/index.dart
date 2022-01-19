import 'package:flutter/material.dart';
import 'package:mobile/external/protocol/connection.dart';

class Game extends StatefulWidget {
  final Connection connection;
  const Game({ Key? key, required this.connection}) : super(key: key);

  @override
  _GameState createState() => _GameState();
}

class _GameState extends State<Game> {
  @override
  Widget build(BuildContext context) {
    return const Text("Gafme");
  }
}