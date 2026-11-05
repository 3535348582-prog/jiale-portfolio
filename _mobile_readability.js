(() => {
  'use strict';
  const header = document.querySelector('header'), nav = header?.querySelector('.navlinks');
  if (!nav || header.classList.contains('mobile-nav-ready')) return;
  const mq = matchMedia('(max-width:1100px)');
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'mobile-menu-toggle';
  nav.id ||= 'portfolioMainNavigation';
  toggle.setAttribute('aria-controls', nav.id);
  nav.before(toggle); header.classList.add('mobile-nav-ready');
  const isEn = () => document.documentElement.lang.startsWith('en');
  function setOpen(open, restoreFocus = false) {
    header.classList.toggle('mobile-nav-open', open && mq.matches);
    toggle.setAttribute('aria-expanded', String(open && mq.matches));
    toggle.textContent = open && mq.matches ? (isEn() ? 'Close ×' : '收起 ×') : (isEn() ? 'Menu ☰' : '菜单 ☰');
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setOpen(!header.classList.contains('mobile-nav-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', e => { if (!header.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && header.classList.contains('mobile-nav-open')) {setOpen(false, true); e.preventDefault();}
  });
  mq.addEventListener('change', () => setOpen(false));
  addEventListener('portfolio-language-change', () => setOpen(header.classList.contains('mobile-nav-open')));
  setOpen(false);
  // Reserve room for larger or translated copy without moving the illustration.
  const copy = document.querySelector('.space-copy'), hero = document.querySelector('.cosmic-hero');
  if (copy && hero) {
    new ResizeObserver(() => {
      const bottom = copy.getBoundingClientRect().bottom - hero.getBoundingClientRect().top;
      hero.style.setProperty('--mobile-copy-extra', Math.max(0, Math.ceil(bottom + 34 - 416)) + 'px');
    }).observe(copy);
  }
  window.mobileReadabilityReady = true;
})();
