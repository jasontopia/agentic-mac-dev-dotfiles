#!/usr/bin/env bash
# Memory used the way Activity Monitor counts it: active + wired + compressed
# against hw.memsize. "Pages free" on its own reads ~95% used on any Mac that
# has been awake a while - true, and useless to glance at.
#
# sysctl lives in /usr/sbin, which is not on the launchd agent's PATH.
# Calling it absolutely rather than widening that PATH keeps this file
# live-editable: everything under home/ is supposed to take effect on
# `sketchybar --reload`, with no rebuild.
USED=$(vm_stat | awk -v total="$(/usr/sbin/sysctl -n hw.memsize)" '
	/page size of/           { for (i = 1; i <= NF; i++) if ($i == "of") { ps = $(i + 1); break } }
	/Pages active/           { gsub(/\./, ""); active = $3 }
	/Pages wired down/       { gsub(/\./, ""); wired  = $4 }
	/occupied by compressor/ { gsub(/\./, ""); comp   = $5 }
	END { if (total > 0 && ps > 0) printf "%d", ((active + wired + comp) * ps) * 100 / total }')

sketchybar --set "$NAME" label="${USED:-?}%"
