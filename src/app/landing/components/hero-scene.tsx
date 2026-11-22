"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const COLS = 44
const ROWS = 20
const GAP = 0.62
const palette = ["#173c35", "#176b60", "#dcefe7"].map((color) => new THREE.Color(color))
const seeds = Array.from(
  { length: COLS * ROWS },
  (_, index) => (Math.sin(index * 12.9898) * 43758.5453) % 1
)

export default function HeroScene() {
  const backdrop = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = backdrop.current
    const surface = canvas.current
    if (!container || !surface) return

    const context = surface.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    })
    if (!context) return

    const renderer = new THREE.WebGLRenderer({ canvas: surface, context, alpha: true })
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000)
    camera.position.set(0, 6.5, 9)
    camera.lookAt(0, 0, 0)

    const scene = new THREE.Scene()
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(4, 10, 6)
    scene.add(keyLight, new THREE.AmbientLight(0xffffff, 0.9))

    const geometry = new THREE.BoxGeometry(0.48, 0.06, 0.48)
    const material = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.1 })
    const tiles = new THREE.InstancedMesh(geometry, material, seeds.length)
    tiles.rotation.y = -0.35
    tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const tile = new THREE.Object3D()
    seeds.forEach((seed, index) => {
      const pick = Math.abs(seed) > 0.93 ? 2 : Math.abs(seed) > 0.55 ? 1 : 0
      tiles.setColorAt(index, palette[pick])
    })
    scene.add(tiles)

    function placeTiles(time: number) {
      for (let row = 0; row < ROWS; row++) {
        for (let column = 0; column < COLS; column++) {
          const index = row * COLS + column
          const wave = Math.sin(time * 0.6 + column * 0.28 + row * 0.22) * 0.35
          const lift = Math.sin(time * 0.9 + seeds[index] * 40) ** 8 * 0.6
          tile.position.set((column - COLS / 2) * GAP, wave + lift, (row - ROWS / 2) * GAP)
          tile.scale.set(1, 1 + lift * 4, 1)
          tile.updateMatrix()
          tiles.setMatrixAt(index, tile.matrix)
        }
      }
      tiles.instanceMatrix.needsUpdate = true
    }

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.setSize(width, height, false)
      renderer.render(scene, camera)
    }

    const timer = new THREE.Timer()
    timer.connect(document)
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let inView = false

    function syncAnimation() {
      if (!inView || reducedMotion.matches) {
        renderer.setAnimationLoop(null)
        return
      }

      timer.reset()
      renderer.setAnimationLoop((timestamp) => {
        timer.update(timestamp)
        placeTiles(timer.getElapsed())
        renderer.render(scene, camera)
      })
    }

    placeTiles(0)
    resize()
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(container)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      syncAnimation()
    })
    visibilityObserver.observe(container)
    reducedMotion.addEventListener("change", syncAnimation)

    return () => {
      renderer.setAnimationLoop(null)
      reducedMotion.removeEventListener("change", syncAnimation)
      visibilityObserver.disconnect()
      sizeObserver.disconnect()
      timer.dispose()
      tiles.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={backdrop}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-30 [mask-image:radial-gradient(ellipse_at_60%_45%,black_20%,transparent_75%)]"
    >
      <canvas ref={canvas} className="block size-full" />
    </div>
  )
}
