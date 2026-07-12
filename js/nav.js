/**
 * nav.js — Shared navigation for all protected pages (Dashboard, Clients, Profile)
 */

import { getTheme, saveTheme, getSession, clearSession, getCurrentUser } from './storage.js';
import { showToast } from './toast.js';
import { $, $$ } from './utils.js';

export function initNav() {
  applyTheme();
  setActiveNavLink();
  setupThemeToggle();
  setupLogout();
  setupEasterEgg();
  initSessionTimer();
  renderNavAvatar();
}

function applyTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const btn = $('#theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function setupThemeToggle() {
  const btn = $('#theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    updateThemeIcon(next);
  });
}

function setActiveNavLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function setupLogout() {
  const avatarBtn = $('#logout-btn');
  const dropdown  = $('#logout-dropdown');
  const actualBtn = $('#actual-logout-btn');
  if (!avatarBtn || !dropdown || !actualBtn) return;

  avatarBtn.addEventListener('click', e => {
    e.stopPropagation();
    const show = dropdown.style.display === 'none';
    dropdown.style.display = show ? 'block' : 'none';
  });

  actualBtn.addEventListener('click', () => {
    clearSession();
    window.location.href = 'index.html';
  });

  window.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
}

function setupEasterEgg() {
  const logo = $('#nav-logo');
  if (!logo) return;

  let clicks = 0;
  let timer  = null;

  logo.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 2000);

    if (clicks >= 5) {
      clicks = 0;
      showToast('🎉 Easter Egg unlocked! You found the secret! 🥚', 'success', 4000);
      launchConfetti();
    }
  });
}

function launchConfetti() {
  const emojis = ['🎉', '⭐', '🚀', '✨', '🎊', '💥', '🏆'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('span');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = `
      position:fixed;
      top:-2rem;
      left:${Math.random() * 100}vw;
      font-size:${1.2 + Math.random() * 1.5}rem;
      animation: confettiFall ${1.5 + Math.random() * 2}s ease-in forwards;
      pointer-events:none;
      z-index:9999;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function initSessionTimer() {
  const el = $('#session-duration');
  if (!el) return;

  const session = getSession();
  if (!session || !session.loginAt) return;

  const loginTime = new Date(session.loginAt).getTime();

  const update = () => {
    const diff = Math.floor((Date.now() - loginTime) / 1000);
    const mins = String(Math.floor(diff / 60)).padStart(2, '0');
    const secs = String(diff % 60).padStart(2, '0');
    el.textContent = `Session: ${mins}:${secs}`;
  };

  update();
  setInterval(update, 1000);
}

export function renderNavAvatar() {
  const initialsEl = $('#nav-avatar-initials');
  const imgEl      = $('#nav-avatar-img');
  if (!initialsEl || !imgEl) return;

  const user = getCurrentUser();
  if (!user) return;

  if (user.avatar) {
    initialsEl.style.display = 'none';
    imgEl.src = user.avatar;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
    initialsEl.style.display = 'flex';

    initialsEl.textContent = user.fullName
      .split(' ')
      .map(w => w[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const gradients = [
      'linear-gradient(135deg, #6c63ff, #a78bfa)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)'
    ];
    const activeGrad = localStorage.getItem('crm_avatar_gradient') || 0;
    initialsEl.style.background = gradients[activeGrad];
  }
}
