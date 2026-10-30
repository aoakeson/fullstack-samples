import confetti from 'canvas-confetti'

/** The small moment of delight when a task reaches Done. */
export function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  confetti({ particleCount: 110, spread: 70, startVelocity: 38, origin: { y: 0.75 }, scalar: 0.9 })
}
