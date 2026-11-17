// Contenido editable del sitio.

export const marca = {
  nombre: 'Blito Producciones',
  ciudad: 'Buenos Aires',
  pais: 'AR',
  /** Datos del titular para los términos. Completar antes de vender. */
  titular: process.env.LEGAL_TITULAR ?? '',
  cuit: process.env.LEGAL_CUIT ?? '',
  /** Mail de contacto legal (LEGAL_EMAIL). Si falta, los legales remiten a WhatsApp. */
  email: process.env.LEGAL_EMAIL ?? '',
};

export const contacto = {
  whatsapp: '+54 9 11 3589-6893',
  whatsappUrl: 'https://wa.me/5491135896893',
  igSello: 'https://www.instagram.com/blitoproducciones/',
  igBlito: 'https://www.instagram.com/blitormx/',
  youtube: 'https://www.youtube.com/@blitormx',
  taplink: 'https://taplink.cc/blitormx',
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
  /** 'venta' se cobra con Mercado Pago si el servidor tiene credenciales y archivo (ver README). */
  estado: 'venta' | 'proximamente';
  /** Preview de audio opcional: un mp3 en public/audio/. Si no hay, no se muestra el reproductor. */
  demo?: string;
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
    estado: 'venta',
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
    estado: 'venta',
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
    estado: 'proximamente',
  },
];

export const servicios = [
  { titulo: 'Beats a medida', texto: 'RKT, trap y drill hechos para tu voz, no sacados de un pack. Arrancamos desde una referencia o desde cero.' },
  { titulo: 'Grabación y mezcla', texto: 'Sesiones en el estudio con ingeniero. Te llevás el tema mezclado y masterizado, listo para subir.' },
  { titulo: 'Sello y lanzamiento', texto: 'Distribución a plataformas, fecha de salida, portada y video. Nos ocupamos de que el tema salga bien.' },
  { titulo: 'Desarrollo de artistas', texto: 'Si estás empezando, armamos el plan: qué sacar primero, con quién y cómo mostrarlo.' },
];

export const totalSonidos = (k: Kit) => k.contenido.reduce((n, c) => n + c.cantidad, 0);
const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const ars = (n: number) => pesos.format(n);

// ---------- Producción ----------
// Textos de la página /produccion. La mensualidad no muestra precio: se cotiza por formulario.

export const produccion = {
  servicios: [
    {
      id: 'beat',
      titulo: 'Beat a medida',
      texto: 'Un beat hecho para tu voz y tu tema, no sacado de un pack. Arrancamos desde una referencia o desde cero y lo ajustamos hasta que quede.',
      incluye: ['Beat exclusivo', 'Cambios hasta que quede', 'Stems para grabar y mezclar'],
    },
    {
      id: 'produccion',
      titulo: 'Producción completa',
      texto: 'Del beat al tema terminado: grabación en el estudio, dirección de voz, mezcla y master. Salís con el tema listo para subir.',
      incluye: ['Beat exclusivo', 'Sesión de grabación', 'Mezcla y master'],
    },
    {
      id: 'mezcla',
      titulo: 'Mezcla y master',
      texto: 'Si ya grabaste, nos mandás las pistas y te devolvemos el tema mezclado y masterizado para plataformas.',
      incluye: ['Mezcla de voces y beat', 'Master para plataformas', 'Una ronda de cambios'],
    },
  ],
  mensualidad: {
    titulo: 'Mensualidad con Blito',
    bajada: 'Acompañamiento personalizado, mes a mes, para artistas que quieren crecer con un plan y no tema por tema.',
    incluye: [
      'Sesiones uno a uno con Blito, en el estudio o por videollamada',
      'Devolución de cada tema o maqueta que mandes en el mes',
      'Producción de tus temas con prioridad en la agenda',
      'Plan de lanzamientos: qué sacar, cuándo y cómo mostrarlo',
      'Contacto directo por WhatsApp durante todo el mes',
    ],
    para: ['Artistas que están arrancando y quieren hacerlo bien desde el principio', 'Artistas que ya sacan temas y quieren dar el salto'],
  },
  proceso: [
    { titulo: 'Contanos tu idea', texto: 'Completás el formulario con lo que buscás, tu Instagram y algún tema de referencia.' },
    { titulo: 'Te mandamos una propuesta', texto: 'Blito escucha lo que mandaste y te escribe con una propuesta y el valor.' },
    { titulo: 'Arrancamos', texto: 'Agendamos la primera sesión y empezamos a trabajar en tu tema.' },
  ],
  faq: [
    { q: '¿Tengo que estar en Buenos Aires?', a: 'No. La grabación es en el estudio, pero las sesiones de la mensualidad, los beats y las mezclas se pueden hacer a distancia.' },
    { q: '¿Cuánto sale?', a: 'Depende de lo que necesites. Completá el formulario y te mandamos una propuesta con el valor, sin compromiso.' },
    { q: '¿Los beats son exclusivos?', a: 'Sí. Un beat a medida es solo para vos: no se vende a nadie más.' },
    { q: '¿Puedo cancelar la mensualidad?', a: 'Sí. Es mes a mes: si un mes no la necesitás, no la renovás.' },
  ],
};

export const intereses = [
  { id: 'mensualidad', label: 'Mensualidad con acompañamiento' },
  { id: 'beat', label: 'Beat a medida' },
  { id: 'produccion', label: 'Producción completa' },
  { id: 'mezcla', label: 'Mezcla y master' },
  { id: 'otro', label: 'Otra cosa' },
] as const;

export const waLink = (texto: string) => `${contacto.whatsappUrl}?text=${encodeURIComponent(texto)}`;

// ---------- Tienda ----------
export const tienda = {
  formato: 'WAV',
  daws: ['FL Studio', 'Ableton Live', 'Logic Pro', 'Studio One', 'Reaper', 'Cubase'],
  licencia: {
    podes: [
      'Usar los sonidos en tus temas, beats y producciones',
      'Publicar y monetizar esos temas en plataformas y redes',
      'Vender beats hechos con los sonidos',
    ],
    noPodes: [
      'Revender o compartir los sonidos sueltos',
      'Meterlos en otro kit, librería o banco de sonidos',
    ],
  },
  pasos: [
    { titulo: 'Elegís el kit', texto: 'Escuchás la descripción, mirás qué trae y lo agregás.' },
    { titulo: 'Pagás con Mercado Pago', texto: 'Con tarjeta, débito o dinero en cuenta. No vemos tus datos de pago.' },
    { titulo: 'Te llega al mail', texto: 'Apenas se acredita el pago te mandamos el link de descarga.' },
  ],
  faq: [
    { q: '¿Cómo lo recibo?', a: 'Después de pagar te llega un mail con el link de descarga. Es un .zip con todos los sonidos en WAV. El link dura 7 días.' },
    { q: '¿Puedo usarlo en temas que publico?', a: 'Sí. Podés usar los sonidos en tus temas y beats, publicarlos y monetizarlos sin pagar regalías. Lo que no podés es revender los sonidos sueltos.' },
    { q: '¿Funciona en mi programa?', a: 'Sí. Son archivos WAV: funcionan en FL Studio, Ableton, Logic, Studio One, Reaper y cualquier programa de producción.' },
    { q: 'Perdí el mail de descarga', a: 'Entrá a "Recuperar mis compras", poné el mail con el que compraste y te reenviamos los links.' },
    { q: '¿Me puedo arrepentir de la compra?', a: 'Tenés 10 días corridos desde la compra para pedirlo con el Botón de arrepentimiento, al pie de cualquier página.' },
  ],
};
