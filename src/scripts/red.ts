// "Sinergia": el logo (techo + óvalo) armado con partículas que se juntan al cargar,
// rodeado de dispositivos conectados por líneas con pulsos de datos. Sutil y liviano: sin posprocesado.
import * as THREE from 'three';

type Opciones = { contenedor: HTMLElement; reducirMovimiento: boolean };

const BLANCO = new THREE.Color(0xffffff);
const CELESTE = new THREE.Color(0x8fa8ff);

export async function iniciarRed({ contenedor, reducirMovimiento }: Opciones) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.domElement.className = 'absolute inset-0 size-full';
  contenedor.prepend(renderer.domElement);

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camara.position.set(0, 0, 10.5);
  const grupo = new THREE.Group();
  escena.add(grupo);

  // Textura circular suave para las partículas
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = 64;
  const ctx = lienzo.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const punto = new THREE.CanvasTexture(lienzo);

  // ---------- Forma del logo: se dibuja en un lienzo invisible y cada píxel con trazo es una partícula ----------
  const { destino, esTexto, nitido, ancho, alto, unidad, centroY } = await muestrearLogo(contenedor.clientWidth < 640 ? 4200 : 7500);
  const cantidad = destino.length / 3;

  const inicio = new Float32Array(cantidad * 3);
  for (let i = 0; i < cantidad; i++) {
    const r = 9 + Math.random() * 6, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI;
    inicio.set([Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r - 4], i * 3);
  }
  const posiciones = new Float32Array(reducirMovimiento ? destino : inicio);
  const colores = new Float32Array(cantidad * 3);
  const fases = new Float32Array(cantidad);
  for (let i = 0; i < cantidad; i++) {
    // El texto va blanco; el techo y el óvalo, con un toque celeste
    BLANCO.clone().lerp(CELESTE, esTexto[i] ? Math.random() * 0.15 : 0.25 + Math.random() * 0.45).toArray(colores, i * 3);
    fases[i] = Math.random() * Math.PI * 2;
  }
  const geoLogo = new THREE.BufferGeometry();
  geoLogo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geoLogo.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  const logo = new THREE.Points(
    geoLogo,
    new THREE.PointsMaterial({ size: 0.075, map: punto, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  grupo.add(logo);

  // ---------- Logo nítido que aparece cuando las partículas se arman ----------
  const texturaLogo = new THREE.CanvasTexture(nitido);
  texturaLogo.colorSpace = THREE.SRGBColorSpace;
  texturaLogo.anisotropy = 4;
  const materialNitido = new THREE.MeshBasicMaterial({ map: texturaLogo, transparent: true, opacity: 0, depthWrite: false });
  const planoLogo = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), materialNitido);
  planoLogo.position.z = 0.02;
  grupo.add(planoLogo);

  // ---------- Dispositivos alrededor del óvalo ----------
  const RX = 155 * unidad, RY = 111.5 * unidad;
  const nodos: THREE.Vector3[] = [];
  const anclas: THREE.Vector3[] = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + 0.15 + (i / 6) * (Math.PI - 0.3); // de izquierda a derecha por abajo
    anclas.push(new THREE.Vector3(Math.cos(a) * RX, centroY + Math.sin(a) * RY, 0));
    nodos.push(new THREE.Vector3(Math.cos(a) * RX * 1.32, centroY + Math.sin(a) * RY * 1.38, -0.6 + Math.sin(a * 3) * 0.6));
  }
  const geoNodos = new THREE.BufferGeometry().setFromPoints(nodos);
  const materialNodos = new THREE.PointsMaterial({ size: 0.42, map: punto, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  grupo.add(new THREE.Points(geoNodos, materialNodos));

  const lineas: THREE.Vector3[] = [];
  nodos.forEach((n, i) => lineas.push(n, anclas[i]));
  const materialLineas = new THREE.LineBasicMaterial({ color: 0x8fa8ff, transparent: true, opacity: 0 });
  grupo.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lineas), materialLineas));

  // Pulsos de datos que viajan de cada dispositivo al centro
  const pulsos = new Float32Array(nodos.length * 3);
  const geoPulsos = new THREE.BufferGeometry();
  geoPulsos.setAttribute('position', new THREE.BufferAttribute(pulsos, 3));
  const materialPulsos = new THREE.PointsMaterial({ size: 0.22, map: punto, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  grupo.add(new THREE.Points(geoPulsos, materialPulsos));

  // ---------- Interacción y animación ----------
  let mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  });

  function ajustarTamano() {
    const { width, height } = contenedor.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camara.aspect = width / height;
    // Que el logo entre entero aunque el recuadro sea angosto
    // Distancia mínima para que entre el logo completo (~10,8 unidades de ancho, contando la red) con margen
    const tanMedio = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    camara.position.z = Math.max(10.5, 10.8 / camara.aspect / (2 * tanMedio));
    camara.updateProjectionMatrix();
    if (reducirMovimiento) dibujar(4);
  }

  const reloj = new THREE.Clock();
  const suave = (x: number) => x * x * (3 - 2 * x);
  function dibujar(t: number) {
    // Las partículas viajan a su lugar en los primeros 2,6 s
    const llegada = reducirMovimiento ? 1 : Math.min(t / 2.6, 1);
    for (let i = 0; i < cantidad; i++) {
      const k = suave(Math.min(Math.max(llegada * 1.35 - (i % 7) * 0.05, 0), 1));
      const respiro = reducirMovimiento ? 0 : Math.sin(t * 0.9 + fases[i]) * 0.035;
      for (let e = 0; e < 3; e++) {
        posiciones[i * 3 + e] = inicio[i * 3 + e] + (destino[i * 3 + e] - inicio[i * 3 + e]) * k + (e === 1 ? respiro : 0);
      }
    }
    geoLogo.attributes.position.needsUpdate = true;

    // Cuando el logo ya está armado aparece la versión nítida y las partículas quedan como brillo
    const nitidez = reducirMovimiento ? 1 : suave(Math.min(Math.max((t - 2.2) / 1.1, 0), 1));
    materialNitido.opacity = nitidez * 0.95;
    (logo.material as THREE.PointsMaterial).opacity = 1 - nitidez * 0.55;

    // La red aparece cuando el logo ya está armado
    const red = reducirMovimiento ? 1 : suave(Math.min(Math.max((t - 1.8) / 1.2, 0), 1));
    materialNodos.opacity = red * (0.75 + Math.sin(t * 2) * 0.15);
    materialLineas.opacity = red * 0.28;
    materialPulsos.opacity = red;
    nodos.forEach((n, i) => {
      const f = reducirMovimiento ? 0.5 : (t * 0.35 + i / nodos.length) % 1;
      const c = anclas[i];
      pulsos.set([n.x + (c.x - n.x) * f, n.y + (c.y - n.y) * f, n.z + (c.z - n.z) * f], i * 3);
    });
    geoPulsos.attributes.position.needsUpdate = true;

    grupo.rotation.y += ((reducirMovimiento ? 0 : mx * 0.5 + Math.sin(t * 0.2) * 0.12) - grupo.rotation.y) * 0.05;
    grupo.rotation.x += ((reducirMovimiento ? 0 : my * 0.25) - grupo.rotation.x) * 0.05;
    renderer.render(escena, camara);
  }

  new ResizeObserver(ajustarTamano).observe(contenedor);
  ajustarTamano();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(contenedor);
  if (reducirMovimiento) dibujar(4);
  else renderer.setAnimationLoop(() => visible && dibujar(reloj.getElapsedTime()));
}

// Medidas del logo original (sinergia.jfif, en píxeles): eje de simetría x = 174.5, centro del óvalo y = 300.
// Techo: dos trazos a 45° de 17 px; óvalo de 155 × 111.5 px con trazo de 9 px, visible en la mitad de abajo;
// texto "sinergiahome" en geométrica (Questrial) de ascendente y = 295 a descendente y = 354.
async function muestrearLogo(maximo: number) {
  const ESCALA = 3; // resolución del lienzo respecto del logo original
  const W = 400 * ESCALA, H = 260 * ESCALA, OX = 200 - 174.5, OY = 10 - 177; // el logo (y 177..416) entra en el lienzo
  const lienzo = document.createElement('canvas');
  lienzo.width = W;
  lienzo.height = H;
  const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
  ctx.scale(ESCALA, ESCALA);
  ctx.translate(OX, OY);

  // Techo
  ctx.strokeStyle = '#00f';
  ctx.lineWidth = 17;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(167, 184); ctx.lineTo(64, 287);
  ctx.moveTo(182, 184); ctx.lineTo(285, 287);
  ctx.stroke();

  // Óvalo: se desvanece hacia arriba
  const fundido = ctx.createLinearGradient(0, 255, 0, 305);
  fundido.addColorStop(0, 'rgba(0,0,255,0)');
  fundido.addColorStop(1, 'rgba(0,0,255,1)');
  ctx.strokeStyle = fundido;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.ellipse(174.5, 300, 155, 111.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Texto en rojo puro para distinguirlo del dibujo al leer los píxeles
  await document.fonts.load('400 60px Questrial').catch(() => {});
  ctx.fillStyle = '#f00';
  let tam = 60;
  ctx.font = `400 ${tam}px Questrial, "Century Gothic", sans-serif`;
  tam *= 352 / ctx.measureText('sinergiahome').width; // ancho visible del original
  ctx.font = `400 ${tam}px Questrial, "Century Gothic", sans-serif`;
  const medida = ctx.measureText('sinergiahome');
  ctx.textAlign = 'center';
  ctx.fillText('sinergiahome', 174.5, 295 + medida.actualBoundingBoxAscent);

  // Leer píxeles y convertirlos en partículas
  const datos = ctx.getImageData(0, 0, W, H).data;
  const candidatos: [number, number, number, boolean][] = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const k = (y * W + x) * 4;
      const alfa = datos[k + 3] / 255;
      if (alfa < 0.08 || Math.random() > alfa) continue;
      candidatos.push([x, y, alfa, datos[k] > datos[k + 2]]);
    }
  }
  // Submuestreo parejo hasta el máximo de partículas
  for (let i = candidatos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidatos[i], candidatos[j]] = [candidatos[j], candidatos[i]];
  }
  const elegidos = candidatos.slice(0, maximo);
  const UNIDAD = 9.6 / (350 * ESCALA); // 350 px del logo = 9,6 unidades de escena
  const destino = new Float32Array(elegidos.length * 3);
  const esTexto = new Uint8Array(elegidos.length);
  elegidos.forEach(([x, y, , texto], i) => {
    destino.set([(x - W / 2) * UNIDAD, -(y - H / 2) * UNIDAD, (Math.random() - 0.5) * (texto ? 0.06 : 0.25)], i * 3);
    esTexto[i] = texto ? 1 : 0;
  });
  // Versión nítida en blanco del mismo dibujo, para superponerla cuando las partículas se arman
  const nitido = document.createElement('canvas');
  nitido.width = W;
  nitido.height = H;
  const cn = nitido.getContext('2d')!;
  cn.drawImage(lienzo, 0, 0);
  cn.globalCompositeOperation = 'source-in';
  cn.fillStyle = '#fff';
  cn.fillRect(0, 0, W, H);
  return { destino, esTexto, nitido, ancho: W * UNIDAD, alto: H * UNIDAD, unidad: UNIDAD * ESCALA, centroY: -(OY + 300 - H / ESCALA / 2) * UNIDAD * ESCALA };
}
