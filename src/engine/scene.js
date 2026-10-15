// Three.js 3D Scene, Tabletop Tray & Camera Setup
import * as THREE from 'three';

export class SceneEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f111a);
    this.scene.fog = new THREE.FogExp2(0x0f111a, 0.015);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 20, 16);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    // Orbit / mouse controls
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.cameraRadius = 24;
    this.cameraTheta = Math.PI / 4; // Elevation
    this.cameraPhi = Math.PI / 2; // Azimuth

    this.setupLighting();
    this.setupTray(15);
    this.setupEventListeners();
    this.updateCameraPosition();
  }

  setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Main Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    sunLight.position.set(12, 28, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Secondary Rim Light (cool blue tint)
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
    rimLight.position.set(-15, 10, -15);
    this.scene.add(rimLight);

    // Point Light for center glow
    const centerGlow = new THREE.PointLight(0xfef08a, 0.5, 30);
    centerGlow.position.set(0, 8, 0);
    this.scene.add(centerGlow);
  }

  setupTray(size) {
    if (this.trayGroup) {
      this.scene.remove(this.trayGroup);
    }

    this.trayGroup = new THREE.Group();
    const halfSize = size / 2;
    const rimHeight = 2.4;
    const rimThickness = 0.8;

    // Floor Mesh (Felt / Wood tabletop)
    const floorGeo = new THREE.BoxGeometry(size, 0.4, size);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.2;
    floorMesh.receiveShadow = true;
    this.trayGroup.add(floorMesh);

    // Grid Floor Overlay
    const gridHelper = new THREE.GridHelper(size, 10, 0x475569, 0x334155);
    gridHelper.position.y = 0.02;
    this.trayGroup.add(gridHelper);

    // Borders / Walls
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.5
    });

    const borderConfigs = [
      // North
      { size: [size + rimThickness * 2, rimHeight, rimThickness], pos: [0, rimHeight / 2, halfSize + rimThickness / 2] },
      // South
      { size: [size + rimThickness * 2, rimHeight, rimThickness], pos: [0, rimHeight / 2, -halfSize - rimThickness / 2] },
      // East
      { size: [rimThickness, rimHeight, size], pos: [halfSize + rimThickness / 2, rimHeight / 2, 0] },
      // West
      { size: [rimThickness, rimHeight, size], pos: [-halfSize - rimThickness / 2, rimHeight / 2, 0] },
    ];

    for (const b of borderConfigs) {
      const rimGeo = new THREE.BoxGeometry(...b.size);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.set(...b.pos);
      rimMesh.castShadow = true;
      rimMesh.receiveShadow = true;
      this.trayGroup.add(rimMesh);
    }

    // Outer table surface
    const outerGeo = new THREE.BoxGeometry(size + 8, 0.3, size + 8);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9,
      metalness: 0.1
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.position.y = -0.36;
    outerMesh.receiveShadow = true;
    this.trayGroup.add(outerMesh);

    this.scene.add(this.trayGroup);
  }

  updateTraySize(size) {
    this.setupTray(size);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    // Canvas drag to rotate camera
    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.cameraPhi -= deltaX * 0.006;
      this.cameraTheta = Math.max(0.2, Math.min(Math.PI / 2.2, this.cameraTheta + deltaY * 0.006));
      this.updateCameraPosition();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch controls for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.prevMouseX;
      const deltaY = e.touches[0].clientY - this.prevMouseY;
      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;

      this.cameraPhi -= deltaX * 0.008;
      this.cameraTheta = Math.max(0.2, Math.min(Math.PI / 2.2, this.cameraTheta + deltaY * 0.008));
      this.updateCameraPosition();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraRadius = Math.max(12, Math.min(36, this.cameraRadius + e.deltaY * 0.02));
      this.updateCameraPosition();
    }, { passive: false });
  }

  updateCameraPosition() {
    const x = this.cameraRadius * Math.sin(this.cameraTheta) * Math.sin(this.cameraPhi);
    const y = this.cameraRadius * Math.cos(this.cameraTheta);
    const z = this.cameraRadius * Math.sin(this.cameraTheta) * Math.cos(this.cameraPhi);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.cameraTarget);
  }

  onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
