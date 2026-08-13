import confetti from 'canvas-confetti';

export function fireConfetti() {
  const colors = ['#d4af37', '#e8d090', '#ffffff', '#f5f5f7'];
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    zIndex: 200,
  });
  setTimeout(() => {
    confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 }, colors, zIndex: 200 });
  }, 200);
  setTimeout(() => {
    confetti({ particleCount: 30, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors, zIndex: 200 });
    confetti({ particleCount: 30, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors, zIndex: 200 });
  }, 400);
}
