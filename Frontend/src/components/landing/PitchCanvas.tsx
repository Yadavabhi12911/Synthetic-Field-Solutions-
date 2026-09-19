import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { PITCH_SLOTS, type PitchSlot } from './pitchSlots';

interface PitchCanvasProps {
  selectedSlotId: string;
  onSelectSlot: (id: string) => void;
  paused?: boolean;
  reducedMotion?: boolean;
  slots?: PitchSlot[];
  compact?: boolean;
}

function usePitchTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const { width: w, height: h } = canvas;
    const stripes = 12;
    for (let i = 0; i < stripes; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? '#1a8f58' : '#157a4b';
      ctx.fillRect((w / stripes) * i, 0, w / stripes + 1, h);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    const pad = 48;
    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

    ctx.beginPath();
    ctx.moveTo(w / 2, pad);
    ctx.lineTo(w / 2, h - pad);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 92, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 7, 0, Math.PI * 2);
    ctx.fill();

    const boxW = 148;
    const boxH = 292;
    ctx.strokeRect(pad, (h - boxH) / 2, boxW, boxH);
    ctx.strokeRect(w - pad - boxW, (h - boxH) / 2, boxW, boxH);

    const goalH = 128;
    ctx.lineWidth = 6;
    ctx.strokeRect(pad - 10, (h - goalH) / 2, 28, goalH);
    ctx.strokeRect(w - pad - 18, (h - goalH) / 2, 28, goalH);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(
    () => () => {
      texture?.dispose();
    },
    [texture]
  );

  return texture;
}

function CameraAim() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0.2, 0);
  }, [camera]);
  return null;
}

function PitchRig({
  children,
  reducedMotion,
}: {
  children: ReactNode;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const auto = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (reducedMotion) {
      ref.current.rotation.set(0.22, -0.18, 0);
      return;
    }
    auto.current += delta * 0.22;
    const targetY = pointer.x * 0.42 + Math.sin(auto.current) * 0.1;
    const targetX = 0.2 - pointer.y * 0.22;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetY, 3.2, delta);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, targetX, 3.2, delta);
  });

  return <group ref={ref}>{children}</group>;
}

function GoalPost({
  position,
  args,
}: {
  position: [number, number, number];
  args: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#f4f7fa" roughness={0.32} metalness={0.08} />
    </mesh>
  );
}

function Goal({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <GoalPost position={[-1.18, 0.46, 0]} args={[0.07, 0.92, 0.07]} />
      <GoalPost position={[1.18, 0.46, 0]} args={[0.07, 0.92, 0.07]} />
      <GoalPost position={[0, 0.9, 0]} args={[2.43, 0.07, 0.07]} />
    </group>
  );
}

function Floodlight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 8]} />
        <meshStandardMaterial color="#2a343d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.22, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.2]} />
        <meshStandardMaterial color="#e8fff4" emissive="#9effc8" emissiveIntensity={0.65} />
      </mesh>
    </group>
  );
}

function SlotMarker({
  slot,
  selected,
  onSelect,
}: {
  slot: PitchSlot;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const glow = useRef<THREE.Mesh>(null);
  const available = slot.available !== false;

  useFrame((_, delta) => {
    if (!glow.current) return;
    const mat = glow.current.material as THREE.MeshStandardMaterial;
    const target = selected ? 1.55 : available ? 0.18 : 0.04;
    mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, target, 6, delta);
  });

  return (
    <mesh
      ref={glow}
      rotation={[-Math.PI / 2, 0, 0]}
      position={slot.position}
      onClick={(event) => {
        event.stopPropagation();
        if (available) onSelect(slot.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = available ? 'pointer' : 'default';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <circleGeometry args={[0.52, 40]} />
      <meshStandardMaterial
        color={available ? '#22a06b' : '#5a6a74'}
        emissive={available ? '#22a06b' : '#3d4a52'}
        emissiveIntensity={selected ? 1.4 : 0.18}
        transparent
        opacity={selected ? 0.62 : available ? 0.28 : 0.12}
        roughness={0.35}
      />
    </mesh>
  );
}

function Ball({ target }: { target: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const current = useRef(new THREE.Vector3(0, 0.2, 0));
  const dest = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    dest.set(target[0], 0.2, target[2]);
    current.current.lerp(dest, 1 - Math.exp(-3.4 * delta));
    ref.current.position.copy(current.current);
    ref.current.rotation.x -= delta * 3.1;
    ref.current.rotation.z += delta * 1.4;
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.17, 32, 32]} />
      <meshStandardMaterial color="#f4f7fa" roughness={0.38} metalness={0.06} />
    </mesh>
  );
}

function Scene({
  selectedSlotId,
  onSelectSlot,
  reducedMotion = false,
  slots = PITCH_SLOTS,
}: Omit<PitchCanvasProps, 'paused' | 'compact'>) {
  const texture = usePitchTexture();
  const selected = slots.find((slot) => slot.id === selectedSlotId) ?? slots[0] ?? PITCH_SLOTS[0];

  return (
    <>
      <color attach="background" args={['#07090b']} />
      <fog attach="fog" args={['#07090b', 14, 28]} />
      <CameraAim />
      <ambientLight intensity={0.32} />
      <directionalLight position={[5, 9, 4]} intensity={1.15} color="#fff6e4" />
      <spotLight
        position={[-6.5, 9, -5]}
        angle={0.38}
        penumbra={0.7}
        intensity={55}
        color="#9effc8"
      />
      <spotLight
        position={[6.5, 8.5, 5]}
        angle={0.34}
        penumbra={0.8}
        intensity={38}
        color="#ffffff"
      />

      <PitchRig reducedMotion={reducedMotion}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
          <planeGeometry args={[13.4, 9.2]} />
          <meshStandardMaterial color="#12181c" roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 6.25]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={texture ? '#ffffff' : '#157a4b'}
            roughness={0.84}
            metalness={0.03}
          />
        </mesh>
        <Goal z={3.08} />
        <Goal z={-3.08} />
        <Floodlight position={[-6.1, 0, -4.1]} />
        <Floodlight position={[6.1, 0, -4.1]} />
        <Floodlight position={[-6.1, 0, 4.1]} />
        <Floodlight position={[6.1, 0, 4.1]} />
        {slots.map((slot) => (
          <SlotMarker
            key={slot.id}
            slot={slot}
            selected={slot.id === selectedSlotId}
            onSelect={onSelectSlot}
          />
        ))}
        <Ball target={selected.position} />
      </PitchRig>
      <ContactShadows position={[0, -0.02, 0]} opacity={0.42} scale={18} blur={2.6} far={10} />
    </>
  );
}

export default function PitchCanvas({
  selectedSlotId,
  onSelectSlot,
  paused = false,
  reducedMotion = false,
  slots = PITCH_SLOTS,
  compact = false,
}: PitchCanvasProps) {
  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.5]}
      camera={{
        position: compact ? [0, 5.8, 8.6] : [0, 7.4, 11.2],
        fov: compact ? 34 : 30,
        near: 0.1,
        far: 60,
      }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      className="h-full w-full touch-none"
    >
      <Scene
        selectedSlotId={selectedSlotId}
        onSelectSlot={onSelectSlot}
        reducedMotion={reducedMotion}
        slots={slots}
      />
    </Canvas>
  );
}
