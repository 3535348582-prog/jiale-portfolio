/* Localised edge glass: no pointer interception, no idle animation loop. */
(() => {
  'use strict';
  if (document.getElementById('edgeGlass')) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const host = document.createElement('div');
  host.id = 'edgeGlass'; host.setAttribute('aria-hidden', 'true');
  const sides = ['left', 'right', 'top', 'bottom'];
  const lenses = sides.map(side => {
    const element = document.createElement('i');
    element.className = 'eg-lens eg-' + side;
    host.append(element);
    return {element, strength:0, target:0, position:0, next:0};
  });
  document.body.append(host);
  let width = innerWidth, height = innerHeight, raf = 0, last = 0;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function allowed() { return fine.matches && !reduce.matches && !document.hidden; }
  function paint(lens) {
    lens.element.style.setProperty('--eg-strength', lens.strength.toFixed(3));
    lens.element.style.setProperty('--eg-stretch', (.35 + .65 * lens.strength).toFixed(3));
    lens.element.style.setProperty('--eg-position', lens.position.toFixed(1) + 'px');
  }
  function frame(now) {
    const dt = last ? Math.min(34, now - last) : 16;
    last = now;
    const ease = 1 - Math.exp(-dt / 88);
    let unsettled = false, visible = false;
    for (const lens of lenses) {
      lens.strength += (lens.target - lens.strength) * ease;
      lens.position += (lens.next - lens.position) * ease;
      if (Math.abs(lens.strength - lens.target) < .002) lens.strength = lens.target;
      if (Math.abs(lens.position - lens.next) < .2) lens.position = lens.next;
      paint(lens);
      visible ||= lens.strength > .003;
      unsettled ||= Math.abs(lens.strength - lens.target) > .002 ||
        (lens.strength > .003 && Math.abs(lens.position - lens.next) > .2);
    }
    host.dataset.active = String(visible);
    if (unsettled) raf = requestAnimationFrame(frame);
    else { raf = 0; last = 0; }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }
  function release() { for (const lens of lenses) lens.target = 0; schedule(); }
  function move(event) {
    if (event.pointerType !== 'mouse') return;
    if (!allowed() || document.documentElement.classList.contains('pov-travelling')) { release(); return; }
    const x = event.clientX, y = event.clientY;
    const distances = [x, width - x, y, height - y];
    for (let i = 0; i < lenses.length; i++) {
      const lens = lenses[i], vertical = i < 2;
      const proximity = clamp(1 - distances[i] / 92, 0, 1);
      lens.target = proximity * proximity * (3 - 2 * proximity);
      lens.next = clamp(vertical ? y : x, 20, (vertical ? height : width) - 20) - 110;
      if (lens.strength === 0) lens.position = lens.next;
    }
    schedule();
  }
  addEventListener('pointermove', move, {passive:true});
  document.documentElement.addEventListener('pointerleave', release, {passive:true});
  addEventListener('blur', release);
  addEventListener('resize', () => { width = innerWidth; height = innerHeight; release(); }, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      for (const lens of lenses) { lens.strength = 0; lens.target = 0; paint(lens); }
      host.dataset.active = 'false';
    }
  });
  fine.addEventListener('change', release); reduce.addEventListener('change', release);
  host.dataset.active = 'false';
})();
