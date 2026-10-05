// Escena 3D de la casa inteligente (three.js). Todo se arma por código: no hay modelos que descargar.
// Muestra lo que vende Sinergia: luces, persianas, portón, cámara con IA que sigue a una persona,
// y alarma con perímetro que se dispara si alguien lo cruza.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export type Estado = { luces: boolean; persianas: boolean; camaras: boolean; alarma: boolean; porton: boolean };

type Opciones = {
  contenedor: HTMLElement;
  estado: Estado;
  reducirMovimiento: boolean;
  alCambiarAlerta?: (intrusion: boolean) => void;
};

const ACENTO = 0x2ee6c5;
const ROJO = 0xff3b5c;
const CALIDO = 0xffb46b;
const FONDO = 0x0b141b;
const CENTRO = new THREE.Vector3(0.5, 0, -0.3); // centro del perímetro de la alarma
const RADIO_PERIMETRO = 6.4;

export function iniciarCasa3D({ contenedor, estado, reducirMovimiento, alCambiarAlerta }: Opciones) {
  const ancho0 = contenedor.clientWidth;
  const liviano = ancho0 < 640 || (navigator.hardwareConcurrency || 8) <= 4;

  // ---------- Renderizado ----------
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, liviano ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = !liviano;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'absolute inset-0 size-full touch-pan-y';
  contenedor.prepend(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', () => console.warn('[casa3d] contexto WebGL perdido'));

  const etiquetas = new CSS2DRenderer();
  etiquetas.domElement.className = 'pointer-events-none absolute inset-0';
  contenedor.appendChild(etiquetas.domElement);

  const escena = new THREE.Scene();
  escena.background = new THREE.Color(FONDO);
  escena.fog = new THREE.Fog(FONDO, 20, 42);
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.22;

  const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const DIRECCION = new THREE.Vector3(11, 7.2, 13).normalize();
  let distanciaObjetivo = 24;
  camara.position.copy(DIRECCION).multiplyScalar(reducirMovimiento ? distanciaObjetivo : 36).add(new THREE.Vector3(0.6, 1.7, 0));

  const destino = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: liviano ? 0 : 4 });
  const composer = new EffectComposer(renderer, destino);
  composer.addPass(new RenderPass(escena, camara));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), liviano ? 0.5 : 0.65, 0.5, 0.88);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- Luces de ambiente (atardecer) ----------
  escena.add(new THREE.HemisphereLight(0x7a93b0, 0x1a140f, 0.9));
  const sol = new THREE.DirectionalLight(0xffcfa0, 1.7);
  sol.position.set(-9, 11, 7);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.camera.left = -11;
  sol.shadow.camera.right = 11;
  sol.shadow.camera.top = 11;
  sol.shadow.camera.bottom = -11;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.03;
  escena.add(sol);
  const contraluz = new THREE.DirectionalLight(0x4da3ff, 0.6);
  contraluz.position.set(8, 6, -10);
  escena.add(contraluz);

  // ---------- Materiales ----------
  const m = {
    pasto: new THREE.MeshStandardMaterial({ color: 0x18241d, roughness: 1 }),
    platea: new THREE.MeshStandardMaterial({ color: 0x3c4249, roughness: 0.9 }),
    concreto: new THREE.MeshStandardMaterial({ color: 0xd3d7da, roughness: 0.82 }),
    concretoOscuro: new THREE.MeshStandardMaterial({ color: 0x2c3339, roughness: 0.75 }),
    madera: new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: 0.65 }),
    deck: new THREE.MeshStandardMaterial({ color: 0x5e3f2b, roughness: 0.8 }),
    marco: new THREE.MeshStandardMaterial({ color: 0x161b20, roughness: 0.4, metalness: 0.7 }),
    vidrio: new THREE.MeshStandardMaterial({ color: 0x0c1a24, roughness: 0.06, metalness: 0.9, emissive: CALIDO, emissiveIntensity: 0 }),
    porton: new THREE.MeshStandardMaterial({ color: 0x2a3138, roughness: 0.45, metalness: 0.6 }),
    persiana: new THREE.MeshStandardMaterial({ color: 0x39424b, roughness: 0.55, metalness: 0.3 }),
    camino: new THREE.MeshStandardMaterial({ color: 0x5f6469, roughness: 0.95 }),
    agua: new THREE.MeshStandardMaterial({ color: 0x0b4f63, roughness: 0.08, metalness: 0.2, emissive: 0x18c7e0, emissiveIntensity: 0.25 }),
    tronco: new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 1 }),
    copa: new THREE.MeshStandardMaterial({ color: 0x2c4a35, roughness: 0.9, flatShading: true }),
    baliza: new THREE.MeshStandardMaterial({ color: 0x111111, emissive: CALIDO, emissiveIntensity: 0 }),
    persona: new THREE.MeshStandardMaterial({ color: 0xc9d3dc, roughness: 0.6 }),
    dispositivo: new THREE.MeshStandardMaterial({ color: 0xeef2f5, roughness: 0.35 }),
  };

  const casa = new THREE.Group();
  escena.add(casa);

  function caja(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, padre: THREE.Object3D = casa) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    padre.add(mesh);
    return mesh;
  }

  // ---------- Terreno ----------
  const terreno = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.4, 0.4, 72), m.pasto);
  terreno.position.y = -0.2;
  terreno.receiveShadow = true;
  casa.add(terreno);
  caja(10, 0.15, 7.2, m.platea, 0.6, 0, -0.6);
  caja(1.2, 0.04, 6.2, m.camino, 1.6, 0.0, 5.0);
  caja(6.2, 0.14, 1.1, m.deck, -0.9, 0.15, 2.05);

  // ---------- Planta baja ----------
  caja(6, 2.8, 4.4, m.concreto, -0.5, 0.15, -0.8);
  const frente = 1.41;
  // Ventanal con carpintería
  caja(3.8, 2.3, 0.05, m.vidrio, -1.3, 0.3, frente);
  for (const x of [-3.2, -2.25, -1.3, -0.35, 0.6]) caja(0.06, 2.3, 0.08, m.marco, x, 0.3, frente + 0.01);
  caja(3.86, 0.07, 0.09, m.marco, -1.3, 2.6, frente + 0.01);
  // Puerta de madera y aplique
  caja(1, 2.35, 0.06, m.madera, 1.55, 0.3, frente);
  const aplique = caja(0.12, 0.3, 0.1, m.baliza, 2.25, 1.9, frente + 0.05);

  // ---------- Planta alta en voladizo ----------
  caja(5.2, 2.5, 4.6, m.concretoOscuro, -1.1, 2.95, -0.2);
  const frenteAlto = 2.12;
  caja(3, 1.15, 0.05, m.vidrio, -2.3, 3.65, frenteAlto);
  caja(3.06, 0.06, 0.08, m.marco, -2.3, 4.8, frenteAlto + 0.01);
  // Listones de madera en el resto del frente
  for (let x = -0.62; x <= 1.42; x += 0.17) caja(0.08, 2.45, 0.08, m.madera, x, 2.97, frenteAlto + 0.02);
  for (let x = -3.75; x <= -0.85; x += 0.17) caja(0.08, 0.6, 0.08, m.madera, x, 2.97, frenteAlto + 0.02);
  // Losas
  caja(5.6, 0.14, 5, m.concretoOscuro, -1.1, 5.45, -0.2);
  caja(6.3, 0.12, 4.7, m.concretoOscuro, -0.5, 2.95, -0.8);

  // ---------- Garaje con portón ----------
  caja(3.3, 2.6, 4.4, m.concreto, 4.1, 0.15, -0.8);
  caja(3.5, 0.12, 4.6, m.concretoOscuro, 4.1, 2.75, -0.8);
  const portonGrupo = new THREE.Group();
  portonGrupo.position.set(4.1, 2.45, frente + 0.03);
  casa.add(portonGrupo);
  const portonGeo = new THREE.BoxGeometry(2.7, 2.25, 0.06);
  portonGeo.translate(0, -1.125, 0);
  const porton = new THREE.Mesh(portonGeo, m.porton);
  porton.castShadow = true;
  portonGrupo.add(porton);
  for (let y = -0.25; y > -2.25; y -= 0.28) {
    const ranura = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.02, 0.07), m.marco);
    ranura.position.y = y;
    porton.add(ranura);
  }
  const luzGaraje = new THREE.PointLight(CALIDO, 0, 6, 2);
  luzGaraje.position.set(4.1, 1.8, 0.6);
  casa.add(luzGaraje);

  // ---------- Persianas (crecen de arriba hacia abajo) ----------
  const persianas: THREE.Mesh[] = [];
  function persiana(w: number, h: number, x: number, yArriba: number, z: number) {
    const geo = new THREE.BoxGeometry(w, h, 0.05);
    geo.translate(0, -h / 2, 0);
    const p = new THREE.Mesh(geo, m.persiana);
    p.position.set(x, yArriba, z);
    p.scale.y = 0.03;
    p.castShadow = true;
    casa.add(p);
    persianas.push(p);
    caja(w + 0.1, 0.16, 0.18, m.marco, x, yArriba, z); // cajón
  }
  persiana(3.8, 2.3, -1.3, 2.6, frente + 0.07);
  persiana(3, 1.15, -2.3, 4.8, frenteAlto + 0.07);

  // ---------- Pileta ----------
  caja(3.6, 0.3, 1.9, m.concreto, -2.2, 0.0, 3.55);
  const agua = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 1.5), m.agua);
  agua.position.set(-2.2, 0.27, 3.55);
  casa.add(agua);
  const luzPileta = new THREE.PointLight(0x22d3ee, 0, 4, 2);
  luzPileta.position.set(-2.2, 0.6, 3.55);
  casa.add(luzPileta);

  // ---------- Balizas del camino ----------
  const balizas: THREE.Mesh[] = [];
  for (const z of [2.6, 4.1, 5.6, 7.1]) {
    for (const x of [0.85, 2.35]) {
      caja(0.1, 0.45, 0.1, m.marco, x, 0, z);
      const luz = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.11), m.baliza);
      luz.position.set(x, 0.42, z);
      casa.add(luz);
      balizas.push(luz);
    }
  }

  // ---------- Árboles ----------
  for (const [x, z, s] of [[-6.2, -2.4, 1.2], [6.8, -3.2, 1.35], [-6, 4.4, 1], [7.4, 2.6, 0.9]] as const) {
    caja(0.22 * s, 1.3 * s, 0.22 * s, m.tronco, x, 0, z);
    const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05 * s, 0), m.copa);
    copa.position.set(x, 1.3 * s + 0.75 * s, z);
    copa.castShadow = true;
    casa.add(copa);
  }

  // ---------- Luces interiores ----------
  const luzBaja = new THREE.PointLight(CALIDO, 0, 9, 2);
  luzBaja.position.set(-1.3, 1.6, 0.6);
  casa.add(luzBaja);
  const luzAlta = new THREE.PointLight(CALIDO, 0, 8, 2);
  luzAlta.position.set(-2.2, 4.2, 1.2);
  casa.add(luzAlta);

  // ---------- Persona que camina por el terreno ----------
  const persona = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.85, 6, 12), m.persona);
  cuerpo.position.y = 0.65;
  cuerpo.castShadow = true;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), m.persona);
  cabeza.position.y = 1.42;
  cabeza.castShadow = true;
  persona.add(cuerpo, cabeza);
  casa.add(persona);
  const recorrido = [new THREE.Vector3(9, 0, 6.5), new THREE.Vector3(4.6, 0, 5.2), new THREE.Vector3(1.6, 0, 3.6), new THREE.Vector3(0.3, 0, 2.95)];

  // Recuadro de detección + etiqueta
  const recuadro = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.85, 1.85, 0.85)),
    new THREE.LineBasicMaterial({ color: ACENTO, transparent: true, opacity: 0 })
  );
  recuadro.position.y = 0.92;
  persona.add(recuadro);
  const etiquetaPersona = etiqueta('Persona · 97%', 'acento');
  etiquetaPersona.position.set(0, 2.15, 0);
  persona.add(etiquetaPersona);

  // ---------- Cámara de seguridad con IA ----------
  const dispositivo = new THREE.Group();
  dispositivo.position.set(5.55, 2.55, 1.2);
  casa.add(dispositivo);
  const cuerpoCam = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.42), m.dispositivo);
  cuerpoCam.geometry.translate(0, 0, 0.12);
  dispositivo.add(cuerpoCam);
  const ledCam = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: ACENTO }));
  ledCam.position.set(0, 0.06, 0.34);
  dispositivo.add(ledCam);
  const conoGeo = new THREE.ConeGeometry(1.25, 6.5, 40, 1, true);
  conoGeo.rotateX(-Math.PI / 2);
  conoGeo.translate(0, 0, 3.25);
  const cono = new THREE.Mesh(
    conoGeo,
    new THREE.MeshBasicMaterial({ color: ACENTO, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  dispositivo.add(cono);
  dispositivo.lookAt(recorrido[1].x, 0.9, recorrido[1].z);

  // ---------- Alarma: perímetro y luz ----------
  const perimetro = new THREE.Mesh(
    new THREE.RingGeometry(RADIO_PERIMETRO - 0.05, RADIO_PERIMETRO + 0.05, 128),
    new THREE.MeshBasicMaterial({ color: ROJO, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  );
  perimetro.rotation.x = -Math.PI / 2;
  perimetro.position.set(CENTRO.x, 0.03, CENTRO.z);
  casa.add(perimetro);
  const onda = new THREE.Mesh(
    new THREE.RingGeometry(0.97, 1, 128),
    new THREE.MeshBasicMaterial({ color: ROJO, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  );
  onda.rotation.x = -Math.PI / 2;
  onda.position.set(CENTRO.x, 0.04, CENTRO.z);
  casa.add(onda);
  const sirena = new THREE.PointLight(ROJO, 0, 16, 1.5);
  sirena.position.set(0.5, 6.5, 0.5);
  casa.add(sirena);
  const etiquetaAlarma = etiqueta('⚠ Intrusión detectada', 'rojo');
  etiquetaAlarma.position.set(-1.1, 6.4, -0.2);
  casa.add(etiquetaAlarma);

  // ---------- WiFi: ondas que salen del techo ----------
  const ondasWifi: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const o = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.012, 6, 96),
      new THREE.MeshBasicMaterial({ color: 0x4da3ff, transparent: true, opacity: 0 })
    );
    o.rotation.x = Math.PI / 2;
    o.position.set(-1.1, 5.75, -0.2);
    casa.add(o);
    ondasWifi.push(o);
  }

  function etiqueta(texto: string, tono: 'acento' | 'rojo') {
    const div = document.createElement('div');
    div.textContent = texto;
    div.className =
      tono === 'rojo'
        ? 'rounded-full bg-[#ff3b5c] px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-white shadow-lg shadow-[#ff3b5c]/40 transition-opacity duration-300'
        : 'rounded-md border border-[#2ee6c5] bg-[#0a0f14]/80 px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-[#2ee6c5] transition-opacity duration-300';
    div.style.opacity = '0';
    return new CSS2DObject(div);
  }

  // ---------- Controles de cámara ----------
  const controles = new OrbitControls(camara, renderer.domElement);
  controles.target.set(0.6, 1.7, 0);
  controles.enableZoom = false;
  controles.enablePan = false;
  controles.enableDamping = true;
  controles.dampingFactor = 0.06;
  controles.rotateSpeed = 0.6;
  controles.minPolarAngle = 0.75;
  controles.maxPolarAngle = 1.3;
  controles.autoRotate = !reducirMovimiento;
  controles.autoRotateSpeed = 0.35;
  let pausaRotacion: number | undefined;
  controles.addEventListener('start', () => {
    controles.autoRotate = false;
    clearTimeout(pausaRotacion);
  });
  controles.addEventListener('end', () => {
    if (!reducirMovimiento) pausaRotacion = window.setTimeout(() => (controles.autoRotate = true), 4000);
  });
  controles.addEventListener('change', () => reducirMovimiento && pedirCuadro());

  function ajustarTamano() {
    const { width, height } = contenedor.getBoundingClientRect();
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    bloom.setSize(width, height);
    etiquetas.setSize(width, height);
    camara.aspect = width / height;
    distanciaObjetivo = width < 520 ? 25 : 24;
    camara.updateProjectionMatrix();
    pedirCuadro();
  }

  // ---------- Animación ----------
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const reloj = new THREE.Clock();
  const objetivoCamara = new THREE.Object3D();
  const desplazamiento = new THREE.Vector3();
  let intrusionPrevia = false;
  let hayCuadroPendiente = true;

  function posicionPersona(t: number) {
    // Va y vuelve por el recorrido cada 18 s
    const ciclo = (t / 18) % 1;
    const avance = ciclo < 0.5 ? ciclo * 2 : (1 - ciclo) * 2;
    const tramos = recorrido.length - 1;
    const f = Math.min(avance * tramos, tramos - 0.0001);
    const i = Math.floor(f);
    const p = recorrido[i].clone().lerp(recorrido[i + 1], f - i);
    const mirando = ciclo < 0.5 ? recorrido[i + 1] : recorrido[i];
    return { p, mirando };
  }

  function actualizar(dt: number, t: number) {
    const k = reducirMovimiento ? 1 : 1 - Math.pow(0.002, dt); // suavizado independiente de los FPS

    // Intro: la cámara se acerca al centro de la escena (medido desde el punto que orbita, no desde el origen)
    desplazamiento.subVectors(camara.position, controles.target);
    const actual = desplazamiento.length();
    if (Math.abs(actual - distanciaObjetivo) > 0.01) {
      desplazamiento.setLength(lerp(actual, distanciaObjetivo, reducirMovimiento ? 1 : 1 - Math.pow(0.15, dt)));
      camara.position.addVectors(controles.target, desplazamiento);
    }

    // Luces
    const luces = estado.luces ? 1 : 0;
    m.vidrio.emissiveIntensity = lerp(m.vidrio.emissiveIntensity, luces * 0.95, k);
    m.baliza.emissiveIntensity = lerp(m.baliza.emissiveIntensity, luces * 2.6, k);
    luzBaja.intensity = lerp(luzBaja.intensity, luces * 12, k);
    luzAlta.intensity = lerp(luzAlta.intensity, luces * 9, k);
    luzPileta.intensity = lerp(luzPileta.intensity, luces * 5, k);
    m.agua.emissiveIntensity = 0.12 + luces * (0.22 + (reducirMovimiento ? 0 : Math.sin(t * 1.7) * 0.05));

    // Persianas y portón
    persianas.forEach((p) => (p.scale.y = lerp(p.scale.y, estado.persianas ? 1 : 0.03, k)));
    porton.scale.y = lerp(porton.scale.y, estado.porton ? 0.06 : 1, k);
    luzGaraje.intensity = lerp(luzGaraje.intensity, estado.porton && estado.luces ? 14 : 0, k);

    // Persona
    const { p, mirando } = reducirMovimiento ? { p: recorrido[1], mirando: recorrido[2] } : posicionPersona(t);
    persona.position.copy(p);
    persona.lookAt(mirando.x, 0, mirando.z);
    if (!reducirMovimiento) cuerpo.position.y = 0.65 + Math.abs(Math.sin(t * 6)) * 0.04;

    // Cámara con IA: sigue a la persona
    const camarasOn = estado.camaras;
    const conoMat = cono.material as THREE.MeshBasicMaterial;
    conoMat.opacity = lerp(conoMat.opacity, camarasOn ? 0.12 : 0, k);
    (recuadro.material as THREE.LineBasicMaterial).opacity = lerp((recuadro.material as THREE.LineBasicMaterial).opacity, camarasOn ? 1 : 0, k);
    etiquetaPersona.element.style.opacity = camarasOn ? '1' : '0';
    if (camarasOn) {
      objetivoCamara.position.copy(dispositivo.position);
      objetivoCamara.lookAt(p.x, 0.9, p.z);
      dispositivo.quaternion.slerp(objetivoCamara.quaternion, reducirMovimiento ? 1 : 1 - Math.pow(0.01, dt));
    }
    (ledCam.material as THREE.MeshBasicMaterial).color.setHex(camarasOn ? ACENTO : 0x333333);

    // Alarma: perímetro y disparo si la persona lo cruza
    const dentro = p.distanceTo(CENTRO) < RADIO_PERIMETRO;
    const intrusion = estado.alarma && dentro;
    const perMat = perimetro.material as THREE.MeshBasicMaterial;
    perMat.opacity = lerp(perMat.opacity, estado.alarma ? (intrusion ? 0.55 + Math.sin(t * 10) * 0.45 : 0.55) : 0, k);
    const ondaMat = onda.material as THREE.MeshBasicMaterial;
    if (estado.alarma && !reducirMovimiento) {
      const fase = (t * (intrusion ? 0.9 : 0.35)) % 1;
      onda.scale.setScalar(0.5 + fase * RADIO_PERIMETRO);
      ondaMat.opacity = (1 - fase) * (intrusion ? 0.8 : 0.35);
    } else ondaMat.opacity = lerp(ondaMat.opacity, 0, k);
    sirena.intensity = intrusion ? (reducirMovimiento ? 60 : 40 + Math.sin(t * 12) * 40) : lerp(sirena.intensity, 0, k);
    etiquetaAlarma.element.style.opacity = intrusion ? '1' : '0';
    if (intrusion !== intrusionPrevia) {
      intrusionPrevia = intrusion;
      alCambiarAlerta?.(intrusion);
    }

    // WiFi
    ondasWifi.forEach((o, i) => {
      const fase = reducirMovimiento ? 0.4 + i * 0.2 : (t * 0.45 + i / 3) % 1;
      o.scale.setScalar(0.4 + fase * 3.2);
      (o.material as THREE.MeshBasicMaterial).opacity = (1 - fase) * 0.7;
    });

    controles.update(dt);
  }

  function dibujar() {
    const dt = Math.min(reloj.getDelta(), 0.05);
    actualizar(dt, reloj.elapsedTime);
    composer.render();
    etiquetas.render(escena, camara);
  }

  // Con "reducir movimiento" se dibuja solo cuando algo cambia
  function pedirCuadro() {
    if (!reducirMovimiento || hayCuadroPendiente) return;
    hayCuadroPendiente = true;
    requestAnimationFrame(() => {
      hayCuadroPendiente = false;
      dibujar();
    });
  }

  new ResizeObserver(ajustarTamano).observe(contenedor);
  ajustarTamano();

  let visible = true;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) reloj.getDelta(); // evita un salto al volver
  }).observe(contenedor);

  if (reducirMovimiento) {
    hayCuadroPendiente = false;
    dibujar();
  } else {
    renderer.setAnimationLoop(() => visible && dibujar());
  }

  return {
    // El panel avisa cuando cambia el estado
    actualizar: () => pedirCuadro(),
  };
}
