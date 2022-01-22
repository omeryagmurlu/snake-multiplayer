import 'package:flutter/material.dart';
import 'package:mobile/components/window.dart';
import 'package:mobile/stores/settings.dart';
import 'package:mobile/theme.dart';

const _esenseWarning = '\nWARNING: you need an e-sense device for this mode. pair and connect to your device in bluetooth settings beforehand.';

extension NameAndDesc on ControlTypes {
  String getName() {
    switch (this) {
      case ControlTypes.swipe: return 'swipe';
      case ControlTypes.eSenseContinuous: return 'continuous e-sense';
      case ControlTypes.eSenseVelocity: return 'velocity e-sense';
    }
  }

  String getDesc() {
    switch (this) {
      case ControlTypes.swipe: return 'swipe on the screen in four directions to change direction';
      case ControlTypes.eSenseContinuous: return 'tilt your head to change direction, head yaw and roll is used to provide the direction data' + _esenseWarning;
      case ControlTypes.eSenseVelocity: return 'tilt your head to change direction, the > velocity < of head yaw and roll is used to provide the direction data' + _esenseWarning;
    }
  }
}

class Controls extends StatefulWidget {
  const Controls({ Key? key }) : super(key: key);

  @override
  _ControlsState createState() => _ControlsState();
}

class _ControlsState extends State<Controls> {
  @override
  Widget build(BuildContext context) {
    final ControlTypes control = MyControls.getControl();

    List<Widget> add = [];
    switch (control) {
      case ControlTypes.eSenseContinuous:
      case ControlTypes.eSenseVelocity:
        add.add(TextFormField(
          initialValue: MyControls.getESenseName(),
          decoration: const InputDecoration(
            labelText: 'e-sense name',
          ),
          onChanged: (value) {
            MyControls.setESenseName(value);
            setState(() {});
          },
        ));
        break;
      case ControlTypes.swipe:
        break;
    }
    switch (control) {
      case ControlTypes.eSenseContinuous:
        add.add(TextFormField(
          initialValue: MyControls.getESenseContinuousThreshold().toString(),
          decoration: const InputDecoration(
            labelText: 'threshold (don\'t touch if you aren\'t sure)',
          ),
          onChanged: (value) {
            MyControls.setESenseContinuousThreshold(value == '' ? 0 : int.parse(value));
            setState(() {});
          },
          keyboardType: TextInputType.number,
        ));
        break;
      case ControlTypes.eSenseVelocity:
        add.add(TextFormField(
          initialValue: MyControls.getESenseVelocityThreshold().toString(),
          decoration: const InputDecoration(
            labelText: 'threshold (don\'t touch if you aren\'t sure)',
          ),
          onChanged: (value) {
            MyControls.setESenseVelocityThreshold(value == '' ? 0 : int.parse(value));
            setState(() {});
          },
          keyboardType: TextInputType.number,
        ));
        break;
      case ControlTypes.swipe:
        break;
    }

    return Window(
      title: "controls",
      children: [
        Text("selected: ${control.getName()}"),
        const Text(''),
        Text(control.getDesc()),
        const Text(''),
        const Text('available controls:'),
        Wrap(
          direction: Axis.horizontal,
          runSpacing: Stylesheet.gap,
          spacing: Stylesheet.gap,
          children: ControlTypes.values.map((e) => ElevatedButton(onPressed: () {
            MyControls.set(e);
            setState(() {}); // yeah, whatever
          }, child: Text(e.getName()))).toList(),
        ),
        ...add
      ],
    );
  }
}