/**
 * main.js — Rishabh Tripathi Portfolio
 * Dynamic interactions: cursor, noise, counters, scroll reveal, nav
 */

'use strict';

/* ─── THEME ─── */
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

(function initTheme() {
  const saved = localStorage.getItem('rt-theme');

  // Default = DARK
  if (saved) {
    html.dataset.theme = saved;
  } else {
    html.dataset.theme = 'dark';
  }
})();

themeBtn.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('rt-theme', next);
});

/* ─── CUSTOM CURSOR ─── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');

// Hide cursor on touch or reduced motion preference
if (isTouchDevice() || prefersReducedMotion) {
  cursor.style.display = 'none';
  cursorTrail.style.display = 'none';
}

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.13;
  trailY += (mouseY - trailY) * 0.13;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

/* Scale cursor on interactive elements */
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.2)';
    cursorTrail.style.opacity = '0.15';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursorTrail.style.opacity = '0.35';
  });
});

/* ─── NOISE CANVAS ─── */
(function generateNoise() {
  const canvas = document.getElementById('noise');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawNoise();
  }

  function drawNoise() {
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);
})();

/* ─── NAV VISIBLE + SCROLL STATE ─── */
const nav  = document.getElementById('nav');
const prog = document.getElementById('prog');
let scrollTick = false;

setTimeout(() => nav.classList.add('vis'), 300);

window.addEventListener('scroll', () => {
  if (scrollTick) return;
  requestAnimationFrame(() => {
    const y     = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;

    prog.style.width = (y / total * 100) + '%';
    nav.classList.toggle('sc', y > 60);

    scrollTick = false;
  });
  scrollTick = true;
}, { passive: true });

/* ─── ACTIVE NAV ─── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const navIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => navIO.observe(s));

/* ─── SCROLL REVEAL ─── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const d = +e.target.dataset.delay || +e.target.dataset.d || 0;
    setTimeout(() => e.target.classList.add('in'), d);
    revealIO.unobserve(e.target);
  });
}, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.rv').forEach((el, i) => {
  const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('rv'));
  const idx = siblings.indexOf(el);
  if (!el.dataset.delay) el.dataset.d = idx * 65;
  revealIO.observe(el);
});

/* ─── COUNTER ANIMATION ─── */
function countUp(el) {
  const to  = parseInt(el.dataset.to, 10);
  const sfx = el.dataset.sfx || '';
  const dur  = 1600;
  let t0 = null;

  const easeOut = p => 1 - Math.pow(1 - p, 3);

  function step(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    el.textContent = Math.floor(easeOut(p) * to) + (p === 1 ? sfx : '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('[data-to]').forEach(countUp);
    counterIO.unobserve(e.target);
  });
}, { threshold: 0.4 });

const heroEl = document.getElementById('hero');
if (heroEl) counterIO.observe(heroEl);

/* ─── SMOOTH ANCHOR SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── PARALLAX ORBS on mousemove ─── */
const orbs = document.querySelectorAll('.hero-orb');
if (!prefersReducedMotion) {
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 14;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });
}

/* ─── GLASS PROJ GLOW FOLLOW ─── */
if (!prefersReducedMotion) {
  document.querySelectorAll('.glass-proj').forEach(proj => {
    proj.addEventListener('mousemove', e => {
      const rect  = proj.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const glow  = proj.querySelector('.proj-glow');
      if (glow) {
        glow.style.left = (x - 150) + 'px';
        glow.style.top  = (y - 150) + 'px';
      }
    });
  });
}

/* ─── ARCH NODE HIGHLIGHT — show flow up to hovered node ─── */
document.querySelectorAll('.arch-flow').forEach(flow => {
  const nodes = flow.querySelectorAll('.arch-n');
  nodes.forEach((node, i) => {
    node.addEventListener('mouseenter', () => {
      nodes.forEach((n, j) => {
        n.style.opacity = j <= i ? '1' : '0.3';
      });
    });
    node.addEventListener('mouseleave', () => {
      nodes.forEach(n => n.style.opacity = '1');
    });
  });
});

/* ─── HAMBURGER MOBILE MENU ─── */
const menuBtn    = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
  function openMenu() {
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    nav.classList.add('menu-open');
  }
  function closeMenu() {
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    nav.classList.remove('menu-open');
  }

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on any menu link tap
  mobileMenu.querySelectorAll('.mm-link, .mm-resume').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Close on backdrop tap (outside mm-inner)
  mobileMenu.addEventListener('click', e => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ─── MARQUEE pause on hover ─── */
const marqueeInner = document.querySelector('.marquee-inner');
if (marqueeInner) {
  marqueeInner.addEventListener('mouseenter', () => {
    marqueeInner.style.animationPlayState = 'paused';
  });
  marqueeInner.addEventListener('mouseleave', () => {
    marqueeInner.style.animationPlayState = 'running';
  });
}

/* ─── TILT on achievement cards ─── */
if (!prefersReducedMotion) {
  document.querySelectorAll('.ach-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
