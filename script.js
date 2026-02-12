/* =========================
   Customize these
========================= */
const HER_NAME = "ቃልኪዳን"; // e.g. "Sara"
const YOUR_NAME = "እዮሲያስ";
const QUESTION = "will you be my valentine?";

/* Messages stay the same */
const NO_SNARK = [
  "No? ተይ እንዳይቆጭሽ",
  "Bae stop playing 😌",
  "Are you sure ? 👀",
  "You meant YES 😭💗",
  "አንቺ I’m not accepting that answer 😤",
  "faen! ",
  "Last chance… 😏"
];

/* =========================
   DOM
========================= */
const questionEl = document.getElementById("question");
const nameGlowEl = document.getElementById("nameGlow");
const subtextEl  = document.getElementById("subtext");
const signatureEl = document.getElementById("signature");
const hintEl = document.getElementById("hint");

const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");

const yayModal = document.getElementById("yayModal");
const replayBtn = document.getElementById("replayBtn");

const heartsLayer = document.getElementById("hearts");

/* =========================
   Set initial text
========================= */
nameGlowEl.textContent = HER_NAME;
questionEl.innerHTML = `<span class="glowName" id="nameGlow">${HER_NAME}</span>, ${QUESTION}`;
signatureEl.textContent = `— made with love by ${YOUR_NAME} 💌`;

/* =========================
   Floating hearts generator
========================= */
const HEARTS = ["❤","💗","💖","💘"];
function spawnHeart() {
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

  const left = Math.random() * 100; // vw
  const duration = 7 + Math.random() * 6; // seconds
  const drift = (Math.random() * 140 - 70) + "px";
  const scale = (0.7 + Math.random() * 0.9).toFixed(2);

  h.style.left = left + "vw";
  h.style.animationDuration = duration + "s";
  h.style.setProperty("--drift", drift);
  h.style.setProperty("--scale", scale);
  h.style.opacity = "0";

  heartsLayer.appendChild(h);

  // cleanup after animation
  setTimeout(() => h.remove(), (duration + 1) * 1000);
}

// subtle: spawn hearts slowly in background
let heartTimer = setInterval(spawnHeart, 450);

/* =========================
   NO button logic (free roam, stays on-screen)
========================= */
let noCount = 0;
let freeMode = false;

const dangerRadius = 120;
const cooldownMs = 140;
let lastMove = 0;

const EDGE_PAD = 26;

function viewportW() { return document.documentElement.clientWidth; }
function viewportH() { return document.documentElement.clientHeight; }

function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}

function punishNoAttempt() {
  noCount++;
  subtextEl.textContent = NO_SNARK[Math.min(noCount, NO_SNARK.length - 1)];
  if (noCount >= 2) hintEl.textContent = "Yeah… it’s not happening 😭";
}

function enableFreeModeIfNeeded() {
  if (freeMode) return;
  freeMode = true;

  const r = noBtn.getBoundingClientRect();
  noBtn.classList.add("free");
  noBtn.style.left = `${r.left}px`;
  noBtn.style.top  = `${r.top}px`;

  clampNoToViewport();
}

/* keep current NO inside safe viewport */
function clampNoToViewport() {
  if (!freeMode) return;

  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;

  const minX = EDGE_PAD;
  const minY = EDGE_PAD;
  const maxX = Math.max(minX, viewportW() - btnW - EDGE_PAD);
  const maxY = Math.max(minY, viewportH() - btnH - EDGE_PAD);

  const rect = noBtn.getBoundingClientRect();
  const left = Number.parseFloat(noBtn.style.left || rect.left);
  const top  = Number.parseFloat(noBtn.style.top  || rect.top);

  noBtn.style.left = `${clamp(left, minX, maxX)}px`;
  noBtn.style.top  = `${clamp(top,  minY, maxY)}px`;
}

function overlaps(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

/* move NO anywhere inside safe bounds; avoid YES; clamp after paint */
const SAFE_MARGIN = 120; // how far from screen edges (increase if you want)

function moveNoAnywhereSafe() {
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;
  const yesRect = yesBtn.getBoundingClientRect();

  const viewW = document.documentElement.clientWidth;
  const viewH = document.documentElement.clientHeight;

  const minX = SAFE_MARGIN;
  const minY = SAFE_MARGIN;

  const maxX = viewW - btnW - SAFE_MARGIN;
  const maxY = viewH - btnH - SAFE_MARGIN;

  let x, y;

  for (let i = 0; i < 80; i++) {
    const rx = minX + Math.random() * (maxX - minX);
    const ry = minY + Math.random() * (maxY - minY);

    const candidate = {
      left: rx,
      top: ry,
      right: rx + btnW,
      bottom: ry + btnH
    };

    // avoid YES overlap
    if (!(
      candidate.right > yesRect.left &&
      candidate.left < yesRect.right &&
      candidate.bottom > yesRect.top &&
      candidate.top < yesRect.bottom
    )) {
      x = rx;
      y = ry;
      break;
    }
  }

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
}


function tryEscape(clientX, clientY) {
  const now = Date.now();
  if (now - lastMove < cooldownMs) return;

  const r = noBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const dist = Math.hypot(clientX - cx, clientY - cy);

  if (dist < dangerRadius) {
    lastMove = now;
    enableFreeModeIfNeeded();
    punishNoAttempt();
    moveNoAnywhereSafe();
  }
}

/* Desktop */
document.addEventListener("mousemove", (e) => {
  tryEscape(e.clientX, e.clientY);
});

/* Mobile */
document.addEventListener("touchmove", (e) => {
  if (!e.touches || e.touches.length === 0) return;
  const t = e.touches[0];
  tryEscape(t.clientX, t.clientY);
}, { passive: true });

/* direct interactions */
noBtn.addEventListener("mouseenter", () => {
  enableFreeModeIfNeeded();
  punishNoAttempt();
  moveNoAnywhereSafe();
});

noBtn.addEventListener("touchstart", () => {
  enableFreeModeIfNeeded();
  punishNoAttempt();
  moveNoAnywhereSafe();
}, { passive: true });

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  enableFreeModeIfNeeded();
  punishNoAttempt();
  moveNoAnywhereSafe();
});

/* =========================
   YES -> change background + confetti + modal
========================= */
yesBtn.addEventListener("click", () => {
  document.body.classList.add("celebrate"); // background switches here
  yayModal.classList.remove("hidden");
  runConfetti();
});

/* Replay -> reset */
replayBtn.addEventListener("click", () => {
  yayModal.classList.add("hidden");
  document.body.classList.remove("celebrate");

  noCount = 0;
  subtextEl.textContent = "Don’t overthink it 😌";
  hintEl.textContent = "Tip: try hovering “No” 😏";

  freeMode = false;
  noBtn.classList.remove("free");
  noBtn.style.left = "";
  noBtn.style.top = "";
});

/* keep NO safe on resize */
window.addEventListener("resize", () => clampNoToViewport());

/* =========================
   Confetti
========================= */
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let animId = null;

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewportW() * dpr);
  canvas.height = Math.floor(viewportH() * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", setupCanvas);
setupCanvas();

function runConfetti() {
  const pieces = Array.from({ length: 260 }, () => ({
    x: Math.random() * viewportW(),
    y: -20 - Math.random() * 600,
    s: 4 + Math.random() * 8,
    vx: -2.5 + Math.random() * 5,
    vy: 2 + Math.random() * 7,
    r: Math.random() * Math.PI,
    vr: -0.25 + Math.random() * 0.5
  }));

  const start = performance.now();
  const duration = 2400;

  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, viewportW(), viewportH());

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = 0.95;
      ctx.fillRect(-p.s, -p.s, p.s * 2, p.s * 2);
      ctx.restore();
    });

    if (elapsed < duration) animId = requestAnimationFrame(frame);
    else {
      ctx.clearRect(0, 0, viewportW(), viewportH());
      cancelAnimationFrame(animId);
    }
  }

  animId = requestAnimationFrame(frame);
}
