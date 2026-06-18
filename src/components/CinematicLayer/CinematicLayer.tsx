"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./CinematicLayer.module.css";

/**
 * Floating cinematic bokeh layer.
 *
 * A transparent, pointer-events:none WebGL canvas rendering a field of soft,
 * additively-blended glowing particles in warm orange + white. Particles drift
 * via sine-wave oscillation and the camera eases toward the pointer for a
 * dreamy parallax depth — the feel of a movie intro's out-of-focus highlights.
 *
 * Everything lives in a single effect so setup/teardown stay symmetrical and
 * all GPU resources are disposed on unmount.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;

  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vColor = aColor;

    // Slow, layered sine drift around each particle's home position.
    vec3 pos = position;
    pos.x += sin(uTime * 0.18 + aPhase) * 0.9;
    pos.y += cos(uTime * 0.15 + aPhase * 1.3) * 0.8;
    pos.z += sin(uTime * 0.12 + aPhase * 0.7) * 0.6;

    // Gentle brightness shimmer.
    vTwinkle = 0.7 + 0.3 * sin(uTime * 0.8 + aPhase * 2.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct point size; clamped so near particles stay soft, not huge.
    gl_PointSize = aScale * uSize * (1.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 2.0, 260.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    // Distance from the point's center, 0 at core -> 0.5 at edge.
    float d = distance(gl_PointCoord, vec2(0.5));

    // Soft radial falloff -> dreamy out-of-focus bokeh.
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 2.4);

    float alpha = glow * vTwinkle;
    if (alpha < 0.003) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

const WARM = new THREE.Color("#ff8a3d");
const WHITE = new THREE.Color("#fff4e6");
const BLUE = new THREE.Color("#9ec2ff");

export default function CinematicLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement ?? canvas;
    let width = parent.clientWidth || window.innerWidth;
    let height = parent.clientHeight || window.innerHeight;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const particleCount = isMobile ? 80 : 180;

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);

    // ---- Scene & camera ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 120);
    camera.position.z = 30;

    // ---- Particle geometry ----
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    // Deterministic-ish pseudo random (no Math.random reliance for spread shape).
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 64; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 42; // y
      positions[i3 + 2] = -Math.random() * 28 + 6; // z (depth, mostly behind)

      // Mostly warm/white, a few cool blue accents for the "monitor glow".
      const roll = Math.random();
      const color =
        roll > 0.88 ? BLUE : roll > 0.5 ? WHITE.clone() : WARM.clone();
      const c = color.clone().lerp(WHITE, Math.random() * 0.25);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      scales[i] = 0.6 + Math.random() * 2.2;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 90 * dpr },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ---- Pointer parallax ----
    const pointerTarget = { x: 0, y: 0 };
    const cameraEased = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!prefersReduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    // ---- Resize ----
    const resize = () => {
      width = parent.clientWidth || window.innerWidth;
      height = parent.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    });
    ro.observe(parent);

    // ---- Render loop ----
    const clock = new THREE.Clock();
    let rafId = 0;
    let running = true;

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      // Ease the camera toward the pointer for soft parallax.
      cameraEased.x += (pointerTarget.x * 3 - cameraEased.x) * 0.03;
      cameraEased.y += (-pointerTarget.y * 2 - cameraEased.y) * 0.03;
      camera.position.x = cameraEased.x;
      camera.position.y = cameraEased.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const animate = () => {
      if (!running) return;
      renderFrame();
      rafId = requestAnimationFrame(animate);
    };

    // Pause the loop when the tab is hidden to save the GPU.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!prefersReduced) {
        running = true;
        clock.start();
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (prefersReduced) {
      // Honor reduced motion: draw one calm static frame, no loop.
      renderFrame();
    } else {
      animate();
    }

    // ---- Cleanup ----
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [prefersReduced]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
