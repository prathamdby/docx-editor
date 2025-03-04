'use client'

import { useEffect, useRef } from 'react'

export function BokehBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create bokeh circles
    const circles: Array<{
      x: number
      y: number
      radius: number
      color: string
      speed: number
      angle: number
    }> = []

    for (let i = 0; i < 50; i++) {
      circles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 100 + 50,
        color: `hsla(${Math.random() * 60 + 200}, 50%, 50%, 0.1)`,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      circles.forEach(circle => {
        // Move circle
        circle.x += Math.cos(circle.angle) * circle.speed
        circle.y += Math.sin(circle.angle) * circle.speed

        // Bounce off edges
        if (circle.x < -circle.radius) circle.x = canvas.width + circle.radius
        if (circle.x > canvas.width + circle.radius) circle.x = -circle.radius
        if (circle.y < -circle.radius) circle.y = canvas.height + circle.radius
        if (circle.y > canvas.height + circle.radius) circle.y = -circle.radius

        // Draw circle
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(
          circle.x,
          circle.y,
          0,
          circle.x,
          circle.y,
          circle.radius
        )
        gradient.addColorStop(0, circle.color)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

