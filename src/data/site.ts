// Contenido editable del sitio. Todo lo marcado con `borrador: true` es provisorio
// y hay que confirmarlo con Blito antes de publicar (ver README).

export const contacto = {
  whatsapp: '+54 9 11 3589-6893',
  whatsappUrl: 'https://wa.me/5491135896893',
  igSello: 'https://www.instagram.com/blitoproducciones/',
  igBlito: 'https://www.instagram.com/blitormx/',
  youtube: 'https://www.youtube.com/@blitormx',
  taplink: 'https://taplink.cc/blitormx',
};

/**
 * Video de portada. Generalo con `scripts/encode-hero.sh <video-original>`:
 * deja los archivos en public/video/ y acá solo hay que poner `activo: true`.
 */
export const hero = {
  activo: false,
  mp4_1080: '/video/hero-1080.mp4',
  mp4_720: '/video/hero-720.mp4',
  webm_1080: '/video/hero-1080.webm',
  poster: '/video/hero-poster.jpg',
};

export type Lanzamiento = {
  tema: string;
  artistas: string;
  tipo: 'produccion' | 'remix';
  img: string; // archivo en src/assets/img
  youtube?: string;
  spotify?: string;
  anio?: string;
};

// Solo temas verificados en YouTube o Spotify. El orden es el de la grilla.
export const lanzamientos: Lanzamiento[] = [
  { tema: 'Llegamos Pa La Clande (Remix)', artistas: 'LebrondFloyd, Doble P', tipo: 'produccion', img: 'yt-mfNvetRI2Lk.jpg', youtube: 'mfNvetRI2Lk' },
  { tema: 'Bye Bye (Remix)', artistas: 'Blito RMX, LUCCA.369, HDR, Medinas, Markitos Salas, DJ Alan Daniel', tipo: 'remix', img: 'cover-byebye.jpg', spotify: '5kwaJWHgogWO4wmidASe5v', anio: '2024' },
  { tema: 'why u lying?', artistas: 'Frank', tipo: 'produccion', img: 'yt-Rff469Noqu4.jpg', youtube: 'Rff469Noqu4' },
  { tema: 'Shake me', artistas: 'Frank', tipo: 'produccion', img: 'yt-b9swbKxKzBk.jpg', youtube: 'b9swbKxKzBk' },
  { tema: 'Te Fuiste (Turreo Edit)', artistas: 'Exequiel López, Blito', tipo: 'remix', img: 'yt-2YPJ8nInE4U.jpg', youtube: '2YPJ8nInE4U' },
  { tema: 'RKMIX 2', artistas: 'May Creizy, Blito', tipo: 'remix', img: 'yt-SiqO_O8AjzA.jpg', youtube: 'SiqO_O8AjzA' },
  { tema: 'Titán (Turreo Edit)', artistas: 'Blito RMX', tipo: 'remix', img: 'yt-6ne0XDhjkrs.jpg', youtube: '6ne0XDhjkrs' },
  { tema: 'Mami Tú Estás Loca (Turreo Edit)', artistas: 'Blito RMX', tipo: 'remix', img: 'yt-rpJM2YG3ahw.jpg', youtube: 'rpJM2YG3ahw' },
];

export const artistas = [
  { nombre: 'LebrondFloyd', img: 'yt-mfNvetRI2Lk.jpg', url: 'https://www.youtube.com/@lebrondfloyd' },
  { nombre: 'Doble P', img: 'cover-clande.jpg', url: 'https://www.youtube.com/watch?v=mfNvetRI2Lk' },
  { nombre: 'HDR', img: 'cover-byebye.jpg', url: 'https://open.spotify.com/track/5kwaJWHgogWO4wmidASe5v' },
  { nombre: 'Frank', img: 'frank-set.jpg', url: 'https://www.youtube.com/@Frankpfff' },
  { nombre: 'May Creizy', img: 'yt-SiqO_O8AjzA.jpg', url: 'https://www.youtube.com/watch?v=SiqO_O8AjzA' },
  { nombre: 'Exequiel López', img: 'yt-2YPJ8nInE4U.jpg', url: 'https://www.youtube.com/watch?v=2YPJ8nInE4U' },
  { nombre: 'LUCCA.369', img: 'cover-byebye.jpg', url: 'https://open.spotify.com/track/5kwaJWHgogWO4wmidASe5v' },
  { nombre: 'Medinas', img: 'cover-byebye.jpg', url: 'https://open.spotify.com/track/5kwaJWHgogWO4wmidASe5v' },
];

export type Kit = {
  slug: string;
  nombre: string;
  vol: string;
  bajada: string;
  descripcion: string;
  contenido: { item: string; cantidad: number }[];
  generos: string[];
  precioArs: number;
  precioUsd: number;
  estado: 'venta' | 'proximamente';
  /** Link de pago (Mercado Pago, Lemon Squeezy, etc.). Sin link, el botón anota en la lista de espera. */
  comprarUrl?: string;
  borrador: true;
};

export const kits: Kit[] = [
  {
    slug: 'cabina-vol-1',
    nombre: 'Cabina',
    vol: '01',
    bajada: 'El drum kit con el que salen los temas del estudio.',
    descripcion:
      'Kicks, snares y percusión sacados de las sesiones de Blito, mezclados y listos para arrastrar al proyecto. Pensado para RKT, trap y drill: suena fuerte sin tocar nada.',
    contenido: [
      { item: 'Kicks', cantidad: 40 },
      { item: 'Snares y claps', cantidad: 45 },
      { item: 'Hi-hats y percs', cantidad: 60 },
      { item: '808s', cantidad: 25 },
      { item: 'Loops de batería', cantidad: 30 },
    ],
    generos: ['RKT', 'Trap', 'Drill'],
    precioArs: 18000,
    precioUsd: 15,
    estado: 'venta',
    borrador: true,
  },
  {
    slug: 'turreo-edits',
    nombre: 'Turreo Edits',
    vol: '02',
    bajada: 'Todo para armar un turreo edit en una tarde.',
    descripcion:
      'Las transiciones, subidas, cortes y voces que Blito usa en sus Turreo Edits. Para DJs y productores que remixan en vivo o en estudio.',
    contenido: [
      { item: 'Transiciones y risers', cantidad: 35 },
      { item: 'Drops y cortes', cantidad: 30 },
      { item: 'Vocal chops', cantidad: 40 },
      { item: 'Loops de dembow', cantidad: 25 },
    ],
    generos: ['Turreo', 'RKT', 'Cumbia'],
    precioArs: 14000,
    precioUsd: 12,
    estado: 'venta',
    borrador: true,
  },
  {
    slug: 'clande-vol-1',
    nombre: 'Clande',
    vol: '03',
    bajada: 'Melodías oscuras para trap de noche.',
    descripcion:
      'Loops melódicos, pads y one-shots grabados en el estudio. Cada loop viene con su tonalidad y BPM en el nombre del archivo.',
    contenido: [
      { item: 'Loops melódicos', cantidad: 50 },
      { item: 'One-shots', cantidad: 80 },
      { item: 'Pads y texturas', cantidad: 20 },
    ],
    generos: ['Trap', 'Drill'],
    precioArs: 16000,
    precioUsd: 13,
    estado: 'proximamente',
    borrador: true,
  },
];

export const servicios = [
  { titulo: 'Beats a medida', texto: 'RKT, trap y drill hechos para tu voz, no sacados de un pack. Arrancamos desde una referencia o desde cero.' },
  { titulo: 'Grabación y mezcla', texto: 'Sesiones en el estudio con ingeniero. Te llevás el tema mezclado y masterizado, listo para subir.' },
  { titulo: 'Sello y lanzamiento', texto: 'Distribución a plataformas, fecha de salida, portada y video. Nos ocupamos de que el tema salga bien.' },
  { titulo: 'Desarrollo de artistas', texto: 'Si estás empezando, armamos el plan: qué sacar primero, con quién y cómo mostrarlo.' },
];

export const totalSonidos = (k: Kit) => k.contenido.reduce((n, c) => n + c.cantidad, 0);
export const ars = (n: number) => '$' + n.toLocaleString('es-AR');
