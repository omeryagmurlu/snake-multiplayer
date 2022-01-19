import 'package:flutter/material.dart';

extension HexColor on Color {
  /// String is in the format "aabbcc" or "ffaabbcc" with an optional leading "#".
  static Color fromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  /// Prefixes a hash sign if [leadingHashSign] is set to `true` (default is `true`).
  String toHex({bool leadingHashSign = true}) => '${leadingHashSign ? '#' : ''}'
      '${alpha.toRadixString(16).padLeft(2, '0')}'
      '${red.toRadixString(16).padLeft(2, '0')}'
      '${green.toRadixString(16).padLeft(2, '0')}'
      '${blue.toRadixString(16).padLeft(2, '0')}';
}

class ColorPicker extends StatelessWidget {
  static const colors = [ // Apple Macintosh default 16-color palette
    '#FFFFFF',
    '#1FB714',
    '#FBF305',
    '#006412',
    '#FF6403',
    '#562C05',
    '#DD0907',
    '#90713A',
    '#F20884',
    '#C0C0C0',
    '#4700A5',
    '#808080',
    '#0000D3',
    '#404040',
    '#02ABEA',
    '#000000',
  ];
  final Function(String) onColor;
  const ColorPicker({ Key? key, required this.onColor}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 100,
      child: GridView.count(
        shrinkWrap: true,
        crossAxisCount: 4,
        children: colors.map((e) => TextButton(
          onPressed: () => onColor(e),
          child: const Text(''),
          style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all(HexColor.fromHex(e)),
            shape: MaterialStateProperty.all(const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.zero)))
          ),
        )).toList(),
      ),
    );
  }
}