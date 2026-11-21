"use client"

import { useLayoutEffect, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useInView, useReducedMotion } from "motion/react"
import * as THREE from "three"

/**
 * Hero backdrop: a field of task tiles rippling like a board under load.
 * One instanced mesh, one draw call. Renders a single still frame for
 * reduced-motion visitors and stops the loop once the hero scrolls away.
 */

const COLS = 44
const ROWS = 20
const GAP = 0.62
// Teal ramp from the Paper board: Tide, Slate teal, Mist.
const palette = ["#28515a", "#47777b", "#91aaa0"].map((c) => new THREE.Color(c))

function Tiles({ animate }: { animate: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const temp = useMemo(() => new THREE.Object3D(), [])

  // Fixed seed so the server-free first paint is identical on every visit.
  const seeds = useMemo(
    () => Array.from({ length: COLS * ROWS }, (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1),
    []
  )

  const place = (time: number) => {
    const m = mesh.current
    if (!m) return
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c
        const x = (c - COLS / 2) * GAP
        const z = (r - ROWS / 2) * GAP
        const wave = Math.sin(time * 0.6 + c * 0.28 + r * 0.22) * 0.35
        const lift = Math.max(0, Math.sin(time * 0.9 + seeds[i] * 40)) ** 8 * 0.6
        temp.position.set(x, wave + lift, z)
        temp.scale.set(1, 1 + lift * 4, 1)
        temp.updateMatrix()
        m.setMatrixAt(i, temp.matrix)
      }
    }
    m.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    seeds.forEach((s, i) => {
      const pick = Math.abs(s) > 0.93 ? 2 : Math.abs(s) > 0.55 ? 1 : 0
      m.setColorAt(i, palette[pick])
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    place(0)
    // place is stable in behaviour; seeds never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seeds])

  useFrame(({ clock }) => {
    if (animate) place(clock.elapsedTime)
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COLS * ROWS]}>
      <boxGeometry args={[0.48, 0.06, 0.48]} />
      <meshStandardMaterial roughness={0.55} metalness={0.1} />
    </instancedMesh>
  )
}

export default function HeroScene() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = useReducedMotion()
  const animate = inView && !reduced

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-35 lg:opacity-60 [mask-image:radial-gradient(ellipse_at_60%_45%,black_20%,transparent_75%)]"
    >
      <Canvas
        frameloop={animate ? "always" : "demand"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 6.5, 9], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 10, 6]} intensity={1.4} />
        <group rotation={[0, -0.35, 0]}>
          <Tiles animate={animate} />
        </group>
      </Canvas>
    </div>
  )
}
