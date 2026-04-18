// Minimal DOM stub so modules that reference `document` can be imported in Node tests.
// Canvas 2D operations become no-ops; we only test logic, not rendering.
const noop = () => {};
const ctxStub = new Proxy({}, {
  get: (_, prop) => {
    if (prop === 'canvas') return { width: 0, height: 0 };
    if (prop === 'fillStyle' || prop === 'strokeStyle' || prop === 'globalAlpha' ||
        prop === 'lineWidth' || prop === 'font' || prop === 'textAlign' ||
        prop === 'shadowColor' || prop === 'shadowBlur' || prop === 'imageSmoothingEnabled') return '';
    return noop;
  },
  set: () => true,
});

const canvasStub = {
  width: 0,
  height: 0,
  getContext: () => ctxStub,
  addEventListener: noop,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
  style: {},
};

globalThis.document = {
  createElement: () => ({ ...canvasStub, width: 0, height: 0, getContext: () => ctxStub }),
  getElementById: () => canvasStub,
};

globalThis.window = {
  addEventListener: noop,
  innerWidth: 1920,
  innerHeight: 1080,
};

globalThis.requestAnimationFrame = noop;
