/* Public comments live in GitHub Discussions; localStorage stores only an optional star choice. */
(() => {
  'use strict';
  const section = document.getElementById('guestbook');
  if (!section || section.dataset.guestbookMounted) return;
  section.dataset.guestbookMounted = 'true';
  const $ = id => document.getElementById(id);
  const configNode = $('portfolioGuestbookConfig');
  let supplied = window.portfolioGuestbookConfig || {};
  try { if (configNode) supplied = JSON.parse(configNode.textContent); } catch {}
  const config = Object.assign({repo:'3535348582-prog/jiale-portfolio',repoId:'',category:'Announcements',categoryId:'',discussionNumber:null,term:'星际留言簿 / Jiale Portfolio',theme:'transparent_dark',badgeBaseURL:'https://jiale-shen-portfolio.surge.sh/assets/constellation-badges/'}, supplied);
  const stars = [{"id":"Ari","zh":"白羊座","en":"Aries","slug":"aries","symbol":"♈","paths":[[[15.0,23.7],[134.41,74.94],[171.22,107.47],[175.0,126.3]]],"points":[[15.0,23.7],[134.41,74.94],[171.22,107.47],[175.0,126.3]]},{"id":"Tau","zh":"金牛座","en":"Taurus","slug":"taurus","symbol":"♉","paths":[[[28.87,45.47],[88.7,68.52],[95.87,71.26],[104.68,72.32],[101.59,64.4],[96.07,57.57],[43.2,15.0]],[[104.68,72.32],[123.97,85.11],[158.55,95.42],[121.86,112.11]],[[158.55,95.42],[161.13,98.25],[149.79,135.0]]],"points":[[28.87,45.47],[88.7,68.52],[95.87,71.26],[104.68,72.32],[101.59,64.4],[96.07,57.57],[43.2,15.0],[123.97,85.11],[158.55,95.42],[121.86,112.11],[161.13,98.25],[149.79,135.0]]},{"id":"Gem","zh":"双子座","en":"Gemini","slug":"gemini","symbol":"♊","paths":[[[159.06,72.28],[147.34,73.11],[116.46,58.24],[78.45,26.59],[47.29,15.0],[30.94,38.23],[43.52,46.25],[64.66,78.01],[87.85,87.2],[127.51,112.61],[116.65,135.0]],[[64.66,78.01],[66.78,112.16]]],"points":[[159.06,72.28],[147.34,73.11],[116.46,58.24],[78.45,26.59],[47.29,15.0],[30.94,38.23],[43.52,46.25],[64.66,78.01],[87.85,87.2],[127.51,112.61],[116.65,135.0],[66.78,112.16]]},{"id":"Cnc","zh":"巨蟹座","en":"Cancer","slug":"cancer","symbol":"♋","paths":[[[63.15,118.8],[84.08,80.35],[86.16,60.0],[81.66,15.0]],[[84.08,80.35],[126.85,135.0]]],"points":[[63.15,118.8],[84.08,80.35],[86.16,60.0],[81.66,15.0],[126.85,135.0]]},{"id":"Leo","zh":"狮子座","en":"Leo","slug":"leo","symbol":"♌","paths":[[[148.92,113.82],[149.5,87.58],[132.73,71.22],[63.59,65.96],[15.0,94.99],[61.77,93.83],[148.92,113.82]],[[132.73,71.22],[136.48,51.66],[165.55,36.18],[175.0,47.82]]],"points":[[148.92,113.82],[149.5,87.58],[132.73,71.22],[63.59,65.96],[15.0,94.99],[61.77,93.83],[136.48,51.66],[165.55,36.18],[175.0,47.82]]},{"id":"Vir","zh":"处女座","en":"Virgo","slug":"virgo","symbol":"♍","paths":[[[175.0,50.87],[170.83,68.3],[144.59,77.06],[125.31,79.79],[100.44,94.11],[87.17,113.94],[42.39,96.11],[18.11,95.3]],[[107.17,36.06],[113.04,62.72],[125.31,79.79]],[[100.44,94.11],[78.75,76.76],[55.0,69.21],[15.0,67.82]]],"points":[[175.0,50.87],[170.83,68.3],[144.59,77.06],[125.31,79.79],[100.44,94.11],[87.17,113.94],[42.39,96.11],[18.11,95.3],[107.17,36.06],[113.04,62.72],[78.75,76.76],[55.0,69.21],[15.0,67.82]]},{"id":"Lib","zh":"天秤座","en":"Libra","slug":"libra","symbol":"♎","paths":[[[107.5,108.52],[127.47,54.99],[90.82,15.0],[64.43,47.01],[64.32,125.27],[62.53,135.0]],[[127.47,54.99],[64.43,47.01]]],"points":[[107.5,108.52],[127.47,54.99],[90.82,15.0],[64.43,47.01],[64.32,125.27],[62.53,135.0]]},{"id":"Sco","zh":"天蝎座","en":"Scorpius","slug":"scorpius","symbol":"♏","paths":[[[153.15,48.69],[153.39,30.33],[148.62,15.0]],[[153.39,30.33],[127.35,43.65],[117.54,47.45],[109.73,56.35],[93.4,87.36],[91.61,106.7],[89.03,129.01],[72.47,134.1],[48.56,135.0],[36.61,121.52],[40.88,115.15],[48.7,104.14]]],"points":[[153.15,48.69],[153.39,30.33],[148.62,15.0],[127.35,43.65],[117.54,47.45],[109.73,56.35],[93.4,87.36],[91.61,106.7],[89.03,129.01],[72.47,134.1],[48.56,135.0],[36.61,121.52],[40.88,115.15],[48.7,104.14]]},{"id":"Sgr","zh":"射手座","en":"Sagittarius","slug":"sagittarius","symbol":"♐","paths":[[[132.16,104.17],[127.55,93.6],[132.11,74.73],[127.12,55.72],[142.34,38.49]],[[78.81,135.0],[77.04,118.7],[94.31,73.17],[110.15,61.4],[127.12,55.72]],[[52.49,126.22],[45.2,98.83],[44.36,60.68],[61.98,53.24],[72.79,51.1],[82.13,53.94],[101.24,58.25],[110.15,61.4],[132.11,74.73],[145.64,78.72],[127.55,93.6],[94.31,73.17],[90.33,63.93],[101.24,58.25],[92.39,39.1],[87.41,36.11],[79.49,27.54],[75.33,22.99],[75.04,15.0]],[[92.39,39.1],[99.19,36.47],[102.55,43.39],[101.24,58.25]]],"points":[[132.16,104.17],[127.55,93.6],[132.11,74.73],[127.12,55.72],[142.34,38.49],[78.81,135.0],[77.04,118.7],[94.31,73.17],[110.15,61.4],[52.49,126.22],[45.2,98.83],[44.36,60.68],[61.98,53.24],[72.79,51.1],[82.13,53.94],[101.24,58.25],[145.64,78.72],[90.33,63.93],[92.39,39.1],[87.41,36.11],[79.49,27.54],[75.33,22.99],[75.04,15.0],[99.19,36.47],[102.55,43.39]]},{"id":"Cap","zh":"摩羯座","en":"Capricornus","slug":"capricornus","symbol":"♑","paths":[[[175.0,22.79],[168.08,39.36],[153.09,61.15],[121.61,115.2],[111.86,127.21],[52.93,94.68],[15.0,50.0],[27.58,53.27],[59.21,53.26],[87.98,55.69],[175.0,22.79]]],"points":[[175.0,22.79],[168.08,39.36],[153.09,61.15],[121.61,115.2],[111.86,127.21],[52.93,94.68],[15.0,50.0],[27.58,53.27],[59.21,53.26],[87.98,55.69]]},{"id":"Aqr","zh":"水瓶座","en":"Aquarius","slug":"aquarius","symbol":"♒","paths":[[[175.0,75.86],[170.36,73.57],[134.05,58.95],[102.21,38.69],[87.32,42.64],[80.6,37.52],[74.48,37.9],[58.64,66.0],[35.27,72.65],[44.97,117.73]],[[134.05,58.95],[101.08,89.38]],[[102.21,38.69],[91.75,66.55]],[[80.6,37.52],[83.93,32.27]],[[32.67,114.33],[35.27,72.65],[15.0,106.77]]],"points":[[175.0,75.86],[170.36,73.57],[134.05,58.95],[102.21,38.69],[87.32,42.64],[80.6,37.52],[74.48,37.9],[58.64,66.0],[35.27,72.65],[44.97,117.73],[101.08,89.38],[91.75,66.55],[83.93,32.27],[32.67,114.33],[15.0,106.77]]},{"id":"Psc","zh":"双鱼座","en":"Pisces","slug":"pisces","symbol":"♓","paths":[[[61.01,43.63],[63.65,23.63],[56.83,33.64],[61.01,43.63],[62.39,56.51],[44.4,76.19],[31.08,97.88],[15.0,120.5],[22.82,119.24],[34.08,111.29],[44.23,109.26],[58.97,104.53],[68.5,103.59],[81.03,104.81],[124.55,106.97],[141.93,110.91],[152.6,107.77],[159.65,111.1],[162.87,118.66],[154.21,126.37],[140.45,124.84],[136.38,118.78],[141.93,110.91]],[[162.87,118.66],[175.0,116.14]]],"points":[[61.01,43.63],[63.65,23.63],[56.83,33.64],[62.39,56.51],[44.4,76.19],[31.08,97.88],[15.0,120.5],[22.82,119.24],[34.08,111.29],[44.23,109.26],[58.97,104.53],[68.5,103.59],[81.03,104.81],[124.55,106.97],[141.93,110.91],[152.6,107.77],[159.65,111.1],[162.87,118.66],[154.21,126.37],[140.45,124.84],[136.38,118.78],[175.0,116.14]]}];
  const selected = $('guestbookZodiac'), preview = $('guestbookBadge'), copy = $('guestbookCopyBadge');
  const status = $('guestbookStatus'), loadButton = $('guestbookLoad'), host = $('guestbookComments');
  const discussionLink = $('guestbookDiscussionLink'), identityStatus = $('guestbookIdentityStatus');
  const words = {
    zh:{eyebrow:'星际留言簿',title:'在这片星空，留下你的想法。',intro:'哪件作品让你停留？哪个细节可以更好？欢迎留言，也欢迎回复彼此。',choose:'为留言选一个星座签名',optional:'可选',yourStar:'你的星座',selectPrompt:'选择一个喜欢的星座',signatureHelp:'复制后粘贴到评论开头，其他访客就能看到你的星座图标。',copy:'复制星座签名',suggest:'帮我选一个',quizQuestion:'这次你更想带走什么？',quizLeo:'创作的勇气',quizVir:'细节的秩序',quizAqr:'新鲜的点子',manualCopy:'也可以选中下面的签名复制',authHint:'所有留言公开可见。登录 GitHub 后即可评论、回复、@ 他人或点赞。',openDiscussion:'在 GitHub 打开留言 ↗',idle:'滚动到这里后，留言会自动载入。',load:'加载留言',loading:'正在接收星际留言…',unavailable:'留言暂时未能载入，可以直接到 GitHub 查看与回复。',notConfigured:'欢迎到 GitHub 留下你的想法。',retry:'重新加载',blank:'选一个你喜欢的星座，生成自己的留言图标。',saved:'已在此设备记住选择。复制签名后，粘贴到评论开头即可分享。',copied:'签名已复制。粘贴到评论开头，星座图标会随留言公开显示。'},
    en:{eyebrow:'STAR NOTES',title:'Leave a thought in this little universe.',intro:'Which project made you pause? What could work better? Share a thought, or reply to someone else.',choose:'Choose a constellation signature',optional:'Optional',yourStar:'Your constellation',selectPrompt:'Choose a constellation you like',signatureHelp:'Copy it into the beginning of your comment so other visitors can see your constellation icon.',copy:'Copy star signature',suggest:'Help me choose',quizQuestion:'What would you like to take from this visit?',quizLeo:'Courage to create',quizVir:'Care for the details',quizAqr:'A fresh idea',manualCopy:'You can also select and copy this signature',authHint:'All comments are public. Sign in with GitHub to comment, reply, @ mention others or react.',openDiscussion:'Open the discussion on GitHub ↗',idle:'Comments load when this section comes into view.',load:'Load comments',loading:'Receiving star notes…',unavailable:'Comments could not load. You can read and reply directly on GitHub.',notConfigured:'You are welcome to leave a thought on GitHub.',retry:'Try again',blank:'Choose a constellation to create your comment icon.',saved:'Your choice is remembered on this device. Paste the signature into your comment to share it.',copied:'Signature copied. Paste it into your comment to share the constellation icon.'}
  };
  const english = () => document.documentElement.lang.startsWith('en');
  const text = key => words[english() ? 'en' : 'zh'][key];
  const storageKey = 'jiale.guestbook.constellation.v1';
  let active = '', state = 'idle', timeout = 0, observer;
  const configured = () => !!config.repoId && (!!config.discussionNumber || !!config.categoryId);
  const discussionURL = () => 'https://github.com/' + config.repo + '/discussions' + (config.discussionNumber ? '/' + Number(config.discussionNumber) : '');
  const badgeURL = star => config.badgeBaseURL + star.slug + '.svg';
  function signature(star) { return '![' + star.zh + ' · ' + star.en.toUpperCase() + '](' + badgeURL(star) + ')\n\n'; }
  function renderChoice(notify = false) {
    const star = stars.find(s => s.id === active);
    preview.replaceChildren(); copy.disabled = !star;
    if (!star) {
      const prompt = document.createElement('p'); prompt.className = 'guestbook-unselected'; prompt.textContent = text('blank'); preview.append(prompt);
      return;
    }
    // The SVG is generated exclusively from bundled, fixed constellation data.
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 240 200'); svg.setAttribute('role','img');
    svg.setAttribute('aria-label', english() ? star.en : star.zh);
    for (const points of star.paths) {
      const line = document.createElementNS(ns,'polyline');
      line.setAttribute('points',points.map(p => (p[0]+25)+','+(p[1]+12)).join(' '));
      line.setAttribute('fill','none');line.setAttribute('stroke','#bba36e');line.setAttribute('stroke-width','1.3');svg.append(line);
    }
    for (const [x,y] of star.points) {
      const dot = document.createElementNS(ns,'circle');dot.setAttribute('cx',x+25);dot.setAttribute('cy',y+12);dot.setAttribute('r','2.2');dot.setAttribute('fill','#e2cc93');svg.append(dot);
    }
    const label = document.createElementNS(ns,'text');label.setAttribute('x','120');label.setAttribute('y','184');label.setAttribute('text-anchor','middle');label.setAttribute('fill','#d7c496');label.setAttribute('font-size','12');label.setAttribute('font-family','Segoe UI,Microsoft YaHei,sans-serif');label.textContent = (english() ? star.en : star.zh) + ' · ' + star.symbol;svg.append(label);preview.append(svg);
    $('guestbookSignature').value = signature(star);
    if (notify) identityStatus.textContent = text('saved');
  }
  function choose(id) {
    if (!id) {
      active = ''; selected.value = '';
      try {localStorage.removeItem(storageKey);} catch {}
      identityStatus.textContent = ''; $('guestbookCopyFallback').hidden = true;
      renderChoice(); return;
    }
    if (!stars.some(s => s.id === id)) return;
    active = id; selected.value = id;
    try { localStorage.setItem(storageKey,id); } catch {}
    renderChoice(true);
  }
  for (const star of stars) {const option = document.createElement('option');option.value=star.id;selected.append(option);}
  function renderLanguage() {
    section.querySelectorAll('[data-gb-key]').forEach(node => {const value=text(node.dataset.gbKey);if(value)node.textContent=value;});
    selected.querySelectorAll('option[value]:not([value=""])').forEach(option => {const star=stars.find(s=>s.id===option.value);option.textContent=star.symbol+' '+(english()?star.en:star.zh);});
    host.setAttribute('aria-label',english()?'Public comments and replies':'公开留言与回复');
    renderChoice(); renderState();
    host.querySelector('iframe')?.contentWindow.postMessage({giscus:{setConfig:{lang:english()?'en':'zh-CN'}}},'https://giscus.app');
  }
  function renderState() {
    const loaded=state==='loaded';
    status.closest('.guestbook-load-state').hidden=loaded;
    status.textContent = text(state==='error'?'unavailable':state==='unconfigured'?'notConfigured':state==='loading'?'loading':'idle');
    loadButton.textContent=text(state==='error'?'retry':'load');
    loadButton.hidden=state==='unconfigured';loadButton.disabled=state==='loading';
  }
  function finishLoading() {clearTimeout(timeout);state='loaded';renderState();}
  function failLoading() {clearTimeout(timeout);state='error';renderState();}
  function loadComments() {
    if (state==='loading'||state==='loaded') return;
    if (!configured()) {state='unconfigured';renderState();return;}
    state='loading';renderState();host.replaceChildren();
    const script=document.createElement('script');script.src='https://giscus.app/client.js';script.async=true;script.crossOrigin='anonymous';
    const options={repo:config.repo,'repo-id':config.repoId,category:config.category,'category-id':config.categoryId,mapping:config.discussionNumber?'number':'specific',term:config.discussionNumber?String(config.discussionNumber):config.term,strict:'0','reactions-enabled':'1','emit-metadata':'1','input-position':'top',theme:config.theme,lang:english()?'en':'zh-CN',loading:'lazy'};
    for (const [key,value] of Object.entries(options)) if(value!==undefined&&value!==null)script.setAttribute('data-'+key,String(value));
    script.onerror=failLoading;host.append(script);
    timeout=setTimeout(()=>{if(state==='loading')failLoading();},18000);
  }
  new MutationObserver(() => {
    const frame=host.querySelector('iframe');
    if(frame&&!frame.dataset.guestbookObserved){frame.dataset.guestbookObserved='true';frame.title=english()?'Star notes: comments and replies':'星际留言：评论与回复';frame.addEventListener('load',finishLoading,{once:true});}
  }).observe(host,{childList:true,subtree:true});
  window.addEventListener('message',event=>{
    const frame=host.querySelector('iframe');
    if(event.origin!=='https://giscus.app'||!frame||event.source!==frame.contentWindow||!event.data?.giscus)return;
    if(event.data.giscus.error){failLoading();return;}
    if(event.data.giscus.discussion)finishLoading();
  });
  selected.addEventListener('change',()=>choose(selected.value));
  $('guestbookSuggest').addEventListener('click',()=>{const quiz=$('guestbookStarQuiz');quiz.hidden=!quiz.hidden;$('guestbookSuggest').setAttribute('aria-expanded',String(!quiz.hidden));});
  section.querySelectorAll('[data-gb-star]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.gbStar)));
  copy.addEventListener('click',async()=>{
    const star=stars.find(s=>s.id===active);if(!star)return;
    try {await navigator.clipboard.writeText(signature(star));identityStatus.textContent=text('copied');}
    catch {$('guestbookCopyFallback').hidden=false;$('guestbookSignature').focus();$('guestbookSignature').select();}
  });
  loadButton.addEventListener('click',loadComments);
  discussionLink.href=discussionURL();
  try {const remembered=localStorage.getItem(storageKey);if(stars.some(s=>s.id===remembered)){active=remembered;selected.value=active;}} catch {}
  renderLanguage();
  window.addEventListener('portfolio-language-change',renderLanguage);
  if ('IntersectionObserver' in window) {observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();loadComments();}},{rootMargin:'240px 0px'});observer.observe(section);}
  window.portfolioGuestbook={load:loadComments,configured:configured()};
})();
