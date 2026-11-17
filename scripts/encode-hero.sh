#!/usr/bin/env bash
# Prepara el video de portada para web: sin audio, arranque rápido y liviano.
# Uso: scripts/encode-hero.sh ruta/al/video-original.mov [segundo_inicio] [duracion]
# Salida en public/video/: hero-1080.webm (AV1/VP9), hero-1080.mp4 y hero-720.mp4 (H.264), hero-poster.jpg
set -euo pipefail
IN="${1:?Pasá el video original}"; SS="${2:-0}"; DUR="${3:-14}"
OUT="$(dirname "$0")/../public/video"; mkdir -p "$OUT"
# Recorte a 16:9 centrado, 30 fps constantes, loop sin salto (fade de 0.4s al final no; mejor elegir un tramo que cierre limpio).
VF_1080="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p"
VF_720="scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30,format=yuv420p"
COMMON=(-hide_banner -y -ss "$SS" -t "$DUR" -i "$IN" -an)

# H.264: compatible con todo (Safari/iOS incluido). faststart = arranca a reproducir antes de bajar todo.
ffmpeg "${COMMON[@]}" -vf "$VF_1080" -c:v libx264 -preset slow -crf 23 -maxrate 6M -bufsize 12M -profile:v high -g 60 -movflags +faststart "$OUT/hero-1080.mp4"
ffmpeg "${COMMON[@]}" -vf "$VF_720"  -c:v libx264 -preset slow -crf 24 -maxrate 3M -bufsize 6M  -profile:v high -g 60 -movflags +faststart "$OUT/hero-720.mp4"

# AV1 si está disponible (≈40% más liviano a igual calidad); si no, VP9.
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libsvtav1; then
  ffmpeg "${COMMON[@]}" -vf "$VF_1080" -c:v libsvtav1 -preset 6 -crf 34 -g 60 "$OUT/hero-1080.webm"
else
  ffmpeg "${COMMON[@]}" -vf "$VF_1080" -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -deadline good -cpu-used 2 -g 60 "$OUT/hero-1080.webm"
fi

# Poster = primer cuadro, para que no haya pantalla negra mientras carga.
ffmpeg -hide_banner -y -ss "$SS" -i "$IN" -frames:v 1 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -q:v 3 "$OUT/hero-poster.jpg"
ls -lh "$OUT"
echo "Listo. Poné hero.activo = true en src/data/site.ts"
