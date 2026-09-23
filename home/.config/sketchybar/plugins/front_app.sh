#!/usr/bin/env bash
# $INFO is the new frontmost app's name, handed over by front_app_switched.
# It is empty on the item's own first run, before any switch has happened.
[ -n "$INFO" ] && sketchybar --set "$NAME" label="$INFO"
