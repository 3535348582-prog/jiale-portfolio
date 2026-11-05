const playerFrame = mainVideo.closest('.player-frame');
const fullButton = document.createElement('button');
fullButton.type = 'button'; fullButton.className = 'player-fullscreen'; fullButton.textContent = '⛶';
fullButton.setAttribute('aria-label', '全屏播放');
playerFrame.append(fullButton);
fullButton.onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await playerFrame.requestFullscreen();
  } catch {
    if (mainVideo.requestFullscreen) await mainVideo.requestFullscreen();
  }
};

const cultureControls = document.createElement('div');
cultureControls.className = 'culture-controls';
cultureControls.hidden = true;
cultureControls.innerHTML = '<button type="button" class="culture-play" aria-label="播放">▶</button><span class="culture-time">0:00 / 0:00</span><input class="culture-seek" type="range" min="0" max="0" step="0.1" value="0" aria-label="完整视频进度"><button type="button" class="culture-mute" aria-label="静音">🔊</button><input class="culture-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="视频音量">';
playerFrame.append(cultureControls);
const cultureSeek = cultureControls.querySelector('.culture-seek');
const culturePlay = cultureControls.querySelector('.culture-play');
const cultureTime = cultureControls.querySelector('.culture-time');
const cultureMute = cultureControls.querySelector('.culture-mute');
const cultureVolume = cultureControls.querySelector('.culture-volume');

const cueEl = document.createElement('div');
cueEl.className = 'player-cue';
cueEl.id = 'playerCue';
cueEl.setAttribute('aria-live', 'polite');
playerFrame.append(cueEl);

const nowEl = document.createElement('p');
nowEl.className = 'video-now';
nowEl.id = 'videoNow';
const notesEl = document.getElementById('videoNotes');
if (notesEl) notesEl.after(nowEl);

let playbackRate = 1;
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const tools = document.createElement('div');
tools.className = 'player-tools';
tools.innerHTML = '<span class="tool-label">SPEED</span>' +
  RATES.map(r => `<button type="button" class="speed-btn${r === 1 ? ' active' : ''}" data-rate="${r}" aria-pressed="${r === 1}">${r}×</button>`).join('') +
  '<span class="tool-label" style="margin-left:8px">JUMP</span>' +
  '<button type="button" class="skip-btn" data-skip="-10">−10s</button>' +
  '<button type="button" class="skip-btn" data-skip="10">+10s</button>';
const chapterRow = document.createElement('div');
chapterRow.className = 'chapter-row';
chapterRow.hidden = true;
const footer = document.querySelector('#videos .player-footer');
if (footer) {
  footer.after(tools);
  tools.after(chapterRow);
}

const lang = () => document.documentElement.lang === 'en' ? 'en' : 'zh';
const clockTime = n => {
  n = Math.max(0, Math.floor(n || 0));
  return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
};
const currentVideo = () => PORTFOLIO.videos[videoIndex];
const offsetsOf = v => (v && v.offsets) || [0];
const totalOf = v => (v && (v.totalDuration || v.durationSeconds)) || 0;
function chapterAt(t, v) {
  const o = offsetsOf(v);
  let n = 0;
  for (let i = 0; i < o.length; i++) if (t >= o[i]) n = i;
  return n;
}
function unifiedTime() {
  const v = currentVideo();
  if (!v) return 0;
  return v.chapters ? (offsetsOf(v)[chapterIndex] || 0) + (mainVideo.currentTime || 0) : (mainVideo.currentTime || 0);
}
function updateCultureControls() {
  const v = currentVideo();
  if (!v || !v.chapters) return;
  const total = Math.max(totalOf(v), 0);
  const t = Math.min(total, unifiedTime());
  if (document.activeElement !== cultureSeek) cultureSeek.value = t;
  cultureTime.textContent = clockTime(t) + ' / ' + clockTime(total);
  culturePlay.textContent = mainVideo.paused ? '▶' : 'Ⅱ';
  culturePlay.setAttribute('aria-label', mainVideo.paused ? (lang() === 'en' ? 'Play' : '播放') : (lang() === 'en' ? 'Pause' : '暂停'));
  cultureMute.textContent = mainVideo.muted ? '🔇' : '🔊';
}
function updateChips() {
  chapterRow.querySelectorAll('[data-chapter]').forEach((b, i) => {
    b.classList.toggle('active', i === chapterIndex);
    b.setAttribute('aria-pressed', String(i === chapterIndex));
  });
}
function buildChips(v) {
  if (!v || !v.chapters) {
    chapterRow.hidden = true;
    chapterRow.innerHTML = '';
    return;
  }
  chapterRow.hidden = false;
  chapterRow.innerHTML = v.chapters.map((c, i) =>
    `<button type="button" class="chapter-chip" data-chapter="${i}" aria-pressed="false">${lang() === 'en' ? 'Part' : '第'} ${i + 1}${lang() === 'en' ? '' : ' 段'} / ${c.range}</button>`
  ).join('');
  updateChips();
}
function updateCue() {
  const v = currentVideo();
  if (!v) return;
  const t = unifiedTime();
  const cues = v.cues || [];
  let cue = cues[0] || null;
  for (const c of cues) if (t >= c.t) cue = c;
  if (cue) {
    const text = lang() === 'en' ? (cue.en || cue.zh) : (cue.zh || cue.en);
    cueEl.textContent = text;
    cueEl.classList.add('show');
    nowEl.textContent = (lang() === 'en' ? 'Now: ' : '当前：') + text;
  } else {
    cueEl.classList.remove('show');
    nowEl.textContent = '';
  }
}
function applyRate() {
  mainVideo.playbackRate = playbackRate;
  tools.querySelectorAll('[data-rate]').forEach(b => {
    const on = Number(b.dataset.rate) === playbackRate;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}
function seekUnified(t) {
  const v = currentVideo();
  if (!v) return;
  if (v.chapters) {
    const o = offsetsOf(v);
    const n = chapterAt(t, v);
    const local = Math.max(0, t - (o[n] || 0));
    if (n !== chapterIndex) loadChapter(n, local, !mainVideo.paused);
    else {
      mainVideo.currentTime = Math.min(local, Math.max(0, (mainVideo.duration || 0) - .05));
      updateCultureControls(); updateCue();
    }
  } else {
    mainVideo.currentTime = Math.max(0, Math.min(t, (mainVideo.duration || 0) - .05));
    updateCue();
  }
}
function skip(seconds) {
  const v = currentVideo();
  if (v && v.chapters) seekUnified(unifiedTime() + seconds);
  else {
    mainVideo.currentTime = Math.max(0, Math.min((mainVideo.currentTime || 0) + seconds, (mainVideo.duration || 0) - .05));
    updateCue();
  }
}
async function loadChapter(n, seek = 0, shouldPlay = true) {
  chapterIndex = n;
  const v = currentVideo();
  cultureSeek.max = totalOf(v) || 0;
  mainVideo.src = videoURL(videoIndex, n);
  mainVideo.addEventListener('loadedmetadata', () => {
    mainVideo.playbackRate = playbackRate;
    if (seek > 0) mainVideo.currentTime = Math.min(seek, Math.max(0, (mainVideo.duration || 0) - .05));
    updateCultureControls(); updateChips(); updateCue();
  }, { once: true });
  mainVideo.load();
  updateCultureControls();
  if (shouldPlay) {
    try { await mainVideo.play(); } catch {
      toast(lang() === 'en' ? 'Video loaded; press play.' : '视频已载入，请点击播放按钮。');
    }
  }
}
async function playVideo(i) {
  videoIndex = i;
  chapterIndex = 0;
  mainVideo.pause();
  const v = PORTFOLIO.videos[i];
  mainVideo.muted = !!v.muted;
  mainVideo.poster = PORTFOLIO.caseAssets[v.poster];
  playerFrame.classList.toggle('portrait-mode', !!v.portrait);
  mainVideo.controls = !v.chapters;
  cultureControls.hidden = !v.chapters;
  $('startVideo').hidden = true;
  $('videoTitle').textContent = v.title;
  $('videoNote').textContent = v.note;
  $('videoDuration').textContent = v.duration + ' / ' + v.resolution;
  document.querySelectorAll('[data-video]').forEach(b => {
    const active = Number(b.dataset.video) === i;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  buildChips(v);
  applyRate();
  await loadChapter(0);
  updateCue();
}
culturePlay.onclick = () => { if (mainVideo.paused) mainVideo.play().catch(() => {}); else mainVideo.pause(); };
cultureMute.onclick = () => { mainVideo.muted = !mainVideo.muted; updateCultureControls(); };
cultureVolume.oninput = () => { mainVideo.volume = Number(cultureVolume.value); mainVideo.muted = mainVideo.volume === 0; updateCultureControls(); };
cultureSeek.oninput = () => { cultureTime.textContent = clockTime(Number(cultureSeek.value)) + ' / ' + clockTime(totalOf(currentVideo())); };
cultureSeek.onchange = () => {
  const v = currentVideo();
  const t = Number(cultureSeek.value);
  const n = chapterAt(t, v);
  const local = Math.max(0, t - (offsetsOf(v)[n] || 0));
  const playing = !mainVideo.paused;
  if (n === chapterIndex) {
    mainVideo.currentTime = Math.min(local, Math.max(0, (mainVideo.duration || 0) - .05));
    updateCultureControls(); updateCue();
  } else loadChapter(n, local, playing);
};
tools.addEventListener('click', e => {
  const rate = e.target.closest('[data-rate]');
  if (rate) { playbackRate = Number(rate.dataset.rate); applyRate(); return; }
  const jump = e.target.closest('[data-skip]');
  if (jump) skip(Number(jump.dataset.skip));
});
chapterRow.addEventListener('click', e => {
  const b = e.target.closest('[data-chapter]');
  if (!b) return;
  const n = Number(b.dataset.chapter);
  if (n === chapterIndex) return;
  const playing = !mainVideo.paused;
  loadChapter(n, 0, playing);
});
['timeupdate', 'play', 'pause', 'volumechange'].forEach(name => mainVideo.addEventListener(name, () => { updateCultureControls(); updateCue(); }));
mainVideo.addEventListener('ratechange', () => {
  if (Math.abs((mainVideo.playbackRate || 1) - playbackRate) > .01) { playbackRate = mainVideo.playbackRate; applyRate(); }
});
mainVideo.addEventListener('ended', () => {
  const v = currentVideo();
  if (v && v.chapters && chapterIndex + 1 < v.chapters.length) loadChapter(chapterIndex + 1, 0, true);
  else { updateCultureControls(); updateCue(); }
});
mainVideo.addEventListener('error', () => toast(lang() === 'en' ? 'Video failed to load. Try another clip or a modern browser.' : '视频载入失败，请重新选择片段或使用现代浏览器打开。'));
addEventListener('portfolio-language-change', () => {
  const en = lang() === 'en';
  fullButton.setAttribute('aria-label', en ? 'Toggle fullscreen' : '全屏播放');
  cultureSeek.setAttribute('aria-label', en ? 'Full video progress' : '完整视频进度');
  cultureVolume.setAttribute('aria-label', en ? 'Video volume' : '视频音量');
  cultureMute.setAttribute('aria-label', en ? 'Mute or unmute' : '静音或取消静音');
  buildChips(currentVideo());
  updateCultureControls();
  updateCue();
});
$('startVideo').onclick = () => playVideo(videoIndex);
document.querySelectorAll('[data-video]').forEach(b => b.onclick = () => playVideo(Number(b.dataset.video)));
applyRate();
