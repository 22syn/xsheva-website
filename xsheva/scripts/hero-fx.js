const PARALLAX_STRENGTH = 0.02;
const PARALLAX_LERP = 0.08;

async function main() {
  if (!navigator.gpu) return;

  const hero = document.querySelector("[data-hero]");
  const heroGlow = document.querySelector("[data-hero-glow]");
  if (!hero || !heroGlow) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  heroGlow.appendChild(canvas);

  let gpu;
  let canvasSurface;
  let gridEffect;
  let gpuClock;
  let frameLoopFn;
  let frameFn;

  try {
    const { init, surface, effect, frameLoop, frame, clock } = await import("vgpu");
    const heroGridShader = (await import("./shaders/hero-grid.wgsl")).default;

    gpu = await init();
    canvasSurface = surface(gpu, canvas, {
      dpr: [1, 2],
      alphaMode: "premultiplied",
      clearColor: [0, 0, 0, 0],
    });
    gridEffect = effect(gpu, heroGridShader, { blend: "alpha" });
    gpuClock = clock(gpu);
    frameLoopFn = frameLoop;
    frameFn = frame;
  } catch {
    canvas.remove();
    return;
  }

  const pointer = { x: 0, y: 0 };
  const smoothedOffset = { x: 0, y: 0 };

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left - rect.width / 2) * PARALLAX_STRENGTH;
    pointer.y = (event.clientY - rect.top - rect.height / 2) * PARALLAX_STRENGTH;
  });

  const renderFrame = (activeFrame) => {
    smoothedOffset.x += (pointer.x - smoothedOffset.x) * PARALLAX_LERP;
    smoothedOffset.y += (pointer.y - smoothedOffset.y) * PARALLAX_LERP;
    gridEffect.set({
      time: gpuClock.time,
      dpr: canvasSurface.dpr,
      offset: [smoothedOffset.x, smoothedOffset.y],
    });
    activeFrame.pass(canvasSurface, gridEffect);
    if (window.__testHooks) window.__heroFxFrames = (window.__heroFxFrames ?? 0) + 1;
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    frameFn(gpu, renderFrame);
    window.addEventListener("pagehide", () => gpu.dispose(), { once: true });
    return;
  }

  let loopHandle = null;
  let isHeroInView = true;

  const startLoop = () => {
    if (!loopHandle && isHeroInView && !document.hidden) {
      loopHandle = frameLoopFn(gpu, renderFrame);
    }
  };
  const stopLoop = () => {
    loopHandle?.stop();
    loopHandle = null;
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      isHeroInView = entry.isIntersecting;
      if (isHeroInView) startLoop();
      else stopLoop();
    },
    { threshold: 0 },
  );
  observer.observe(hero);

  startLoop();

  window.addEventListener(
    "pagehide",
    () => {
      stopLoop();
      observer.disconnect();
      gpu.dispose();
    },
    { once: true },
  );
}

main();
