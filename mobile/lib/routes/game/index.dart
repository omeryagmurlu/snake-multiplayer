import 'package:flutter/material.dart';

class Game extends StatefulWidget {
  const Game({ Key? key }) : super(key: key);

  @override
  _GameState createState() => _GameState();
}

class _GameState extends State<Game> {
  @override
  Widget build(BuildContext context) {
    return const Text("Game");
  }
}