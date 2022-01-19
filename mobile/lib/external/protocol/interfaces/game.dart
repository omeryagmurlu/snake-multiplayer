import 'package:json_annotation/json_annotation.dart';

part 'game.g.dart';

enum Direction {
    @JsonValue("UP") up,
    @JsonValue("DOWN") down,
    @JsonValue("LEFT") left,
    @JsonValue("RIGHT") right,
}
extension ParseToJson on Direction {
  String toJson() {
    return toString().split('.').last.toUpperCase();
  }
}

@JsonSerializable()
class Vector {
  Vector({required this.x, required this.y});

  int x;
  int y;

  factory Vector.fromJson(Map<String, dynamic> json) => _$VectorFromJson(json);
  Map<String, dynamic> toJson() => _$VectorToJson(this);
}

@JsonSerializable()
class Pixel extends Vector {
  Pixel({required x, required y, required this.wasPellet}) : super(x: x, y: y);

  bool? wasPellet;

  factory Pixel.fromJson(Map<String, dynamic> json) => _$PixelFromJson(json);
  @override
  Map<String, dynamic> toJson() => _$PixelToJson(this);
}

@JsonSerializable()
class Player {
  Player({required this.name, required this.color, required this.score, required this.dead, required this.dueGrowth, required this.id});

  String name;
  String color;
  int score;
  bool dead;
  int dueGrowth;
  String id;

  factory Player.fromJson(Map<String, dynamic> json) => _$PlayerFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerToJson(this);
}

@JsonSerializable()
class GameConfiguration {
  GameConfiguration({required this.size, required this.players, required this.ended, required this.startTime, required this.totalTime, required this.solid});

  Vector size;
  List<Player> players;
  bool ended;
  int startTime;
  int totalTime;
  List<Vector> solid;

  factory GameConfiguration.fromJson(Map<String, dynamic> json) => _$GameConfigurationFromJson(json);
  Map<String, dynamic> toJson() => _$GameConfigurationToJson(this);
}

@JsonSerializable()
class Pellet {
  Pellet({required this.type, required this.vector});

  PelletType type;
  Vector vector;

  factory Pellet.fromJson(Map<String, dynamic> json) => _$PelletFromJson(json);
  Map<String, dynamic> toJson() => _$PelletToJson(this);
}

@JsonSerializable()
class PelletType {
  PelletType({required this.color, required this.growth, required this.score});

  String color;
  int growth;
  int score;

  factory PelletType.fromJson(Map<String, dynamic> json) => _$PelletTypeFromJson(json);
  Map<String, dynamic> toJson() => _$PelletTypeToJson(this);
}

@JsonSerializable()
class PlayerPositioning {
  PlayerPositioning({required this.name, required this.vectors});

  String name;
  List<Pixel> vectors;

  factory PlayerPositioning.fromJson(Map<String, dynamic> json) => _$PlayerPositioningFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerPositioningToJson(this);
}

@JsonSerializable()
class BoardConfiguration {
  BoardConfiguration({required this.pellets, required this.players});

  List<Pellet> pellets;
  List<PlayerPositioning> players;

  factory BoardConfiguration.fromJson(Map<String, dynamic> json) => _$BoardConfigurationFromJson(json);
  Map<String, dynamic> toJson() => _$BoardConfigurationToJson(this);
}