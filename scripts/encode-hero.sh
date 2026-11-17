#!/usr/bin/env bash
# Video de portada en máxima calidad para web, sin audio y con arranque inmediato.
# Uso: scripts/encode-hero.sh video.mp4 [inicio_seg] [duracion_seg] [segundo_del_poster]
#
# Genera en public/video/:
#   hero-1080.webm / hero-1080.mp4  pantallas grandes (>=1280px). Si el original es 720p se reescala con
#                                   lanczos + limpieza leve de compresión + enfoque suave: se ve más nítido
#                                   que dejar que el navegador estire un 720p.
#   hero-720.webm  / hero-720.mp4   notebooks y tablets.
#   hero-mobile.mp4                 celulares (540p, liviano).
#   hero-poster.jpg                 primer cuadro visible mientras carga.
# Cuadros por segundo: los del original, sin interpolar (interpolar genera artefactos en cortes rápidos).
set -euo pipefail
IN="${1:?Pasá el video original}"; SS="${2:-0}"; DUR="${3:-12}"; POSTER_AT="${4:-2}"
OUT="$(dirname "$0")/../public/video"; mkdir -p "$OUT"
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$IN")
SRC_H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$IN")
COMMON=(-hide_banner -loglevel error -y -ss "$SS" -t "$DUR" -i "$IN" -an -map_metadata -1)
CLEAN="hqdn3d=1.2:1.2:2.5:2.5"   # saca el ruido de bloques del original sin lavar la imagen
vf() { # ancho alto [enfoque]
  local f="$CLEAN,scale=$1:$2:force_original_aspect_ratio=increase:flags=lanczos+accurate_rnd+full_chroma_int,crop=$1:$2"
  [ "${3:-}" = "sharp" ] && f="$f,unsharp=5:5:0.55:5:5:0"
  echo "$f,fps=$FPS,format=yuv420p"
}
x264() { ffmpeg "${COMMON[@]}" -vf "$1" -c:v libx264 -preset veryslow -tune film -crf "$2" -maxrate "$3" -bufsize "$4" -profile:v high -pix_fmt yuv420p -g 50 -movflags +faststart "$5"; }
vp9() {
  ffmpeg "${COMMON[@]}" -vf "$1" -c:v libvpx-vp9 -b:v 0 -crf "$2" -row-mt 1 -tile-columns 2 -deadline good -cpu-used 0 -auto-alt-ref 1 -lag-in-frames 25 -g 50 -pass 1 -passlogfile "$OUT/.vp9" -f null /dev/null
  ffmpeg "${COMMON[@]}" -vf "$1" -c:v libvpx-vp9 -b:v 0 -crf "$2" -row-mt 1 -tile-columns 2 -deadline good -cpu-used 0 -auto-alt-ref 1 -lag-in-frames 25 -g 50 -pass 2 -passlogfile "$OUT/.vp9" "$3"
  rm -f "$OUT"/.vp9*
}
SHARP=$([ "$SRC_H" -lt 1080 ] && echo sharp || echo "")
x264 "$(vf 1920 1080 $SHARP)" 18 9M 18M "$OUT/hero-1080.mp4"
vp9  "$(vf 1920 1080 $SHARP)" 24 "$OUT/hero-1080.webm"
x264 "$(vf 1280 720)" 19 5M 10M "$OUT/hero-720.mp4"
vp9  "$(vf 1280 720)" 26 "$OUT/hero-720.webm"
x264 "$(vf 960 540)" 22 2M 4M "$OUT/hero-mobile.mp4"
ffmpeg -hide_banner -loglevel error -y -ss "$(echo "$SS + $POSTER_AT" | bc)" -i "$IN" -frames:v 1 -update 1 -vf "$(vf 1920 1080 $SHARP)" -q:v 2 "$OUT/hero-poster.jpg"
ls -lh "$OUT"/hero*
