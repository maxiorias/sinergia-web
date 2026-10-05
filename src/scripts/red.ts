// "Sinergia": el logo (techo + óvalo) armado con partículas que se juntan al cargar,
// rodeado de dispositivos conectados por líneas con pulsos de datos. Sutil y liviano: sin posprocesado.
import * as THREE from 'three';

type Opciones = { contenedor: HTMLElement; reducirMovimiento: boolean };

const BLANCO = new THREE.Color(0xffffff);
const CELESTE = new THREE.Color(0x8fa8ff);

export function iniciarRed({ contenedor, reducirMovimiento }: Opciones) {
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

  // ---------- Forma del logo: techo (dos trazos) + óvalo ----------
  const destino: number[] = [];
  const azar = (a: number) => (Math.random() - 0.5) * a;
  function trazo(x1: number, y1: number, x2: number, y2: number, n: number, grosor: number) {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      destino.push(x1 + (x2 - x1) * t + azar(grosor), y1 + (y2 - y1) * t + azar(grosor), azar(0.5));
    }
  }
  trazo(-2.4, -0.2, -0.25, 2.55, 900, 0.34); // ala izquierda del techo
  trazo(0.25, 2.55, 2.4, -0.2, 900, 0.34); // ala derecha
  const RX = 4.6, RY = 1.65, CY = -0.85;
  for (let i = 0; i < 1500; i++) {
    const a = Math.random() * Math.PI * 2;
    // El óvalo se desvanece arriba, como en el logo
    if (Math.sin(a) > 0.55 && Math.random() < 0.8) continue;
    destino.push(Math.cos(a) * RX + azar(0.12), CY + Math.sin(a) * RY + azar(0.12), azar(0.4));
  }
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
    BLANCO.clone().lerp(CELESTE, Math.random() * 0.5).toArray(colores, i * 3);
    fases[i] = Math.random() * Math.PI * 2;
  }
  const geoLogo = new THREE.BufferGeometry();
  geoLogo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  geoLogo.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  const logo = new THREE.Points(
    geoLogo,
    new THREE.PointsMaterial({ size: 0.11, map: punto, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  grupo.add(logo);

  // ---------- Dispositivos alrededor y conexiones al centro ----------
  const nodos: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    nodos.push(new THREE.Vector3(Math.cos(a) * 6.4, Math.sin(a) * 3.4 - 0.2, -1.5 + Math.sin(a * 2) * 1.2));
  }
  const centro = new THREE.Vector3(0, 0.6, 0);
  const geoNodos = new THREE.BufferGeometry().setFromPoints(nodos);
  const materialNodos = new THREE.PointsMaterial({ size: 0.42, map: punto, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  grupo.add(new THREE.Points(geoNodos, materialNodos));

  const lineas: THREE.Vector3[] = [];
  nodos.forEach((n) => lineas.push(n, centro));
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
    camara.position.z = width / height < 1 ? 10.5 / (width / height) ** 0.8 : 10.5;
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

    // La red aparece cuando el logo ya está armado
    const red = reducirMovimiento ? 1 : suave(Math.min(Math.max((t - 1.8) / 1.2, 0), 1));
    materialNodos.opacity = red * (0.75 + Math.sin(t * 2) * 0.15);
    materialLineas.opacity = red * 0.28;
    materialPulsos.opacity = red;
    nodos.forEach((n, i) => {
      const f = reducirMovimiento ? 0.5 : (t * 0.35 + i / nodos.length) % 1;
      pulsos.set([n.x + (centro.x - n.x) * f, n.y + (centro.y - n.y) * f, n.z + (centro.z - n.z) * f], i * 3);
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
