#!/usr/bin/env bash
# The bar's palette, in one place because sketchybarrc paints the initial state
# and the plugins repaint it later - two copies of these hex values would drift.
#
# rose-pine moon, the same scheme WezTerm and Neovim use, so the bar reads as
# the top edge of the same surface rather than a separate piece of chrome.
# Format is 0xAARRGGBB.

BASE=0xff232136     # base - the bar itself, and text on a filled pill
TEXT=0xffe0def4     # text
MUTED=0xff6e6a86    # muted - workspaces that do not have focus
FOAM=0xff9ccfd8     # foam - front app
GOLD=0xfff6c177     # gold - clock
IRIS=0xffc4a7e7     # iris - volume

# The one colour that is not rose-pine: bordersrc draws the focus ring in
# Catppuccin blue, and this is the same "the keyboard is here" signal, so it
# has to be the same colour. Change both or neither.
FOCUS=0xff89b4fa
