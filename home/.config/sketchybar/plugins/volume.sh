#!/usr/bin/env bash
# $INFO is the new output volume, 0-100, from sketchybar's volume_change event.
# It is empty on the item's first run - nothing has changed yet - so fall back
# to asking CoreAudio once at startup.
VOLUME="$INFO"
[ -n "$VOLUME" ] || VOLUME=$(osascript -e 'output volume of (get volume settings)' 2>/dev/null)
# osascript answers "missing value" when no output device is available.
case "$VOLUME" in
	''|*[!0-9]*) sketchybar --set "$NAME" icon="" label="--" ; exit 0 ;;
esac

if [ "$VOLUME" -eq 0 ]; then
	ICON=""
elif [ "$VOLUME" -lt 50 ]; then
	ICON=""
else
	ICON=""
fi

sketchybar --set "$NAME" icon="$ICON" label="$VOLUME%"
