#!/usr/bin/env bash
# top's first sample is cumulative since boot; only the second one describes
# now. -s 0 keeps the pair under 0.2s, which is what makes a 3s update_freq
# affordable.
USAGE=$(top -l 2 -n 0 -s 0 | awk '
	/^CPU usage/ { gsub(/%/, ""); idle = $7 }
	END { if (idle != "") printf "%d", 100 - idle }')

sketchybar --set "$NAME" label="${USAGE:-?}%"
