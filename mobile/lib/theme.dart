// this is the implementation of ThemeData.from constructor. I needed to some other  
import 'package:flutter/material.dart';

const double em = 16;

class Stylesheet {
  static const colorGreen = Color(0xFF9bbc0f);
  static const windowMinSize = 270;
  static const windowPad = 2 * em;
  static const gap = 0.25 * em;
}

theme() {
  const colorScheme = ColorScheme(
    primary: Stylesheet.colorGreen,
    primaryVariant: Stylesheet.colorGreen,
    secondary: Stylesheet.colorGreen,
    secondaryVariant: Stylesheet.colorGreen,
    surface: Colors.black,
    background: Colors.black,
    error: Colors.orange,
    onPrimary: Colors.black,
    onSecondary: Colors.black,
    onSurface: Colors.white,
    onBackground: Colors.white,
    onError: Colors.white,
    brightness: Brightness.dark,
  );
  const textTheme = TextTheme(
    headline1 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize: 2.25 * em, fontWeight: FontWeight.bold),
    headline2 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:  1.5 * em, fontWeight: FontWeight.bold),
    headline3 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:  1.3 * em, fontWeight: FontWeight.bold),
    headline4 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em, fontWeight: FontWeight.bold),
    headline5 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em, fontWeight: FontWeight.bold),
    headline6 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em, fontWeight: FontWeight.bold),
    bodyText1 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em),
    bodyText2 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em),
    subtitle1 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em),
    subtitle2 : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em),
    caption   : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em),
    button    : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em),
    overline  : TextStyle(fontFamily: 'terminalvector', color: Stylesheet.colorGreen, decoration: TextDecoration.none, height: 1.25, fontSize:    1 * em),
  );

  final bool isDark = colorScheme.brightness == Brightness.dark;
  final Color primarySurfaceColor = isDark ? colorScheme.surface : colorScheme.primary;
  final Color onPrimarySurfaceColor = isDark ? colorScheme.onSurface : colorScheme.onPrimary;

  return ThemeData(
    brightness: colorScheme.brightness,
    primaryColor: primarySurfaceColor,
    primaryColorBrightness: ThemeData.estimateBrightnessForColor(primarySurfaceColor),
    canvasColor: colorScheme.background,
    // ignore: deprecated_member_use
    accentColor: colorScheme.secondary,
    // ignore: deprecated_member_use
    accentColorBrightness: ThemeData.estimateBrightnessForColor(colorScheme.secondary),
    scaffoldBackgroundColor: colorScheme.background,
    bottomAppBarColor: colorScheme.surface,
    cardColor: colorScheme.surface,
    dividerColor: colorScheme.onSurface.withOpacity(0.12),
    backgroundColor: colorScheme.background,
    dialogBackgroundColor: colorScheme.background,
    errorColor: colorScheme.error,
    textTheme: textTheme,
    indicatorColor: onPrimarySurfaceColor,
    applyElevationOverlayColor: isDark,
    colorScheme: colorScheme,
    // add after this

    inputDecorationTheme: const InputDecorationTheme(
      isDense: true
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(style: ButtonStyle(
      shape: MaterialStateProperty.all(const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.zero)))
    )),
    toggleableActiveColor: Stylesheet.colorGreen
  );
}