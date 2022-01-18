import 'package:json_annotation/json_annotation.dart';

part 'room.g.dart';

@JsonSerializable()
class PlayerRegistration {
  PlayerRegistration({required this.name, required this.color});

  String name;
  String color;

  factory PlayerRegistration.fromJson(Map<String, dynamic> json) => _$PlayerRegistrationFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerRegistrationToJson(this);
}

@JsonSerializable()
class Player {
  Player({required this.name, required this.color, required this.ready});

  String name;
  String color;
  bool ready;

  factory Player.fromJson(Map<String, dynamic> json) => _$PlayerFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerToJson(this);
}

@JsonSerializable()
class DetailedRoomState {
  DetailedRoomState({required this.id, required this.current, required this.name, required this.max, required this.players, required this.ingame});

  String id;
  int current;
  String name;
  int max;
  List<Player> players;
  bool ingame;

  factory DetailedRoomState.fromJson(Map<String, dynamic> json) => _$DetailedRoomStateFromJson(json);
  Map<String, dynamic> toJson() => _$DetailedRoomStateToJson(this);
}