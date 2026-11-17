// Contenido editable de la maqueta. Los roles marcados con `confirmar: true`
// son supuestos: revisarlos con Blito antes de publicar.

export const contacto = {
  whatsapp: '+54 9 11 3589-6893',
  whatsappUrl: 'https://wa.me/5491135896893',
  igSello: 'https://www.instagram.com/blitoproducciones/',
  igBlito: 'https://www.instagram.com/blitormx/',
  taplink: 'https://taplink.cc/blitormx',
};

export type Credito = {
  tema: string;
  artista: string;
  rol: string;
  anio: string;
  youtube: string; // id del video
  confirmar?: boolean;
};

export const creditos: Credito[] = [
  { tema: 'Llegamos Pa La Clande (Remix)', artista: 'LebrondFloyd, Doble P', rol: 'Producción y sello', anio: '2025', youtube: 'mfNvetRI2Lk', confirmar: true },
  { tema: 'why u lying?', artista: 'Frank', rol: 'Producción', anio: '2026', youtube: 'Rff469Noqu4', confirmar: true },
  { tema: 'Shake me', artista: 'Frank', rol: 'Producción', anio: '2026', youtube: 'b9swbKxKzBk', confirmar: true },
];

export const artistas = [
  { nombre: 'LebrondFloyd', foto: '/img/yt-mfNvetRI2Lk.jpg', url: 'https://www.youtube.com/@lebrondfloyd' },
  { nombre: 'Doble P', foto: '/img/cover-clande.jpg', url: 'https://www.youtube.com/watch?v=mfNvetRI2Lk' },
  { nombre: 'Frank', foto: '/img/frank-set.jpg', url: 'https://www.youtube.com/@Frankpfff' },
];

export const servicios = [
  { titulo: 'Beats a medida', texto: 'Trap, RKT y drill hechos para tu voz, no sacados de un pack. Arrancamos desde una referencia o desde cero.' },
  { titulo: 'Grabación y mezcla', texto: 'Sesiones en el estudio con ingeniero. Te llevás el tema mezclado y masterizado, listo para subir.' },
  { titulo: 'Sello y lanzamiento', texto: 'Distribución a plataformas, fecha de salida, portada y video. Nos ocupamos de que el tema salga bien.' },
  { titulo: 'Desarrollo de artistas', texto: 'Si estás empezando, armamos el plan: qué sacar primero, con quién y cómo mostrarlo.' },
];
