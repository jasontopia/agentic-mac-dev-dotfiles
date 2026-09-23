#!/usr/bin/env bash
# The bar's palette, in one place because sketchybarrc paints the initial state
# and the plugins repaint it later - two copies of these hex values would drift.
# Format is 0xAARRGGBB.

# The bar itself: rose-pine moon base at 0.8 alpha (0xcc), the same opacity
# WezTerm's window_background_opacity uses, so the bar and the terminal under
# it are the same material. sketchybarrc pairs it with blur_radius.
BAR=0xcc232136

# Everything drawn on the bar is white. The numbers are the content; colour
# coding three of them was decoration that had to be learned.
TEXT=0xffffffff

# The workspace pill. Not white on purpose: bordersrc draws the focus ring in
# this exact Catppuccin blue, and the pill is the same "the keyboard is here"
# signal. Change both or neither.
FOCUS=0xff89b4fa
# The digit inside that pill. White on #89b4fa is a ~1.9:1 contrast ratio and
# goes mushy at 13px, so the number stays dark.
PILL_TEXT=0xff232136
