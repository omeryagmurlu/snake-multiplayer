import 'dart:developer';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:mobile/theme.dart';
import 'package:mobile/util.dart';

class _WindowBase extends StatelessWidget {
  const _WindowBase({
    Key? key,
    required this.child,
  }) : super(key: key);

  final Widget child;

  @override
  Widget build(BuildContext context) {
    const pad = Stylesheet.windowPad;
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: pad),
        child: child,
      ),
    );
  }
}

class _VerticalNamedPane extends StatelessWidget {
  const _VerticalNamedPane({
    Key? key,
    required this.children,
    this.title,
  }) : super(key: key);

  final List<Widget> children;
  final String? title;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Expanded(child: Container(), flex: 2),
        // I fucking hate this: http://dart.dev/go/non-promo-property (notice the exclamation mark at the end of title)
        if (title != null) Text(title!.truncateTo(20), style: Theme.of(context).textTheme.headline1),
        // if (title != null) Text(title!, style: Theme.of(context).textTheme.headline1, overflow: TextOverflow.ellipsis),
        // if (title != null) FittedBox(child: Text(title!, style: Theme.of(context).textTheme.headline1)),
        ...children,
        Expanded(child: Container()),
      ],
    );
  }
}

class Window extends StatelessWidget {
  const Window({
    Key? key,
    required this.children,
    this.title,
  }) : super(key: key);

  final List<Widget> children;
  final String? title;

  @override
  Widget build(BuildContext context) {
    return _WindowBase(
      child: Center(
        child:  _VerticalNamedPane(children: children, title: title),
      ),
    );
  }
}

class Window2Pane extends StatelessWidget {
  const Window2Pane({
    Key? key,
    required this.left,
    required this.right,
    this.title,
  }) : super(key: key);

  final List<Widget> left;
  final List<Widget> right;
  final String? title;

  @override
  Widget build(BuildContext context) {
    return _WindowBase(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: _VerticalNamedPane(children: left, title: title),
          ),
          Expanded(
            child: _VerticalNamedPane(children: right),
          )
        ],
      ),
    );
  }
}