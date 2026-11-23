/* 星际抽卡 + 像素身份生成器：抽词条 → 选择是否被引力吸入对应板块 → 以生成的像素身份探索 */
(() => {
  if (document.getElementById('drawDeck')) return;
  const isEn = () => document.documentElement.lang === 'en';
  const t = (zh, e) => isEn() ? e : zh;
  const ORDER = ['direction', 'education', 'projects', 'videos', 'awards', 'experience', 'journey', 'contact'];
  const DECK = [
    { id: 'direction', no: '01', planet: 'MERCURY', cn: '水星', glyph: '☿', color: '#ff9a5a', accent: '#ffe2b0',
      zh: { topic: '方向与定位', form: '职业方向自述', chal: '用一个词写下你对我的第一印象', route: '对应区域：方向与定位' },
      en: { topic: 'Career direction', form: 'A self-statement of direction', chal: 'Describe me in one word', route: 'Section: Career direction' } },
    { id: 'education', no: '02', planet: 'VENUS', cn: '金星', glyph: '♀', color: '#e8c070', accent: '#fff0b0',
      zh: { topic: '教育背景', form: '学术档案', chal: '找出一门 98 分的课程', route: '对应区域：教育背景' },
      en: { topic: 'Education', form: 'Academic record', chal: 'Find a course scored 98', route: 'Section: Education' } },
    { id: 'projects', no: '03', planet: 'EARTH', cn: '地球', glyph: '⊕', color: '#6fd3ff', accent: '#8effc9',
      zh: { topic: '项目档案', form: '八项项目记录', chal: '挑一个项目打开详情', route: '对应区域：项目档案' },
      en: { topic: 'Projects', form: 'Eight documented projects', chal: 'Open one project in detail', route: 'Section: Projects' } },
    { id: 'videos', no: '04', planet: 'MARS', cn: '火星', glyph: '♂', color: '#e56a4a', accent: '#ffc08a',
      zh: { topic: '视频作品', form: '四支视频作品', chal: '看完一支 15.5 秒的短片', route: '对应区域：视频作品' },
      en: { topic: 'Videos', form: 'Four video works', chal: 'Finish the 15.5-second short', route: 'Section: Videos' } },
    { id: 'awards', no: '05', planet: 'JUPITER', cn: '木星', glyph: '♃', color: '#d8a878', accent: '#ffe0b0',
      zh: { topic: '获奖记录', form: '七项获奖记录', chal: '数一数有几张证书', route: '对应区域：获奖记录' },
      en: { topic: 'Awards', form: 'Seven awards', chal: 'Count the certificates', route: 'Section: Awards' } },
    { id: 'experience', no: '06', planet: 'SATURN', cn: '土星', glyph: '♄', color: '#d9c48c', accent: '#fff2c8',
      zh: { topic: '实习经历', form: '三段实践经历', chal: '找到你最想尝试的岗位类型', route: '对应区域：实习经历' },
      en: { topic: 'Experience', form: 'Three internships', chal: 'Find the role you would try', route: 'Section: Experience' } },
    { id: 'journey', no: '07', planet: 'URANUS', cn: '天王星', glyph: '♅', color: '#9fe8ef', accent: '#d8ffff',
      zh: { topic: '世界足迹', form: '旅行相册', chal: '选一张你最想去的照片', route: '对应区域：世界足迹' },
      en: { topic: 'Travel', form: 'Travel album', chal: 'Pick a photo of a place you want to visit', route: 'Section: Travel' } },
    { id: 'contact', no: '08', planet: 'NEPTUNE', cn: '海王星', glyph: '♆', color: '#7f9dff', accent: '#c0d0ff',
      zh: { topic: '联系交流', form: '联系方式', chal: '给沈佳乐留一句话', route: '对应区域：联系交流' },
      en: { topic: 'Contact', form: 'Contact details', chal: 'Leave Jiale a message', route: 'Section: Contact' } }
  ];
  const PALETTES = [
    { hair: '#1a1410', skin: '#e8c39e', shirt: '#2a4a66', acc: '#ff9a5a', bg: '#0a1524' },
    { hair: '#14100e', skin: '#f0d0a8', shirt: '#3a5a3a', acc: '#e8c070', bg: '#0a1524' },
    { hair: '#101418', skin: '#e8c9a8', shirt: '#264a6a', acc: '#6fd3ff', bg: '#0a1524' },
    { hair: '#160e0c', skin: '#ecc8a0', shirt: '#5a2e24', acc: '#e56a4a', bg: '#0a1524' },
    { hair: '#120f0c', skin: '#edcfa8', shirt: '#4a3a26', acc: '#d8a878', bg: '#0a1524' },
    { hair: '#10100c', skin: '#e8d2a8', shirt: '#3a3a52', acc: '#d9c48c', bg: '#0a1524' },
    { hair: '#0c1216', skin: '#dff0f2', shirt: '#1e4a52', acc: '#9fe8ef', bg: '#0a1524' },
    { hair: '#0c1018', skin: '#d8dff0', shirt: '#22346a', acc: '#7f9dff', bg: '#0a1524' }
  ];
  const TITLES = [
    { zh: '星际旅人', en: 'Star Wanderer' },
    { zh: '星图测绘员', en: 'Star Cartographer' },
    { zh: '轨道巡检员', en: 'Orbit Inspector' },
    { zh: '引力骑手', en: 'Gravity Rider' },
    { zh: '彗星邮差', en: 'Comet Courier' },
    { zh: '银河记录员', en: 'Galaxy Recorder' },
    { zh: '光年信使', en: 'Light-year Messenger' },
    { zh: '星尘收藏家', en: 'Stardust Collector' }
  ];
  const hashStr = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h; };
  const mulberry = a => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let z = Math.imul(a ^ (a >>> 15), 1 | a); z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z; return ((z ^ (z >>> 14)) >>> 0) / 4294967296; };

  // 悬浮入口按钮（左下角，音乐坞上方）
  const dockBtn = document.createElement('button');
  dockBtn.type = 'button'; dockBtn.id = 'drawDock'; dockBtn.className = 'dd-dock';
  dockBtn.setAttribute('aria-haspopup', 'dialog');
  dockBtn.innerHTML = '<span class="dd-dock-star">✦</span><span class="dd-dock-label">星际抽卡</span><img class="dd-dock-av" alt="" hidden>';
  document.body.append(dockBtn);

  // 抽卡弹窗
  const deck = document.createElement('dialog');
  deck.id = 'drawDeck'; deck.className = 'draw-deck';
  deck.setAttribute('aria-labelledby', 'ddTitleH');
  deck.innerHTML = `<div class="dd-inner">
    <header class="dd-head">
      <div><span class="dd-eyebrow" id="ddEyebrow">WARP DECK / 星际抽卡</span><h2 id="ddTitleH">抽一张词条，决定下一站</h2></div>
      <button type="button" class="dd-close" id="ddClose" aria-label="关闭抽卡">×</button>
    </header>
    <div class="dd-grid">
      <section class="dd-left" aria-label="词条卡">
        <div class="dd-stage">
          <div class="dd-card" id="ddCard">
            <div class="dd-card-inner">
              <div class="dd-face dd-back"><span>✦</span><small>WARP DECK</small></div>
              <div class="dd-face dd-front">
                <div class="dd-front-head"><span class="dd-glyph" id="ddGlyph"></span><span class="dd-planet" id="ddPlanet"></span><span class="dd-no" id="ddNo"></span></div>
                <dl>
                  <div><dt id="ddDtTopic">主题</dt><dd id="ddTopic"></dd></div>
                  <div><dt id="ddDtForm">形式</dt><dd id="ddForm"></dd></div>
                  <div><dt id="ddDtChal">特别要求</dt><dd id="ddChal"></dd></div>
                </dl>
                <p class="dd-route" id="ddRoute"></p>
              </div>
            </div>
          </div>
        </div>
        <div class="dd-actions">
          <button type="button" class="dd-go" id="ddGo" disabled>被引力吸入 →</button>
          <button type="button" class="dd-again" id="ddAgain">再抽一次</button>
        </div>
      </section>
      <section class="dd-right" aria-label="像素身份生成">
        <div class="dd-lab">
          <div class="dd-lab-head"><span class="dd-eyebrow">IDENTITY / 身份生成</span><h3 id="ddLabH3">你会以什么身份被吸进去？</h3></div>
          <canvas id="ddAvatar" width="24" height="24" aria-label="像素身份头像预览"></canvas>
          <div class="dd-identity"><b id="ddTitle"></b><small id="ddTitleEn"></small></div>
          <div class="dd-input-row">
            <input id="ddName" maxlength="12" placeholder="输入名字或昵称" aria-label="输入名字或昵称">
            <button type="button" id="ddGen">生成身份</button>
          </div>
          <div class="dd-input-row">
            <button type="button" id="ddReroll">换一版造型</button>
            <button type="button" id="ddSave">保存头像 PNG</button>
          </div>
          <p class="dd-note" id="ddNote">生成后，你将以这个身份被引力吸入对应星球板块。</p>
        </div>
      </section>
    </div>
  </div>`;
  document.body.append(deck);
  const $ = sel => deck.querySelector(sel);
  const card = $('#ddCard'), goBtn = $('#ddGo'), againBtn = $('#ddAgain');
  const glyphEl = $('#ddGlyph'), planetEl = $('#ddPlanet'), noEl = $('#ddNo');
  const topicEl = $('#ddTopic'), formEl = $('#ddForm'), chalEl = $('#ddChal'), routeEl = $('#ddRoute');
  const avatarCv = $('#ddAvatar'), actx = avatarCv.getContext('2d');
  const nameInput = $('#ddName'), genBtn = $('#ddGen'), rerollBtn = $('#ddReroll'), saveBtn = $('#ddSave');
  const titleEl = $('#ddTitle'), titleEnEl = $('#ddTitleEn');
  let drawn = -1, busy = false;
  let state = { name: '', seed: 1, pal: 2, title: 0, avatar: '' };
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio-explorer') || 'null');
    if (saved && saved.avatar) { state = saved; nameInput.value = state.name; }
  } catch (e) {}

  // 12×12 对称像素头像，24×24 原生画布（2× 整数像素），显示时按整数倍放大保持锐利
  function renderAvatar() {
    const rnd = mulberry(state.seed);
    const P = PALETTES[state.pal % PALETTES.length];
    const S = 2;
    actx.fillStyle = P.bg; actx.fillRect(0, 0, 24, 24);
    for (let y = 0; y < 12; y++) for (let x = 0; x < 6; x++) {
      let col = null;
      if (y <= 2) col = rnd() < 0.86 ? P.hair : (y === 2 ? P.skin : null);
      else if (y === 3) col = (x <= 1) ? P.hair : (rnd() < 0.3 ? P.hair : P.skin);
      else if (y <= 7) col = P.skin;
      else col = P.shirt;
      if (col) { actx.fillStyle = col; actx.fillRect(x * S, y * S, S, S); actx.fillRect((11 - x) * S, y * S, S, S); }
    }
    actx.fillStyle = '#0a0d12';
    actx.fillRect(3 * S, 5 * S, S, S); actx.fillRect(8 * S, 5 * S, S, S);
    actx.fillStyle = '#a06040'; actx.fillRect(4 * S, 6 * S, 4 * S, 1);
    actx.fillStyle = P.hair; actx.fillRect(1 * S, 5 * S, 2, S); actx.fillRect(11 * S - 1, 5 * S, 2, S);
    actx.fillStyle = P.acc; actx.fillRect(5 * S, 8 * S, 2 * S, S);
    state.avatar = avatarCv.toDataURL('image/png');
  }
  function updateIdentityUI() {
    const ti = TITLES[state.title % TITLES.length];
    titleEl.textContent = ti.zh; titleEnEl.textContent = ti.en;
    const av = dockBtn.querySelector('.dd-dock-av');
    av.src = state.avatar; av.hidden = !state.avatar;
  }
  function gen(seed) {
    const name = (nameInput.value || '').trim() || t('无名旅人', 'Traveler');
    state.name = name;
    state.seed = seed !== undefined ? seed : (hashStr(name) || 7);
    state.pal = hashStr(name + 'pal') % PALETTES.length;
    state.title = hashStr(name + 'title') % TITLES.length;
    renderAvatar(); updateIdentityUI();
    try { localStorage.setItem('portfolio-explorer', JSON.stringify(state)); } catch (e) {}
  }

  function drawCard() {
    if (busy) return;
    busy = true;
    card.classList.remove('revealed');
    card.classList.add('shuffling');
    const pool = [];
    for (let i = 0; i < DECK.length; i++) if (i !== drawn) pool.push(i);
    const pick = pool[(Math.random() * pool.length) | 0];
    drawn = pick;
    setTimeout(() => {
      const d = DECK[pick];
      deck.style.setProperty('--dd-color', d.color);
      deck.style.setProperty('--dd-accent', d.accent);
      glyphEl.textContent = d.glyph;
      planetEl.textContent = d.planet + ' · ' + d.cn;
      noEl.textContent = d.no + ' / 08';
      topicEl.textContent = t(d.zh.topic, d.en.topic);
      formEl.textContent = t(d.zh.form, d.en.form);
      chalEl.textContent = t(d.zh.chal, d.en.chal);
      routeEl.textContent = t(d.zh.route, d.en.route);
      card.classList.remove('shuffling');
      card.classList.add('revealed');
      busy = false;
      goBtn.disabled = false;
    }, 620);
  }
  function go(preparedSound) {
    const sound = preparedSound || (window.portfolioPovWarp && window.portfolioPovWarp.prepareAudio());
    if (drawn < 0 || busy) { if (sound) sound.stop(); return; }
    const idx = ORDER.indexOf(DECK[drawn].id);
    const ti = TITLES[state.title % TITLES.length];
    window.portfolioExplorer = state.avatar ? { avatar: state.avatar, title: ti.zh, titleEn: ti.en, name: state.name } : null;
    deck.close();
    if (window.portfolioPovWarp) { window.portfolioPovWarp.start(idx, sound); return; }
    if (sound) sound.stop();
    setTimeout(() => {
      if (typeof window.portfolioTunnel === 'function') window.portfolioTunnel(idx);
      else { const el = document.getElementById(DECK[drawn].id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
    }, 320);
  }

  dockBtn.addEventListener('click', () => {
    if (deck.open) return;
    deck.showModal();
    if (drawn < 0) drawCard(); // 首次打开自动抽一张，卡面本身也可点
  });
  card.addEventListener('click', drawCard);
  $('#ddClose').addEventListener('click', () => deck.close());
  againBtn.addEventListener('click', drawCard);
  goBtn.addEventListener('click', () => go());
  genBtn.addEventListener('click', () => gen());
  rerollBtn.addEventListener('click', () => gen((state.seed || 1) + 137));
  saveBtn.addEventListener('click', () => {
    if (!state.avatar) return;
    const a = document.createElement('a');
    a.href = state.avatar;
    a.download = (state.name || t('旅人', 'traveler')) + t('-身份头像.png', '-avatar.png');
    a.click();
  });
  deck.addEventListener('click', e => { if (e.target === deck) deck.close(); });
  deck.addEventListener('close', () => { goBtn.disabled = drawn < 0; });

  const I18N = [
    [dockBtn.querySelector('.dd-dock-label'), '星际抽卡', 'Warp Deck'],
    [$('#ddEyebrow'), 'WARP DECK / 星际抽卡', 'WARP DECK / DRAW A CARD'],
    [$('#ddTitleH'), '抽一张词条，决定下一站', 'Draw a card, pick your next stop'],
    [$('#ddClose'), '关闭抽卡', 'Close the deck'],
    [$('#ddDtTopic'), '主题', 'TOPIC'],
    [$('#ddDtForm'), '形式', 'FORM'],
    [$('#ddDtChal'), '特别要求', 'CHALLENGE'],
    [goBtn, '被引力吸入 →', 'Caught by gravity →'],
    [againBtn, '再抽一次', 'Draw again'],
    [$('#ddLabH3'), '你会以什么身份被吸进去？', 'What identity pulls you in?'],
    [nameInput, '输入名字或昵称', 'Type a name or nickname'],
    [genBtn, '生成身份', 'Generate'],
    [rerollBtn, '换一版造型', 'Re-roll look'],
    [saveBtn, '保存头像 PNG', 'Save PNG'],
    [$('#ddNote'), '生成后，你将以这个身份被引力吸入对应星球板块。', 'Once generated, gravity will pull you in as this identity.']
  ];
  function i18n() {
    const en = isEn();
    for (const [el, zh, e] of I18N) {
      if (el.tagName === 'INPUT') el.placeholder = en ? e : zh;
      else if (el.id === 'ddClose') el.setAttribute('aria-label', en ? e : zh);
      else el.textContent = en ? e : zh;
    }
  }
  i18n();
  addEventListener('portfolio-language-change', i18n);

  renderAvatar();
  updateIdentityUI();
  window.portfolioDeck = { open: () => deck.showModal(), draw: drawCard };
})();
