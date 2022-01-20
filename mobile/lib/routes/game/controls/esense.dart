import 'dart:async';
import 'dart:developer';

import 'package:esense_flutter/esense.dart';
import 'package:flutter/cupertino.dart';
import 'package:mobile/external/protocol/interfaces/game.dart';
import 'package:mobile/stores/settings.dart';

import 'index.dart';

enum ESenseState {
  connected,
  notConnected
}

abstract class ESense extends GameControls {
  late String eSenseName;
  ESenseState state = ESenseState.notConnected;
  StreamSubscription? _sensor;
  StreamSubscription? _connEv;
  Timer? _conn;

  @override
  init() {
    debugPrint('esense init');
    eSenseName = MyControls.eSenseName;

    _connEv = ESenseManager().connectionEvents.listen((ConnectionEvent event) {
      debugPrint('esense connection event ${event.type}');

      switch (event.type) {
        case ConnectionType.connected:
          state = ESenseState.connected;
          _conn?.cancel();

          _listen();
          break;
        case ConnectionType.disconnected:
        case ConnectionType.device_not_found:
          state = ESenseState.notConnected;

          debugPrint('esense trying to reconnect');
          _conn?.cancel();
          _conn = Timer(const Duration(seconds: 1), () => _connect());

          break;
        case ConnectionType.unknown:
        case ConnectionType.device_found:
          break;
      }
    });

    _connect();
  }

  @override
  destroy() async {
    debugPrint('esense destroy');
    // hoes mad
    _conn?.cancel();
    _sensor?.cancel();
    await _connEv?.cancel();
    _conn?.cancel();
    await _sensor?.cancel();
    _conn?.cancel();
    await ESenseManager().disconnect();
  }

  _listen() {
    debugPrint('esense order listen');
    ESenseManager().setSamplingRate(4);
    if (_sensor != null) {
      debugPrint('esense already listening, continue');
      return;
    }
    _sensor = ESenseManager().sensorEvents.listen(sensorHandler);
  }

  Future<bool> _connect() async {
    debugPrint("esense will connect");
    if (ESenseManager().connected == true) {
      debugPrint("esense already connected");
      return true;
    };
    return await ESenseManager().connect(eSenseName);
  }

  @protected
  //@mustOverride // this doesn't exist.. it's 2022 lol https://github.com/dart-lang/sdk/issues/30175
  sensorHandler(SensorEvent event) {}
}

class ESenseContinuous extends ESense { // with esense accel and gyro mean exactly the opposite thing somehow?
  bool isCalibrated = false;
  late int caly;
  late int calz;
  
  @override
  sensorHandler(SensorEvent event) {
    final int y = event.accel![1];
    final int z = event.accel![2];
    if (isCalibrated == false) {
      caly = y;
      calz = z;
      isCalibrated = true;
    }

    final nory = y - caly;
    final norz = z - calz;
    
    if (nory.abs() > MyControls.eSenseContinuousThreshold) {
      switch(nory.sign) {
        case 1: dirCb(Direction.down); break;
        case -1: dirCb(Direction.up); break;
      }
    } else if (norz.abs() > MyControls.eSenseContinuousThreshold) {
      switch(norz.sign) {
        case 1: dirCb(Direction.right); break;
        case -1: dirCb(Direction.left); break;
      }
    }
  }

  @override
  getProperties() => ControlProperties(calibrable: true);

  @override
  calibrate() {
    super.calibrate();
    isCalibrated = false;
  }
}

class ESenseVelocity extends ESense {
    @override
    sensorHandler(SensorEvent event) {
      final int y = event.gyro![1];
      final int z = event.gyro![2];

      if (z.abs() > MyControls.eSenseVelocityThreshold) {
        switch(z.sign) {
          case 1: dirCb(Direction.up); break;
          case -1: dirCb(Direction.down); break;
        }
      } else if (z.abs() > MyControls.eSenseVelocityThreshold) {
        switch(y.sign) {
          case 1: dirCb(Direction.left); break;
          case -1: dirCb(Direction.right); break;
        }
      }
    }
}