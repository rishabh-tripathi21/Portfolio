/* ============================================================
   main.js — Portfolio interactions
   ============================================================ */

'use strict';

// ─── LOADER ───────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hide');
  }, 1500);
});

// ─── THEME TOGGLE ─────────────────────────────────────────
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('portfolio-theme');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
}

if (savedTheme) {
  applyTheme(savedTheme);
} else if (prefersDark.matches) {
  applyTheme('dark');
}

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// ─── SCROLL PROGRESS BAR ──────────────────────────────────
const progressBar = document.getElementById('scroll-progress');
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

// ─── BACK TO TOP ──────────────────────────────────────────
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (backToTop) {
    if (window.scrollY > 400) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  }
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── ACTIVE NAV SECTION ───────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-item[data-section], .mob-nav-item[data-section]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-section') === id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

// ─── SMOOTH SCROLL FOR NAV LINKS ──────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 24;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── INTERSECTION OBSERVER — REVEAL ANIMATIONS ────────────
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ─── COUNTER ANIMATIONS ───────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target], .ach-counter[data-target]').forEach(el => {
  counterObserver.observe(el);
});

// ─── TILT EFFECT ON PROJECT CARDS ─────────────────────────
function addTilt(card) {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const tiltX = y * -8;
    const tiltY = x * 8;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.15s ease';
  });
}

// Only on non-touch devices
if (!('ontouchstart' in window)) {
  document.querySelectorAll('[data-tilt]').forEach(addTilt);
}

// ─── LAZY LOADING IMAGES ──────────────────────────────────
if ('loading' in HTMLImageElement.prototype) {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.src = img.dataset.src || img.src;
  });
} else {
  const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        lazyObserver.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => lazyObserver.observe(img));
}

// ─── SKILL BADGE STAGGER ANIMATION ───────────────────────
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const badges = entry.target.querySelectorAll('.skill-badge');
      badges.forEach((badge, i) => {
        setTimeout(() => {
          badge.style.opacity = '1';
          badge.style.transform = 'translateY(0)';
        }, i * 60);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-category').forEach(cat => {
  const badges = cat.querySelectorAll('.skill-badge');
  badges.forEach(badge => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(8px)';
    badge.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  });
  skillObserver.observe(cat);
});

// ─── SIDEBAR ACTIVE ON SCROLL (DESKTOP) ───────────────────
// Already handled by sectionObserver above

// ─── MOBILE SIDEBAR TOGGLE (HAMBURGER) ────────────────────
// Using bottom nav on mobile — no hamburger needed

// ─── PARALLAX BG GRADIENT ─────────────────────────────────
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      document.body.style.setProperty('--scroll-y', `${y}px`);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ─── HERO CARD MOUSE PARALLAX ────────────────────────────
const heroCard = document.querySelector('.hero-card');
if (heroCard && !('ontouchstart' in window)) {
  heroCard.addEventListener('mousemove', e => {
    const rect = heroCard.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    const ill = heroCard.querySelector('.hero-illustration');
    if (ill) {
      ill.style.transform = `translate(${x * 12}px, ${y * 8}px)`;
      ill.style.transition = 'transform 0.2s ease';
    }
  });
  heroCard.addEventListener('mouseleave', () => {
    const ill = heroCard.querySelector('.hero-illustration');
    if (ill) {
      ill.style.transform = '';
      ill.style.transition = 'transform 0.6s ease';
    }
  });
}

// ─── CURSOR BLINK IN HERO SVG ────────────────────────────
// Animated via CSS SVG animation - handled natively

// ─── PAGE TRANSITION ─────────────────────────────────────
document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"])').forEach(link => {
  link.addEventListener('click', e => {
    // Allow normal navigation
  });
});

// ─── RESIZE: RECALCULATE THINGS ──────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Re-trigger observer checks on resize if needed
  }, 200);
});

// ─── KEYBOARD NAVIGATION ─────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// ─── FOCUS STYLES FOR KEYBOARD NAV ──────────────────────
const style = document.createElement('style');
style.textContent = `
  .keyboard-nav :focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
    border-radius: 6px;
  }
`;
document.head.appendChild(style);

// ─── TECH BADGE HOVER GLOW ───────────────────────────────
document.querySelectorAll('.tech-badge').forEach(badge => {
  badge.addEventListener('mouseenter', () => {
    badge.style.boxShadow = '0 0 0 3px rgba(90,103,216,0.15)';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.boxShadow = '';
  });
});

// ─── CONTACT ITEM RIPPLE ─────────────────────────────────
document.querySelectorAll('.contact-item').forEach(item => {
  item.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(90,103,216,0.15); border-radius:50%;
      transform:scale(0); animation:ripple 0.5s ease;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }`;
document.head.appendChild(rippleStyle);

// ─── STAT CARD HOVER ─────────────────────────────────────
document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px) scale(1.02)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── TIMELINE ANIMATED DOTS ──────────────────────────────
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
      }, i * 120);
      tlObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.timeline-dot').forEach(dot => {
  dot.style.opacity = '0';
  dot.style.transform = 'scale(0)';
  dot.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
  tlObserver.observe(dot);
});

// ─── INIT LOG ────────────────────────────────────────────
console.log('%c Rishabh Tripathi Portfolio ', 'background: linear-gradient(135deg, #5A67D8, #7C3AED); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;');
console.log('%c AI/ML Enthusiast & Backend Developer ', 'color: #5A67D8; font-size: 12px;');
