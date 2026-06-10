"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { Project, ProjectCategory } from "@/data/projects";
import { CATEGORY_SHORT, STATUS_COLOR } from "@/data/projects";

type SphereGalleryProps = {
  projects: Project[];
  activeCategory: ProjectCategory | "all";
  onSelect: (project: Project) => void;
  onFirstDrag: () => void;
};

const RADIUS = 11;
const CARD_W = 3.4;
const CARD_H = 4.25;
const LERP = 0.1;
const MAX_LAT = THREE.MathUtils.degToRad(60);

function makeCardTexture(project: Project, isMobile: boolean): THREE.CanvasTexture {
  const scale = isMobile ? 0.5 : 1;
  const W = Math.round(512 * scale);
  const H = Math.round(640 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const s = (n: number) => n * scale;

  // bg
  ctx.fillStyle = "#101010";
  ctx.fillRect(0, 0, W, H);
  // subtle vertical gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "rgba(255,255,255,0.04)");
  grad.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // "image area" — abstract noir blocks unique per project
  const seed = project.id.charCodeAt(1) * 7 + project.id.charCodeAt(2) * 13;
  ctx.save();
  ctx.beginPath();
  ctx.rect(s(24), s(24), W - s(48), s(330));
  ctx.clip();
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(s(24), s(24), W - s(48), s(330));
  for (let i = 0; i < 6; i++) {
    const v = ((seed * (i + 3)) % 97) / 97;
    ctx.fillStyle = i % 3 === 0 ? "rgba(201,169,97,0.18)" : "rgba(245,240,230,0.05)";
    ctx.save();
    ctx.translate(s(60 + v * 380), s(80 + ((seed * (i + 1)) % 200) * scale));
    ctx.rotate((v - 0.5) * 1.2);
    ctx.fillRect(0, 0, s(40 + v * 160), s(8 + v * 26));
    ctx.restore();
  }
  // big ghost index number
  ctx.font = `${s(190)}px Arial Black, sans-serif`;
  ctx.fillStyle = "rgba(245,240,230,0.07)";
  ctx.fillText(project.id.slice(1), s(40), s(310));
  ctx.restore();

  // image area border
  ctx.strokeStyle = "rgba(245,240,230,0.12)";
  ctx.lineWidth = s(2);
  ctx.strokeRect(s(24), s(24), W - s(48), s(330));

  // status pill
  const statusColor = STATUS_COLOR[project.status];
  ctx.font = `${s(17)}px ui-monospace, monospace`;
  const stW = ctx.measureText(project.status).width + s(28);
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = s(1.5);
  ctx.strokeRect(s(36), s(40), stW, s(34));
  ctx.fillStyle = statusColor;
  ctx.fillText(project.status, s(50), s(63));

  // category pill (below image area)
  const cat = CATEGORY_SHORT[project.category];
  ctx.font = `${s(16)}px ui-monospace, monospace`;
  const catW = ctx.measureText(cat).width + s(28);
  ctx.fillStyle = "rgba(201,169,97,0.14)";
  ctx.fillRect(s(24), s(382), catW, s(32));
  ctx.fillStyle = "#c9a961";
  ctx.fillText(cat, s(38), s(404));
  // year — right aligned
  ctx.fillStyle = "#8a8275";
  ctx.textAlign = "right";
  ctx.fillText(project.year, W - s(28), s(404));
  ctx.textAlign = "left";

  // title
  ctx.font = `${s(44)}px Arial Black, Arial, sans-serif`;
  ctx.fillStyle = "#f5f0e6";
  const title = project.title.toUpperCase();
  if (ctx.measureText(title).width > W - s(56)) {
    ctx.font = `${s(34)}px Arial Black, Arial, sans-serif`;
  }
  ctx.fillText(title, s(24), s(478), W - s(48));

  // description — wrapped, 2 lines max
  ctx.font = `${s(18)}px ui-monospace, monospace`;
  ctx.fillStyle = "#b8b1a3";
  const words = project.description.toUpperCase().split(" ");
  let line = "";
  let y = s(522);
  let lines = 0;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > W - s(56) && line) {
      ctx.fillText(line, s(24), y);
      line = w;
      y += s(26);
      lines++;
      if (lines >= 2) {
        line = line + "…";
        break;
      }
    } else {
      line = test;
    }
  }
  if (lines < 3) ctx.fillText(line, s(24), y);

  // tags row
  ctx.font = `${s(15)}px ui-monospace, monospace`;
  let tx = s(24);
  for (const tag of project.tags) {
    const t = tag.toUpperCase();
    const tw = ctx.measureText(t).width + s(20);
    ctx.strokeStyle = "rgba(245,240,230,0.2)";
    ctx.lineWidth = s(1);
    ctx.strokeRect(tx, s(584), tw, s(30));
    ctx.fillStyle = "#8a8275";
    ctx.fillText(t, tx + s(10), s(605));
    tx += tw + s(10);
  }

  // outer border
  ctx.strokeStyle = "rgba(201,169,97,0.25)";
  ctx.lineWidth = s(2);
  ctx.strokeRect(s(1), s(1), W - s(2), H - s(2));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Evenly distribute n cards on the inner sphere surface (lat/long rings). */
function layoutPositions(n: number): { phi: number; theta: number }[] {
  const out: { phi: number; theta: number }[] = [];
  // rows of ~6, latitudes spread within ±40°
  const rows = Math.max(2, Math.min(4, Math.ceil(n / 6)));
  const perRow: number[] = [];
  let left = n;
  for (let r = 0; r < rows; r++) {
    const c = Math.ceil(left / (rows - r));
    perRow.push(c);
    left -= c;
  }
  perRow.forEach((count, r) => {
    const lat =
      rows === 1 ? 0 : THREE.MathUtils.degToRad(-38 + (76 * r) / (rows - 1));
    const offset = (r % 2) * (Math.PI / count); // stagger alternate rows
    for (let i = 0; i < count; i++) {
      out.push({ phi: Math.PI / 2 - lat, theta: offset + (i * Math.PI * 2) / count });
    }
  });
  return out;
}

function sphericalToVec(phi: number, theta: number, radius = RADIUS): THREE.Vector3 {
  return new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
}

export function SphereGallery({
  projects,
  activeCategory,
  onSelect,
  onFirstDrag,
}: SphereGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    meshes: Map<string, THREE.Mesh>;
    transitioning: boolean;
  }>({ meshes: new Map(), transitioning: false });
  const onSelectRef = useRef(onSelect);
  const onFirstDragRef = useRef(onFirstDrag);
  onSelectRef.current = onSelect;
  onFirstDragRef.current = onFirstDrag;

  // ── scene lifecycle ──────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0a0a");
    scene.fog = new THREE.Fog("#0a0a0a", RADIUS * 0.9, RADIUS * 1.8);

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 90 : 80,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 0.001);

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // cards
    const meshes = new Map<string, THREE.Mesh>();
    const group = new THREE.Group();
    scene.add(group);

    const positions = layoutPositions(projects.length);
    projects.forEach((project, i) => {
      const texture = makeCardTexture(project, isMobile);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
      });
      // slightly curved plane: bend vertices onto the sphere
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 6, 6);
      const pos = geo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v);
        const z = -(x * x) / (2 * RADIUS); // gentle horizontal curvature toward center
        pos.setZ(v, z);
      }
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, material);
      const { phi, theta } = positions[i];
      mesh.position.copy(sphericalToVec(phi, theta));
      mesh.lookAt(0, 0, 0);
      mesh.userData = { project, baseScale: 1 };
      group.add(mesh);
      meshes.set(project.id, mesh);
    });
    stateRef.current.meshes = meshes;

    // ── drag controls with lerp + inertia ──────────────────────
    let lon = 0;
    let lat = 0;
    let targetLon = 0;
    let targetLat = 0;
    let velLon = 0;
    let velLat = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let firstDragFired = false;

    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";

    const onPointerDown = (e: PointerEvent) => {
      if (stateRef.current.transitioning) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      velLon = 0;
      velLat = 0;
      dom.style.cursor = "grabbing";
      dom.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / container.clientWidth) * 2 - 1;
      pointer.y = -(e.clientY / container.clientHeight) * 2 + 1;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      lastX = e.clientX;
      lastY = e.clientY;
      const speed = (camera.fov / 80) * 0.0028;
      targetLon -= dx * speed;
      targetLat += dy * speed;
      targetLat = THREE.MathUtils.clamp(targetLat, -MAX_LAT, MAX_LAT);
      velLon = -dx * speed;
      velLat = dy * speed;
      if (!firstDragFired && moved > 24) {
        firstDragFired = true;
        onFirstDragRef.current();
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      dom.style.cursor = "grab";
      if (moved < 8) handleClick(e);
    };

    // ── raycaster: hover + click ────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    let hovered: THREE.Mesh | null = null;

    const intersectCard = (): THREE.Mesh | null => {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(group.children, false);
      const hit = hits.find((h) => h.object.visible && (h.object as THREE.Mesh).userData.project);
      return (hit?.object as THREE.Mesh) ?? null;
    };

    const handleClick = (e: PointerEvent) => {
      if (stateRef.current.transitioning) return;
      pointer.x = (e.clientX / container.clientWidth) * 2 - 1;
      pointer.y = -(e.clientY / container.clientHeight) * 2 + 1;
      const mesh = intersectCard();
      if (!mesh) return;
      const project = mesh.userData.project as Project;
      stateRef.current.transitioning = true;
      // camera pushes toward the card, scene fades, then navigate
      const dir = mesh.position.clone().normalize();
      const camTarget = dir.multiplyScalar(RADIUS * 0.55);
      gsap.to(camera.position, {
        x: camTarget.x,
        y: camTarget.y,
        z: camTarget.z,
        duration: 0.9,
        ease: "power3.inOut",
      });
      gsap.to(camera, {
        fov: 50,
        duration: 0.9,
        ease: "power3.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
      });
      gsap.to(container, {
        opacity: 0,
        duration: 0.55,
        delay: 0.45,
        ease: "power2.in",
        onComplete: () => onSelectRef.current(project),
      });
    };

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);

    // ── resize ──────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── render loop ─────────────────────────────────────────────
    let raf = 0;
    const lookTarget = new THREE.Vector3();
    const animate = () => {
      raf = requestAnimationFrame(animate);

      if (!dragging) {
        // inertia decay
        targetLon += velLon;
        targetLat = THREE.MathUtils.clamp(targetLat + velLat, -MAX_LAT, MAX_LAT);
        velLon *= 0.94;
        velLat *= 0.94;
      }
      lon += (targetLon - lon) * LERP;
      lat += (targetLat - lat) * LERP;

      if (!stateRef.current.transitioning) {
        const phi = Math.PI / 2 - lat;
        lookTarget.setFromSphericalCoords(1, phi, lon);
        camera.lookAt(lookTarget);
      }

      // hover
      if (!stateRef.current.transitioning && !dragging) {
        const hit = intersectCard();
        if (hit !== hovered) {
          if (hovered) {
            gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: "power2.out" });
            const m = hovered.material as THREE.MeshBasicMaterial;
            gsap.to(m.color, { r: 1, g: 1, b: 1, duration: 0.35 });
          }
          hovered = hit;
          if (hovered) {
            gsap.to(hovered.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.35, ease: "power2.out" });
            const m = hovered.material as THREE.MeshBasicMaterial;
            gsap.to(m.color, { r: 1.25, g: 1.25, b: 1.25, duration: 0.35 });
            dom.style.cursor = "pointer";
          } else if (!dragging) {
            dom.style.cursor = "grab";
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // chrome entrance fade for the canvas itself
    gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        const m = mesh.material as THREE.MeshBasicMaterial;
        m.map?.dispose();
        m.dispose();
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── filter animation: hide non-matching, redistribute the rest ──
  useEffect(() => {
    const { meshes } = stateRef.current;
    if (meshes.size === 0) return;

    const visible = projects.filter(
      (p) => activeCategory === "all" || p.category === activeCategory
    );
    const positions = layoutPositions(visible.length);

    projects.forEach((project) => {
      const mesh = meshes.get(project.id);
      if (!mesh) return;
      const idx = visible.findIndex((p) => p.id === project.id);
      if (idx === -1) {
        gsap.to(mesh.scale, {
          x: 0.001,
          y: 0.001,
          z: 0.001,
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            mesh.visible = false;
          },
        });
      } else {
        const { phi, theta } = positions[idx];
        const target = sphericalToVec(phi, theta);
        mesh.visible = true;
        gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power3.out", delay: 0.15 });
        gsap.to(mesh.position, {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: 0.9,
          ease: "power3.inOut",
          onUpdate: () => mesh.lookAt(0, 0, 0),
        });
      }
    });
  }, [activeCategory, projects]);

  return <div ref={containerRef} className="fixed inset-0 z-0" aria-label="Project gallery" />;
}
