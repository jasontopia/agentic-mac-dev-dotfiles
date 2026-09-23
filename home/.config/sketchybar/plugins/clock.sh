#!/usr/bin/env bash
# launchd hands the agent a bare environment, so date runs in the C locale and
# the abbreviations stay English regardless of the system region.
sketchybar --set "$NAME" label="$(date '+%a %d %b  %H:%M')"
