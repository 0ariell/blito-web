#!/usr/bin/env bash
# Prepara el video de portada para web: sin audio, arranque inmediato, liviano y sin escalar por encima del original.
# Uso: scripts/encode-hero.sh video.mp4 [inicio_seg] [duracion_seg] [segundo_del_poster]
# Salida en public/video/: hero.webm (VP9/AV1), hero.mp4 (H.264), hero-mobile.mp4 (H.264 liviano), hero-poster.jpg
set -euo pipefail
IN="${1:?Pasá el video original}"; SS="${2:-0}"; DUR="${3:-12}"; POSTER_AT="${4:-2}"
OUT="$(dirname "$0")/../public/video"; mkdir -p "$OUT"
SRC_H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$IN")
H=$(( SRC_H < 1080 ? SRC_H : 1080 )); W=$(( H * 16 / 9 ))
MH=$(( H < 540 ? H : 540 )); MW=$(( MH * 16 / 9 ))
vf() { echo "scale=$1:$2:force_original_aspect_ratio=increase:flags=lanczos,crop=$1:$2,fps=25,format=yuv420p"; }
COMMON=(-hide_banner -loglevel error -y -ss "$SS" -t "$DUR" -i "$IN" -an -map_metadata -1)

# H.264 (Safari/iOS y todo lo demás). faststart: empieza a reproducir antes de bajar todo.
ffmpeg "${COMMON[@]}" -vf "$(vf $W $H)" -c:v libx264 -preset veryslow -crf 21 -maxrate 4M -bufsize 8M -profile:v high -g 50 -movflags +faststart "$OUT/hero.mp4"
ffmpeg "${COMMON[@]}" -vf "$(vf $MW $MH)" -c:v libx264 -preset veryslow -crf 24 -maxrate 1.5M -bufsize 3M -profile:v main -g 50 -movflags +faststart "$OUT/hero-mobile.mp4"
# WebM para Chrome/Firefox/Edge: AV1 si está disponible, si no VP9 en dos pasadas.
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libsvtav1; then
  ffmpeg "${COMMON[@]}" -vf "$(vf $W $H)" -c:v libsvtav1 -preset 4 -crf 32 -g 50 "$OUT/hero.webm"
else
  ffmpeg "${COMMON[@]}" -vf "$(vf $W $H)" -c:v libvpx-vp9 -b:v 0 -crf 31 -row-mt 1 -deadline good -cpu-used 1 -g 50 -pass 1 -f null /dev/null
  ffmpeg "${COMMON[@]}" -vf "$(vf $W $H)" -c:v libvpx-vp9 -b:v 0 -crf 31 -row-mt 1 -deadline good -cpu-used 1 -g 50 -pass 2 "$OUT/hero.webm"
  rm -f ffmpeg2pass-0.log
fi
# Poster: un cuadro representativo (no el primero, que suele ser negro).
ffmpeg -hide_banner -loglevel error -y -ss "$(echo "$SS + $POSTER_AT" | bc)" -i "$IN" -frames:v 1 -update 1 -vf "$(vf $W $H)" -q:v 3 "$OUT/hero-poster.jpg"
ls -lh "$OUT"/hero*
