#!/usr/bin/env bash
# Encode a screen recording for the site: 720p H.264, CRF 28, faststart (progressive playback).
# usage: scripts/encode-video.sh input.mov public/videos/demo.mp4
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <input> <output.mp4>" >&2
  exit 1
fi

command -v ffmpeg >/dev/null || { echo "ffmpeg is required (https://ffmpeg.org)" >&2; exit 1; }

ffmpeg -y -i "$1" \
  -vf "scale=-2:720" \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 96k \
  -movflags +faststart \
  "$2"

size=$(stat -c%s "$2" 2>/dev/null || stat -f%z "$2")
echo "wrote $2 ($((size / 1024 / 1024)) MiB) — budget is 15 MiB per file"
