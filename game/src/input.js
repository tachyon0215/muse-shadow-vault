// Shadow Vault — keyboard and mouse input.
export function createInput(canvas) {
  const keys = new Set();
  let coinAt = null;
  let confirm = false;
  addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
    if (e.key === 'Enter') confirm = true;
    if (e.key.toLowerCase() === 'q') {
      // toss toward the last mouse position, or straight ahead
      coinAt = mouse.pos ? { ...mouse.pos } : { x: 480, y: 320 };
    }
  });
  addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  const mouse = { pos: null };
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.pos = { x: ((e.clientX - r.left) / r.width) * 960, y: ((e.clientY - r.top) / r.height) * 640 };
  });
  canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    coinAt = { x: ((e.clientX - r.left) / r.width) * 960, y: ((e.clientY - r.top) / r.height) * 640 };
    confirm = true;
  });
  return {
    control() {
      const c = {
        x: (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0),
        y: (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0),
        sneak: keys.has('shift'),
        coin: coinAt,
      };
      coinAt = null;
      return c;
    },
    takeConfirm() { const v = confirm; confirm = false; return v; },
  };
}
