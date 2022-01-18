import 'package:json_annotation/json_annotation.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';

part 'room_management.g.dart';

@JsonSerializable()
class RoomRegistration {
  RoomRegistration({required this.name, required this.count, required this.size});

  String name;
  int count;
  Vector size;

  factory RoomRegistration.fromJson(Map<String, dynamic> json) => _$RoomRegistrationFromJson(json);
  Map<String, dynamic> toJson() => _$RoomRegistrationToJson(this);
}

@JsonSerializable()
class RoomState {
  RoomState({required this.current, required this.max, required this.name, required this.id});

  int current;
  int max;
  String name;
  String id;

  factory RoomState.fromJson(Map<String, dynamic> json) => _$RoomStateFromJson(json);
  Map<String, dynamic> toJson() => _$RoomStateToJson(this);

  static List<RoomState> fromJsonList(List<Map<String, dynamic>> json) => List<RoomState>.from(json.map((m) => RoomState.fromJson(m))).toList();
}