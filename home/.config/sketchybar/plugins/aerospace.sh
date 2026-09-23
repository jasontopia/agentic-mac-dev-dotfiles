#!/usr/bin/env bash
# Highlights the workspace pill AeroSpace just moved focus to.
#
# $1 is the workspace this item stands for, baked in when sketchybarrc created
# it. $FOCUSED_WORKSPACE arrives with the aerospace_workspace_change event that
# aerospace.toml's exec-on-workspace-change fires.
source "$CONFIG_DIR/colors.sh"

if [ "$1" = "$FOCUSED_WORKSPACE" ]; then
	sketchybar --set "$NAME" background.drawing=on label.color="$BASE"
else
	sketchybar --set "$NAME" background.drawing=off label.color="$MUTED"
fi
