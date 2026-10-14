import confetti from 'canvas-confetti';

export function fireConfetti(options?: confetti.Options) {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      ...options,
    });
  } catch (e) {
    console.debug('Confetti disabled or failed:', e);
  }
}

export function fireStreakCelebration() {
  try {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#f59e0b', '#ef4444', '#10b981'],
    });
    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#3b82f6', '#8b5cf6', '#10b981'],
    });
  } catch (e) {
    console.debug('Celebration confetti failed:', e);
  }
}
