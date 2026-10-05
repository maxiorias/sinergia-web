import fotoCamioneta from '../assets/obras/camioneta.jpg';
import fotoPanel from '../assets/obras/panel-echo-show.jpg';
import fotoCerradura from '../assets/obras/cerradura-biometrica.jpg';
import fotoRack from '../assets/obras/rack.jpg';
import fotoCelular from '../assets/obras/control-celular.jpg';
import fotoCedia from '../assets/obras/cedia-2024.jpg';
import fotoPlano from '../assets/obras/termostato-plano.jpg';
import type { ImageMetadata } from 'astro';

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
  foto?: ImageMetadata;
};

export const servicios: Servicio[] = [
  {
    slug: 'domotica',
    foto: fotoPanel,
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
    foto: fotoCamioneta,
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
    foto: fotoPlano,
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
    foto: fotoPanel,
    nombre: 'Portería',
    icono: 'porteria',
    resumen: 'Porteros y videoporteros para ver y atender quién toca desde el celular.',
    descripcion: 'Instalamos porteros y videoporteros para casas y edificios, con atención desde el celular.',
    incluye: ['Videoporteros', 'Atención desde el celular', 'Integración con cerraduras'],
    ideal: 'Casas, edificios y complejos.',
  },
  {
    slug: 'redes-wifi',
    foto: fotoRack,
    nombre: 'Redes WiFi',
    icono: 'wifi',
    resumen: 'WiFi que llega a toda la casa, sin cortes y con cableado prolijo.',
    descripcion: 'Diseñamos redes cableadas y WiFi para que haya buena señal en todos los ambientes, base de cualquier casa inteligente.',
    incluye: ['Relevamiento de cobertura', 'Redes mesh y puntos de acceso', 'Cableado estructurado y racks'],
    ideal: 'Casas grandes, oficinas y comercios.',
  },
  {
    slug: 'cerraduras',
    foto: fotoCerradura,
    nombre: 'Cerraduras inteligentes',
    icono: 'candado',
    resumen: 'Abrí con huella, código o desde el celular, y sabé quién entró.',
    descripcion: 'Instalamos cerraduras inteligentes con huella, código o app, ideales también para alquileres temporarios.',
    incluye: ['Apertura por huella, código o app', 'Accesos temporales', 'Registro de entradas'],
    ideal: 'Casas, oficinas y alquileres temporarios.',
  },
];

// Obras y novedades: sacadas de sus publicaciones (fotos: capturas de su Instagram, reemplazar por originales)
import fotoGenerac from '../assets/obras/generac.jpg';
import fotoCrestron from '../assets/obras/crestron.jpg';
import fotoVimar from '../assets/obras/vimar.jpg';

export const casos = [
  { titulo: 'Sala de videoconferencia Crestron', lugar: 'Gobierno del Chubut', texto: 'Sistema de videoconferencia profesional con panel de control táctil.', etiqueta: 'Audio y video', foto: fotoCrestron },
  { titulo: 'Automatización con Generac', lugar: 'Puesta en marcha', texto: 'Instalación y automatización de grupo electrógeno para que la casa nunca se quede sin energía.', etiqueta: 'Energía', foto: fotoGenerac },
  { titulo: 'Línea italiana Vimar', lugar: 'Para arquitectos', texto: 'Teclas y tomas de diseño para proyectos de arquitectura y desarrollos.', etiqueta: 'Domótica', foto: fotoVimar },
  { titulo: 'Acceso biométrico', lugar: 'Cerraduras inteligentes', texto: 'Reconocimiento facial y apertura remota: olvidate de andar con llaves.', etiqueta: 'Seguridad', foto: fotoCerradura },
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

// Galería "En obra": capturas de sus reels (reemplazar por los originales en alta)
export const galeria = [
  { foto: fotoCamioneta, texto: 'En camino a la próxima obra', alto: true },
  { foto: fotoPanel, texto: 'Echo Show 15 + Ring Doorbell Pro: puerta y portón desde la pared' },
  { foto: fotoCelular, texto: 'Toda la casa desde el celular, también con Siri', alto: true },
  { foto: fotoRack, texto: 'Racks y redes: así los recibimos y así los dejamos' },
  { foto: fotoPlano, texto: 'Termostato y climatización planificados sobre el plano' },
  { foto: fotoCerradura, texto: 'Acceso con reconocimiento facial', alto: true },
];

export const cedia = {
  foto: fotoCedia,
  titulo: 'Nos capacitamos en CEDIA 2024',
  texto: 'Viajamos a la feria internacional de integración residencial en Denver (EE.UU.) para traer a la Patagonia lo último en casas inteligentes.',
};
