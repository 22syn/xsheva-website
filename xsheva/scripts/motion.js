import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lenis and GSAP each run their own RAF loop. Left alone they drift, and
// ScrollTrigger starts firing at positions that no longer match the screen.
// Driving Lenis from gsap.ticker keeps a single clock.
let lenis = null;

if (!reduced) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);

  // Lenis only reports scrolls it performed itself. Anchor jumps, keyboard and
  // find-in-page move the document without telling it, which left ScrollTrigger
  // on stale positions and the destination stuck in its pre-animation state.
  // ScrollTrigger.update is cheap and safe to call redundantly.
  window.addEventListener("scroll", () => ScrollTrigger.update(), { passive: true });

  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

export function initHero() {
  // Explicit hook, not a `closest()` guess — the nearest positioned ancestor is
  // the inner copy block, so a structural lookup silently targets the wrong node.
  const hero = document.querySelector("[data-hero]");
  const title = document.querySelector("[data-hero-title]");
  if (!title || !hero) return;

  const eyebrow = document.querySelector("[data-hero-eyebrow]");
  const sub = document.querySelector("[data-hero-sub]");
  const cta = document.querySelector("[data-hero-cta]");
  const glow = document.querySelector("[data-hero-glow]");

  if (reduced) return;

  // The hero is above the fold, so this plays on load rather than on scroll.
  // Lines animate by transform, not opacity, so the headline is painted
  // immediately and only clipped — which keeps it eligible as the LCP element.
  // `mask: "lines"` is what makes the reveal work: it wraps each line in its own
  // clipping parent, so the line can travel while the edge stays put. Without it
  // the line clips itself and simply appears.
  const split = new SplitText(title, {
    type: "lines",
    mask: "lines",
    linesClass: "line",
  });

  gsap.set([eyebrow, sub, cta], { opacity: 0, y: 16 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 }, 0)
    .from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.1, ease: "power4.out" }, 0.12)
    .to(sub, { opacity: 1, y: 0, duration: 0.6 }, 0.55)
    .to(cta, { opacity: 1, y: 0, duration: 0.6 }, 0.68);

  // The hero can't be revealed by scroll — it is already on screen at scroll 0.
  // So it gets a scrubbed *exit* instead: pinned while the copy lifts away and
  // the glow opens up, handing off to the next section under scroll control.
  const copy = [title.parentElement, cta].filter(Boolean);

  const exit = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=100%",
      pin: hero,
      scrub: 0.8,
      anticipatePin: 1,
    },
  });

  exit.to(copy, { yPercent: -22, opacity: 0, ease: "none" }, 0);
  if (glow) exit.to(glow, { scale: 1.5, opacity: 0.35, ease: "none" }, 0);
}

export function initClients() {
  const section = document.getElementById("trusted-by");
  if (!section || reduced) return;

  const heading = section.querySelector("[data-clients-heading]");
  const band = section.querySelector("[data-clients-band]");
  const track = section.querySelector(".logo-marquee__inner");

  gsap.set([heading, band], { opacity: 0, y: 20 });

  gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: section, start: "top bottom-=60" },
  })
    .to(heading, { opacity: 1, y: 0, duration: 0.5 })
    .to(band, { opacity: 1, y: 0, duration: 0.7 }, 0.15);

  // Hand the track from its CSS loop to the scroll position, so the logos are
  // driven by the reader like everything else on the page rather than idling on
  // their own clock. Ownership is exclusive — the CSS animation is switched off
  // here, so only one engine ever touches this transform.
  if (track) {
    track.style.animation = "none";
    gsap.fromTo(
      track,
      { xPercent: 0 },
      {
        xPercent: -33.3333,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      },
    );
  }
}

export function initArchitectureSection() {
  const root = document.getElementById("architecture");
  if (!root) return;

  const pin = root.querySelector("[data-arch-pin]");
  const image = root.querySelector("[data-arch-image]");
  const heading = root.querySelector("[data-arch-heading]");
  const progress = root.querySelector("[data-arch-progress]");
  const steps = [...root.querySelectorAll("[data-step]")];

  // The markup ships fully visible, so no-JS and reduced-motion readers get the
  // finished state for free. The pre-animation state is applied here instead —
  // if this module never runs, nothing is left dimmed or collapsed.
  if (reduced) return;

  const rules = steps.map((s) => s.querySelector("[data-rule]"));
  gsap.set(steps, { opacity: 0.25, y: 24 });
  gsap.set(rules, { scaleX: 0 });
  gsap.set(progress, { scaleX: 0 });

  // Heading reveal fires on entry rather than on scrub — a headline that
  // assembles at the reader's scroll speed reads as broken, not deliberate.
  const split = new SplitText(heading, {
    type: "lines",
    mask: "lines",
    linesClass: "line",
  });
  gsap.from(split.lines, {
    yPercent: 110,
    duration: 1,
    ease: "power4.out",
    stagger: 0.12,
    scrollTrigger: { trigger: root, start: "top 60%" },
  });

  const STEP_START = 0.35; // where the first step begins on the timeline
  const STEP_GAP = 0.75; // spacing between consecutive steps
  const STEP_DUR = 0.5;
  // Anything meant to span the whole section needs this explicitly. GSAP's
  // default 0.5s duration would otherwise finish it in the first fifth of the
  // scroll and leave it sitting at its end state for the rest.
  const FULL = STEP_START + (steps.length - 1) * STEP_GAP + STEP_DUR;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "+=220%",
      pin,
      scrub: 1,
      anticipatePin: 1,
      // Driving the bar off trigger progress keeps it exact across the whole
      // range, rather than tracking a tween that can drift out of sync.
      onUpdate: (self) => gsap.set(progress, { scaleX: self.progress }),
    },
  });

  // Transforms only — animating width/height/top here would drop frames.
  tl.fromTo(
    image,
    { scale: 1.18, yPercent: -4 },
    { scale: 1, yPercent: 4, ease: "none", duration: FULL },
    0,
  );

  steps.forEach((step, i) => {
    const at = STEP_START + i * STEP_GAP;
    tl.to(step, { opacity: 1, y: 0, duration: STEP_DUR, ease: "power2.out" }, at);
    tl.to(
      step.querySelector("[data-rule]"),
      { scaleX: 1, duration: STEP_DUR, ease: "power2.out" },
      at,
    );
  });

  // The hero image changes page height once decoded, which moves every trigger
  // position below it.
  const img = image.querySelector("img");
  if (img && !img.complete) {
    img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }
}

// Generic entry reveal. Any [data-reveal] rises into place; adding
// [data-reveal-stagger] animates its children in sequence instead of as a block.
export function initReveals() {
  if (reduced) return;

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const marked = [...el.querySelectorAll("[data-seq-item]")];
    const targets = marked.length
      ? marked
      : el.hasAttribute("data-reveal-stagger")
        ? [...el.children]
        : [el];

    gsap.set(targets, { opacity: 0, y: 40 });

    targets.forEach((target, i) => {
      gsap.to(target, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        // Stagger only applies to items entering together, e.g. a row of cards.
        delay: i * 0.08,
        scrollTrigger: {
          // Each item triggers on itself, not on the container. One trigger for
          // the whole block fired on the container's top edge, which meant cards
          // further down animated while still below the fold and were finished
          // before the reader ever saw them.
          trigger: target,
          // Resolved as an absolute scroll position so it can be clamped. The
          // preferred point is 88% of the viewport — late enough that the item
          // is properly on screen before it moves. Items near the page end can
          // never reach that, so the clamp keeps them reachable instead of
          // leaving them stuck invisible, which is what stranded the footer.
          start: () => {
            const topAbs = target.getBoundingClientRect().top + window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - innerHeight;
            return Math.max(0, Math.min(topAbs - innerHeight * 0.88, maxScroll - 120));
          },
        },
      });
    });
  });
}

export function initStats() {
  const root = document.querySelector("[data-stats]");
  if (!root || reduced) return;

  const pin = root.querySelector("[data-stats-pin]");
  const heading = root.querySelector("[data-stats-heading]");
  const stats = [...root.querySelectorAll("[data-stat]")];

  gsap.set(stats, { opacity: 0.15, y: 24 });
  gsap.set(stats.map((s) => s.querySelector("[data-stat-rule]")), { scaleX: 0 });

  const STEP = 0.8;
  const DUR = 0.6;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "+=200%",
      pin,
      scrub: 1,
      anticipatePin: 1,
    },
  });

  stats.forEach((stat, i) => {
    const at = 0.2 + i * STEP;
    const out = stat.querySelector("[data-stat-num]");
    const to = parseFloat(stat.dataset.statTo);
    const decimals = parseInt(stat.dataset.statDecimals, 10) || 0;
    const prefix = stat.dataset.statPrefix || "";
    const suffix = stat.dataset.statSuffix || "";
    const counter = { v: 0 };

    tl.to(stat, { opacity: 1, y: 0, duration: DUR, ease: "power2.out" }, at);
    tl.to(stat.querySelector("[data-stat-rule]"), { scaleX: 1, duration: DUR, ease: "power2.out" }, at);
    // Counting the number rather than fading it in is what makes the figure feel
    // earned. onUpdate writes text, so it never touches layout-triggering props.
    tl.to(
      counter,
      {
        v: to,
        duration: DUR,
        ease: "power2.out",
        onUpdate: () => {
          out.textContent = prefix + counter.v.toFixed(decimals) + suffix;
        },
      },
      at,
    );
  });

  if (heading) {
    const split = new SplitText(heading, { type: "lines", mask: "lines", linesClass: "line" });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.1,
      scrollTrigger: { trigger: root, start: "top 60%" },
    });
  }
}

function initPageProgress() {
  const bar = document.querySelector("[data-page-progress]");
  if (!bar) return;
  if (reduced) {
    gsap.set(bar, { scaleX: 1 });
    return;
  }
  gsap.set(bar, { scaleX: 0 });
  gsap.to(bar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: () => document.body.scrollHeight - innerHeight, scrub: 0.4 },
  });
}

// Anchors are deliberately NOT intercepted — the browser's own jump cannot
// fail, and header overlap is handled by scroll-padding-top on the document.

// This module is its own entry point rather than a main.js import, so that a
// Firebase config failure cannot take the motion layer down with it.
//
// Everything waits for `load`. Tailwind arrives from a CDN and injects its
// styles asynchronously, so at module-execution time the page is still
// unstyled: elements have the wrong height, pins resolve to a collapsed
// layout and never register, and SplitText breaks lines at the wrong font
// size. Measuring after load is the difference between these triggers
// existing and silently doing nothing.
function start() {
  initHero();
  initClients();
  initArchitectureSection();
  initStats();

  // The pins above only add their spacing during a refresh. Until that happens
  // the document is several thousand pixels shorter, so anything below them
  // resolves its trigger against the wrong geometry — the methodology cards
  // computed a start of ~0, fired instantly, and were already fully revealed
  // before the reader ever reached them.
  ScrollTrigger.refresh();

  initReveals();
  initPageProgress();

  // Late-decoding images still shift the page after this point.
  ScrollTrigger.refresh();
}

if (document.readyState === "complete") start();
else window.addEventListener("load", start, { once: true });
