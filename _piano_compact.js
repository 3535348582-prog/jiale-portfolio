/* A compact seated-pianist vignette. Original keys and audio handlers are reused. */
(() => {
  'use strict';
  function mount() {
    const rail = document.getElementById('pianoRail');
    if (!rail || rail.classList.contains('piano-compact')) return !!rail;
    const stage = rail.querySelector('.pr-stage'), keys = rail.querySelector('.pr-keys');
    const base = rail.querySelector('.pr-base'), head = rail.querySelector('.pr-head');
    if (!stage || !keys || !base || !head) return false;
    rail.classList.add('piano-compact'); document.body.classList.add('piano-compact-mounted');
    const scene = document.createElement('div'); scene.className = 'cp-scene';
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.classList.add('cp-illustration'); svg.setAttribute('viewBox', '0 0 600 320');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <defs>
        <linearGradient id="cpLacquer" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#213344"/><stop offset=".44" stop-color="#0b151e"/><stop offset="1" stop-color="#03070c"/></linearGradient>
        <linearGradient id="cpLid" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#2e4253"/><stop offset=".45" stop-color="#0d1924"/><stop offset="1" stop-color="#071019"/></linearGradient>
        <linearGradient id="cpApron" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#162736"/><stop offset=".25" stop-color="#0a141e"/><stop offset="1" stop-color="#03080e"/></linearGradient>
        <linearGradient id="cpSkin" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#ead9ce"/><stop offset=".48" stop-color="#cbb8ae"/><stop offset="1" stop-color="#927f79"/></linearGradient>
        <linearGradient id="cpFarSkin" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#c5c5c7"/><stop offset=".6" stop-color="#a7a9b3"/><stop offset="1" stop-color="#747e8d"/></linearGradient>
        <linearGradient id="cpLeg" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#03070b"/><stop offset=".45" stop-color="#24313c"/><stop offset="1" stop-color="#070c12"/></linearGradient>
        <mask id="cpBodyMask"><rect width="596" height="658" fill="white"/><rect x="240" y="350" width="356" height="79" fill="black"/><rect x="407" y="322" width="189" height="107" fill="black"/></mask>
      </defs>
      <ellipse cx="311" cy="294" rx="270" ry="19" fill="#000" opacity=".36"/>
      <ellipse cx="291" cy="293" rx="211" ry="10" fill="#344e61" opacity=".08"/>
      <g class="cp-piano-back">
        <path d="M155 180 406 149C449 148 507 128 538 131 564 134 574 151 561 173 550 193 516 205 479 215L181 232Z" fill="url(#cpLacquer)" stroke="#344957" stroke-width="1.1"/>
        <path d="M187 130 433 43 558 103 406 151Z" fill="url(#cpLid)" stroke="#536675" stroke-width="1.1"/>
        <path d="M194 129 434 48 548 103 406 146Z" fill="none" stroke="#6e7c83" stroke-opacity=".22"/>
        <path d="m408 151 24-86" stroke="#171d22" stroke-width="5"/><path d="m409 150 24-85" stroke="#889393" stroke-width="1"/>
        <path d="M430 151C483 146 526 132 547 143 561 151 554 167 539 177" fill="none" stroke="#597586" stroke-opacity=".27"/>
        <path d="m524 199 10 74-8 3-14-73Z" fill="url(#cpLeg)" stroke="#2b3b45" stroke-width=".7"/>
        <path d="m526 273 9-1 1 4-11 2Z" fill="#967a49"/>
        <path d="m397 221 3 62-8 2-4-62Z" fill="url(#cpLeg)"/>
        <path d="m390 282 11-1v4l-12 2Z" fill="#967a49"/>
      </g>
      <g class="cp-bench">
        <path d="M42 221 100 214 122 223 63 232Z" fill="#3b302b" stroke="#78685a" stroke-width=".7"/>
        <path d="m43 222 20 11 59-8v6l-59 9-20-11Z" fill="#0e1116"/>
        <path d="m51 232 5 57 6 2-3-57m50-5 2 54 6-1-1-55" fill="url(#cpLeg)" stroke="#29353d" stroke-width=".7"/>
      </g>
      <g class="cp-person" transform="translate(-4 15) scale(.42)">
        <image class="cp-body-image" width="596" height="658" mask="url(#cpBodyMask)"/>
        <image class="cp-head-image" x="109.6" y="-68.8455" width="424.7" height="336.1455"/>
        <g class="cp-arm cp-arm-far" fill="url(#cpFarSkin)" stroke="#535c6a" stroke-width="1.2" stroke-linejoin="round">
          <path d="M402 327C417 328 437 334 456 335L481 342C492 346 500 354 505 362L495 372 462 364C441 355 420 350 405 348Z"/>
          <path data-finger="right-thumb" class="cp-finger cp-finger-1" d="M469 355C478 367 487 372 498 376L507 379Q512 383 508 387C500 390 488 382 480 378L462 365Z"/>
          <path data-finger="right-little" class="cp-finger cp-finger-2" d="M477 343C496 342 511 345 518 352L528 366Q531 373 526 375C521 377 518 369 512 364L501 358 482 357Z"/>
          <path data-finger="right-ring" class="cp-finger cp-finger-3" d="M490 343C513 340 530 345 538 354L548 372Q550 379 544 380C538 381 537 372 533 367L520 359 498 358Z"/>
          <path data-finger="right-middle" class="cp-finger cp-finger-4" d="M505 344C528 342 548 349 555 360L565 379Q567 386 561 387C555 388 554 380 550 374L539 363 514 360Z"/>
          <path data-finger="right-index" class="cp-finger cp-finger-5" d="M520 349C545 349 561 355 569 366L579 385Q581 392 575 393C570 394 568 386 564 381L551 370 528 364Z"/>
          <path d="m413 331 32 12m12-6 28 8" fill="none" stroke="#f0e4df" stroke-opacity=".35"/>
        </g>
        <g class="cp-arm cp-arm-near" fill="url(#cpSkin)" stroke="#655750" stroke-width="1.2" stroke-linejoin="round">
          <path d="M249 345C269 348 292 352 319 352L359 354C377 355 392 363 399 372L390 389C366 391 341 381 321 379L251 371Z"/>
          <path data-finger="left-thumb" class="cp-finger cp-finger-1" d="M329 370C335 385 345 390 358 392L372 395Q379 398 375 404C369 411 351 403 343 400 330 394 321 384 319 377Z"/>
          <path data-finger="left-little" class="cp-finger cp-finger-2" d="M348 367C360 370 368 379 373 390L380 407Q382 413 377 416C371 418 368 409 366 404L357 390 341 382Z"/>
          <path data-finger="left-ring" class="cp-finger cp-finger-3" d="M362 364C377 369 386 378 390 389L397 409Q399 416 393 418C387 419 385 411 383 405L375 391 357 379Z"/>
          <path data-finger="left-middle" class="cp-finger cp-finger-4" d="M377 364C392 369 403 379 408 391L416 407Q418 414 412 416C406 417 404 409 402 404L393 389 372 378Z"/>
          <path data-finger="left-index" class="cp-finger cp-finger-5" d="M390 365C406 368 417 376 423 385L432 396Q435 402 430 406C424 409 420 402 417 398L406 386 386 378Z"/>
          <path d="m259 351 58 9m18 2 24 1" fill="none" stroke="#fff0e3" stroke-opacity=".35"/>
        </g>
      </g>
      <g class="cp-piano-front">
        <path d="m153 194 262-31 10 44-245 40-27-13Z" fill="url(#cpApron)" stroke="#243949" stroke-width="1"/>
        <path d="m158 199 258-31" stroke="#74848a" stroke-opacity=".7"/>
        <path d="m179 241 11 3-2 47-9 1Z" fill="url(#cpLeg)" stroke="#30404b" stroke-width=".6"/>
        <path d="m179 288 9-1 1 4-10 2Z" fill="#967a49"/>
        <path d="m278 231 2 32m-8-2 5 4 20-2 3-4" fill="none" stroke="#79694c" stroke-width="3"/>
        <path d="m270 264 10-1m3-1 10-1m3-1 9-1" stroke="#b99d64" stroke-width="3.5" stroke-linecap="round"/>
        <text x="331" y="205" fill="#ae9b70" font-family="Georgia,serif" font-size="8" letter-spacing="3" transform="rotate(-7 331 205)">JIALE</text>
      </g>`;
    svg.querySelector('.cp-body-image').setAttribute('href', base.src);
    svg.querySelector('.cp-head-image').setAttribute('href', 'assets/piano-head-complete.png');
    // A tiny engraved Leo on the curved tail, clear of the JIALE fallboard.
    function mountLeoEmblem() {
      const leo = window.portfolioConstellations?.find(c => c.id === 'Leo');
      if (!leo || svg.querySelector('.cp-leo-emblem')) return;
      const emblem = document.createElementNS(ns, 'g');
      emblem.classList.add('cp-leo-emblem');
      emblem.setAttribute('transform', 'translate(468 143) rotate(-9) scale(.34)');
      emblem.setAttribute('data-constellation', 'Leo');
      for (const points of leo.paths) {
        const line = document.createElementNS(ns, 'polyline');
        line.setAttribute('points', points.map(p => p.join(',')).join(' '));
        line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#c5ac76');
        line.setAttribute('stroke-width', '1.5'); emblem.append(line);
      }
      for (const [x,y] of leo.points) {
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', '2.1');
        dot.setAttribute('fill', '#e2c68a'); emblem.append(dot);
      }
      const label = document.createElementNS(ns, 'text');
      label.classList.add('cp-leo-label'); label.setAttribute('x', '95'); label.setAttribute('y', '141');
      label.setAttribute('text-anchor', 'middle'); label.setAttribute('fill', '#c5ac76');
      label.setAttribute('font-size', '17'); label.textContent = '狮子座 · LEO';
      emblem.append(label); svg.querySelector('.cp-piano-back').append(emblem);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountLeoEmblem, {once:true});
    else mountLeoEmblem();
    scene.append(svg);
    // The exact original elements carry all 88 existing pointer/audio handlers.
    // Their transforms are visual only; the piano synth and music controls stay intact.
    scene.append(keys); stage.prepend(scene);
    // Refined skin artwork is a separate layer ABOVE the keybed. The shared
    // image is clipped on opposite sides of the inter-arm gap and aligned to
    // the existing sleeve openings; original raster pixels remain unchanged.
    const hands = document.createElementNS(ns, 'svg');
    hands.classList.add('cp-refined-hands');
    hands.setAttribute('viewBox', '0 0 600 320'); hands.setAttribute('aria-hidden', 'true');
    hands.innerHTML = `<defs>
      <clipPath id="cpNearHandClip" clipPathUnits="userSpaceOnUse"><path d="M0 385L1669 802.25V942H0Z"/></clipPath>
      <clipPath id="cpFarHandClip" clipPathUnits="userSpaceOnUse"><path d="M0 0H1669V802.25L0 385Z"/></clipPath>
    </defs>
    <g class="cp-refined-far"><g transform="matrix(.287 0 0 .287 52 30)"><image href="assets/piano-hands-refined.png" width="1669" height="942" clip-path="url(#cpFarHandClip)"/></g></g>
    <g class="cp-refined-near"><g transform="matrix(.29 0 0 .29 30 26)"><image href="assets/piano-hands-refined.png" width="1669" height="942" clip-path="url(#cpNearHandClip)"/></g></g>`;
    scene.append(hands);

    // The original keyboard was laid out before its compact 260px container
    // existed. Reposition the same nodes, preserving all synth/pointer handlers.
    function layoutCompactKeys() {
      const step = (keys.clientWidth || 260) / 52;
      const black = new Set([1, 3, 6, 8, 10]);
      let white = 0;
      keys.querySelectorAll('.pr-key').forEach(key => {
        if (black.has(Number(key.dataset.midi) % 12)) {
          key.style.left = (white * step - step * .3) + 'px';
          key.style.width = Math.max(1, step * .6) + 'px';
        } else {
          key.style.left = (white * step) + 'px';
          key.style.width = step + 'px'; white++;
        }
      });
    }
    const resize = () => { rail.style.setProperty('--cp-scale', String(rail.clientWidth / 600)); layoutCompactKeys(); };
    new ResizeObserver(resize).observe(rail);
    new MutationObserver(layoutCompactKeys).observe(keys, {childList:true});
    resize();
    const audio = window.portfolioMusic && window.portfolioMusic.audio;
    function syncPlaying() { rail.classList.toggle('cp-playing', !!audio && !audio.paused); }
    if (audio) ['play','pause','ended'].forEach(name => audio.addEventListener(name, syncPlaying));
    syncPlaying();
    keys.addEventListener('pointerdown', e => {
      const key = e.target.closest('.pr-key'); if (!key) return;
      const hand = Number(key.dataset.midi) < 65 ? 'near' : 'far';
      rail.dataset.cpTouch = hand;
      setTimeout(() => { if (rail.dataset.cpTouch === hand) delete rail.dataset.cpTouch; }, 280);
    });
    // Reuse the original folding controls; folding never changes audio playback.
    const collapse = rail.querySelector('.pr-collapse'), expand = rail.querySelector('.pr-expand');
    const body = rail.querySelector('.pr-body'), hero = document.querySelector('.cosmic-hero');
    const smallScreen = matchMedia('(max-width:760px)');
    let zone = '', preference = null, openedAt = 0, applying = false, pending = false, foldTimer = 0;
    function syncFoldAccessibility() {
      const folded = rail.classList.contains('collapsed');
      const english = document.documentElement.lang.startsWith('en');
      body.inert = folded || rail.classList.contains('cp-fading');
      body.setAttribute('aria-hidden', String(folded));
      if (!body.id) body.id = 'compactPianoBody';
      [collapse, expand].forEach(button => {
        button.setAttribute('aria-controls', body.id);
        button.setAttribute('aria-expanded', String(!folded));
      });
      collapse.setAttribute('aria-label', english ? 'Collapse piano' : '收起钢琴');
      expand.setAttribute('aria-label', english ? 'Expand piano and music controls' : '展开钢琴与音乐控制');
      expand.title = english ? 'Piano and music' : '钢琴与音乐';
    }
    function fold(value) {
      if (value && !rail.classList.contains('collapsed')) {
        if (foldTimer) return;
        rail.classList.add('cp-fading'); body.inert = true;
        foldTimer = setTimeout(() => {
          foldTimer = 0; applying = true; collapse.click(); applying = false;
          rail.classList.remove('cp-fading'); syncFoldAccessibility();
        }, matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 500);
        return;
      }
      if (!value) {clearTimeout(foldTimer); foldTimer = 0; rail.classList.remove('cp-fading');}
      if (rail.classList.contains('collapsed') !== value) {
        applying = true;
        (value ? collapse : expand).click();
        applying = false;
      }
      syncFoldAccessibility();
    }
    function updateReadingMode() {
      pending = false;
      const heroRect = hero?.getBoundingClientRect();
      const nextZone = smallScreen.matches ? 'mobile' :
        (heroRect && heroRect.bottom > 120 ? 'hero' : 'reading');
      if (nextZone !== zone) { zone = nextZone; preference = null; }
      if (preference === 'open' && Math.abs(scrollY - openedAt) > 80) preference = null;
      const opacity = preference === 'open' ? 1 : zone === 'hero' ?
        Math.max(0, Math.min(1, (heroRect.bottom - 120) / Math.min(320, heroRect.height * .4))) : 0;
      rail.style.setProperty('--cp-reading-opacity', String(opacity));
      fold(preference === 'closed' || (preference !== 'open' && zone !== 'hero'));
    }
    function scheduleReadingMode() {
      if (!pending) { pending = true; requestAnimationFrame(updateReadingMode); }
    }
    [[collapse, 'closed'], [expand, 'open']].forEach(([button, value]) => {
      button.addEventListener('click', () => {
        if (applying) return;
        preference = value; openedAt = scrollY;
        clearTimeout(foldTimer); foldTimer = 0; rail.classList.remove('cp-fading');
        rail.style.setProperty('--cp-reading-opacity', value === 'open' ? '1' : '0');
        queueMicrotask(syncFoldAccessibility);
      });
    });
    rail.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !rail.classList.contains('collapsed')) {
        preference = 'closed'; fold(true); expand.focus(); event.stopPropagation();
      }
    });
    addEventListener('scroll', scheduleReadingMode, {passive:true});
    addEventListener('resize', scheduleReadingMode, {passive:true});
    addEventListener('portfolio-language-change', syncFoldAccessibility);
    updateReadingMode();
    rail.dataset.pianoLayout = 'compact-grand';
    return true;
  }
  if (!mount()) {
    const observer = new MutationObserver(() => { if (mount()) observer.disconnect(); });
    observer.observe(document.body, {childList:true});
  }
})();
