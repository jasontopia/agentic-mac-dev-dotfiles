#!/usr/bin/env bash
# The bar shows only the workspace that has focus, so this one item is the
# whole left side.
#
# $FOCUSED_WORKSPACE arrives with the aerospace_workspace_change event that
# aerospace.toml's exec-on-workspace-change fires. On the item's first run
# nothing has fired yet, so ask AeroSpace directly.
WS="$FOCUSED_WORKSPACE"
[ -n "$WS" ] || WS=$(aerospace list-workspaces --focused 2>/dev/null)

if [ -n "$WS" ]; then
	sketchybar --set "$NAME" label="$WS" drawing=on
else
	# AeroSpace is not running. An empty blue pill would claim a focus that does
	# not exist, so draw nothing at all.
	sketchybar --set "$NAME" drawing=off
fi
