'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ACESFilmicToneMapping } from 'three';

/**
 * AICore — central icosahedron + wireframe overlay + 3 orbital rings.
 *
 * Spec compliance (SPLINE_CINEMATIC_EXECUTION_SYSTEM.md §2):
 * - Core does NOT rotate. It breathes only: ±2% scale on 6s sine.
 * - Wireframe overlay counter-rotates gently (creates perceived depth, still 1 motion).
 * - Rings rotate at ~0.05 rad/s; adjacent rings in opposing directions.
 * - Mouse parallax only — lerp 0.04, no orbit.
 * - 2 active motions max: core breath + ring rotation.
 * - FOV 30° (long lens — premium, calm).
 * - Bloom threshold 0.85 (emissive only), intensity 0.7.
 * - ACES Filmic tone mapping.
 */
function Core() {
  const coreRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (coreRef.current) {
      // Breath only — ±2% on a 6s sine cycle (spec: slow-in/slow-out intelligence cadence)
      const breathe = 1 + Math.sin((t * Math.PI * 2) / 6) * 0.02;
      coreRef.current.scale.setScalar(breathe);
    }

    if (wireRef.current) {
      // Wireframe counter-rotates gently — creates perceived depth without being a separate actor
      wireRef.current.rotation.y -= 0.0006;
      wireRef.current.rotation.x += 0.0003;
    }

    if (groupRef.current) {
      // Mouse parallax: lerp 0.04, Y amp ~0.18, X amp ~0.10 (spec §2.4)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.18,
        0.04,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.y * 0.10,
        0.04,
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Solid emissive core — indigo, never pure white */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.95, 4]} />
        <meshStandardMaterial
          color="#12152A"
          emissive="#5B6CFF"
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>
      {/* Wireframe overlay at 1.05× scale — opposing counter-rotation creates depth */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshBasicMaterial color="#818CF8" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function OrbitalRing({
  radius,
  count,
  speed,
  color,
  size = 0.012,
}: {
  radius: number;
  count: number;
  speed: number;
  color: string;
  size?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const wobble = (Math.random() - 0.5) * 0.04;
      arr[i * 3] = Math.cos(a) * (radius + wobble);
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
      arr[i * 3 + 2] = Math.sin(a) * (radius + wobble);
    }
    return arr;
  }, [count, radius]);

  // Constant velocity — no easing, no breathing on rings (spec §2.3)
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += speed;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      {/* Three-point lighting: indigo key · violet fill · cyan rim (spec §2.6) */}
      <pointLight position={[-4, 4, 3]} intensity={1.2} color="#5B6CFF" />
      <pointLight position={[4, -4, 2]} intensity={0.6} color="#9A6CFF" />
      <pointLight position={[0, -3, -2]} intensity={0.35} color="#6CC8FF" />

      {/* Core — no Float wrapper (Float counts as a 3rd active motion) */}
      <Core />

      {/*
        Rings at radii 2.0 / 2.8 / 3.8 (spec §2.2).
        Adjacent rings in opposing directions at ~0.05 rad/s.
        Using per-frame delta × speed to get ~0.05 rad/s at 60fps: 0.05 / 60 ≈ 0.00083.
      */}
      <OrbitalRing radius={2.0} count={120} speed={0.00083}  color="#A5B4FC" size={0.012} />
      <OrbitalRing radius={2.8} count={180} speed={-0.00083} color="#818CF8" size={0.009} />
      <OrbitalRing radius={3.8} count={240} speed={0.00083}  color="#5B6CFF" size={0.007} />

      {/* Bloom: emissive only — threshold 0.85, intensity 0.7 (spec §2.6) */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function AICore({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none h-full w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 30 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
