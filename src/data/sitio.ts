// Contenido del sitio en un solo lugar. Sale del Instagram de Sinergia Home (@sinergiahome).
// DEMO: textos de servicios a validar con la empresa antes de publicar.

export const empresa = {
  nombre: 'Sinergia Home',
  bajada: 'Venta e instalación',
  base: 'Trelew, Chubut',
  instagram: 'https://www.instagram.com/sinergiahome/',
  usuarioInstagram: '@sinergiahome',
  // Número en formato internacional sin "+" (ej. 5492804123456). Vacío = los botones abren un mensaje por Instagram
  whatsapp: '',
};

export const enlaceInstagramDM = 'https://ig.me/m/sinergiahome';

export const enlaceContacto = (texto = 'Hola Sinergia Home! Quiero hacer una consulta.') =>
  empresa.whatsapp ? `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(texto)}` : enlaceInstagramDM;

export const cobertura = [
  { ciudad: 'Trelew', detalle: 'Nuestra base' },
  { ciudad: 'Rawson y Playa Unión', detalle: 'Obras residenciales' },
  { ciudad: 'Esquel', detalle: 'Cordillera' },
  { ciudad: 'Bariloche', detalle: 'Río Negro' },
];

export type Servicio = {
  slug: string;
  nombre: string;
  icono: string;
  resumen: string;
  descripcion: string;
  incluye: string[];
  ideal: string;
};

export const servicios: Servicio[] = [
  {
    slug: 'domotica',
    nombre: 'Domótica',
    icono: 'casa',
    resumen: 'Luces, persianas, climatización y escenas controladas desde el celular o por voz.',
    descripcion:
      'Convertimos tu casa en una casa inteligente: automatizamos iluminación, persianas, climatización y equipos para que los controles desde el celular, con la voz o con escenas programadas.',
    incluye: ['Iluminación y escenas', 'Persianas y cortinas motorizadas', 'Control por app y asistentes de voz', 'Teclas y tomas de diseño (línea italiana Vimar)'],
    ideal: 'Casas nuevas, remodelaciones y desarrollos inmobiliarios.',
  },
  {
    slug: 'camaras',
    nombre: 'Cámaras de seguridad',
    icono: 'camara',
    resumen: 'Videovigilancia con IA, domos PTZ y monitoreo desde el celular.',
    descripcion:
      'Instalamos sistemas de videovigilancia con análisis por inteligencia artificial: domos PTZ, radares y reconocimiento facial de largo alcance, con acceso desde el celular.',
    incluye: ['Cámaras IP y domos PTZ', 'Análisis con IA y reconocimiento facial', 'Grabación y acceso remoto', 'Radares perimetrales'],
    ideal: 'Casas, comercios, empresas y obras.',
  },
  {
    slug: 'alarmas',
    nombre: 'Alarmas',
    icono: 'escudo',
    resumen: 'Sensores, sirenas y avisos al celular para proteger tu casa o negocio.',
    descripcion: 'Diseñamos e instalamos sistemas de alarma con sensores y avisos al celular, integrables con cámaras y domótica.',
    incluye: ['Sensores de movimiento y apertura', 'Sirenas y teclados', 'Avisos al celular', 'Integración con cámaras y domótica'],
    ideal: 'Casas, locales y oficinas.',
  },
  {
    slug: 'climatizacion',
    nombre: 'Climatización',
    icono: 'clima',
    resumen: 'Control inteligente de la temperatura, con horarios y desde cualquier lugar.',
    descripcion: 'Automatizamos la climatización para que tu casa esté a la temperatura justa cuando llegás, con horarios y control remoto.',
    incluye: ['Control desde el celular', 'Horarios y escenas', 'Integración con domótica'],
    ideal: 'Casas y espacios de trabajo.',
  },
  {
    slug: 'audio-y-video',
    nombre: 'Audio y video',
    icono: 'audio',
    resumen: 'Sonido multiambiente, cine en casa y salas de videoconferencia.',
    descripcion: 'Instalamos audio multiambiente, cine en casa y salas de videoconferencia profesionales, como sistemas Crestron.',
    incluye: ['Audio multiambiente', 'Cine en casa', 'Salas de videoconferencia (Crestron)'],
    ideal: 'Casas, oficinas y salas de reunión.',
  },
  {
    slug: 'porteria',
    nombre: 'Portería',
    icono: 'porteria',
    resumen: 'Porteros y videoporteros para ver y atender quién toca desde el celular.',
    descripcion: 'Instalamos porteros y videoporteros para casas y edificios, con atención desde el celular.',
    incluye: ['Videoporteros', 'Atención desde el celular', 'Integración con cerraduras'],
    ideal: 'Casas, edificios y complejos.',
  },
  {
    slug: 'redes-wifi',
    nombre: 'Redes WiFi',
    icono: 'wifi',
    resumen: 'WiFi que llega a toda la casa, sin cortes y con cableado prolijo.',
    descripcion: 'Diseñamos redes cableadas y WiFi para que haya buena señal en todos los ambientes, base de cualquier casa inteligente.',
    incluye: ['Relevamiento de cobertura', 'Redes mesh y puntos de acceso', 'Cableado estructurado y racks'],
    ideal: 'Casas grandes, oficinas y comercios.',
  },
  {
    slug: 'cerraduras',
    nombre: 'Cerraduras inteligentes',
    icono: 'candado',
    resumen: 'Abrí con huella, código o desde el celular, y sabé quién entró.',
    descripcion: 'Instalamos cerraduras inteligentes con huella, código o app, ideales también para alquileres temporarios.',
    incluye: ['Apertura por huella, código o app', 'Accesos temporales', 'Registro de entradas'],
    ideal: 'Casas, oficinas y alquileres temporarios.',
  },
];

// Obras y novedades: sacadas de sus publicaciones
export const casos = [
  { titulo: 'Automatización con Generac', texto: 'Puesta en marcha y automatización de un grupo electrógeno Generac.', etiqueta: 'Energía' },
  { titulo: 'Sala de videoconferencia Crestron', texto: 'Sistema de videoconferencia profesional para reuniones.', etiqueta: 'Audio y video' },
  { titulo: 'Seguridad con IA', texto: 'Radares, domos PTZ y reconocimiento facial a 150 metros.', etiqueta: 'Cámaras' },
  { titulo: 'Línea italiana Vimar', texto: 'Teclas y tomas de diseño para proyectos de arquitectura.', etiqueta: 'Domótica' },
];

export const marcas = ['Crestron', 'Vimar', 'Generac', 'Google Home'];

export const pasos = [
  { titulo: 'Relevamiento', texto: 'Visitamos el lugar y escuchamos qué necesitás.' },
  { titulo: 'Propuesta', texto: 'Te presentamos una solución a medida con presupuesto.' },
  { titulo: 'Instalación', texto: 'Instalamos y configuramos todo, con terminaciones prolijas.' },
  { titulo: 'Soporte', texto: 'Te enseñamos a usarlo y te acompañamos después.' },
];

export const preguntas = [
  {
    pregunta: '¿Se puede automatizar una casa que ya está construida?',
    respuesta: 'Sí. Hay soluciones inalámbricas que se instalan sin romper paredes; en obra nueva o remodelación se puede planificar desde el inicio.',
  },
  {
    pregunta: '¿Puedo ver las cámaras desde el celular?',
    respuesta: 'Sí. Todos los sistemas que instalamos se pueden ver y controlar desde el celular, estés donde estés.',
  },
  {
    pregunta: '¿Trabajan fuera de Trelew?',
    respuesta: 'Sí. Tenemos base en Trelew e hicimos obras en Rawson, Playa Unión, Esquel y Bariloche. Consultanos por tu zona.',
  },
  {
    pregunta: '¿Trabajan con arquitectos y desarrolladores?',
    respuesta: 'Sí. Acompañamos proyectos desde el plano: preinstalación, cableado, línea de teclas de diseño e integración de sistemas.',
  },
];
