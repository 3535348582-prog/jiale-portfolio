/* Anonymous identities belong to this device. Public content is always loaded from the server. */
(() => {
  'use strict';
  const root=document.getElementById('anonymousComments');if(!root||root.dataset.mounted)return;root.dataset.mounted='true';
  const $=id=>document.getElementById(id),form=$('anonymousCommentForm'),nickname=$('anonymousNickname'),body=$('anonymousCommentBody'),feed=$('anonymousCommentFeed'),status=$('anonymousCommentStatus'),submit=$('anonymousCommentSubmit'),refresh=$('anonymousCommentRefresh'),more=$('anonymousCommentMore'),mentions=$('anonymousMentionList');
  const formHome=form.parentNode,formNext=form.nextSibling;
  const zh={intro:'无需注册，填写昵称就能留言。昵称和星座会随留言公开显示。',nickname:'访客昵称（可选）',bodyLabel:'留言内容',cancelReply:'取消回复',send:'发送留言',listTitle:'星际留言',refresh:'刷新留言',more:'查看更多留言',placeholder:'留下你的想法，也可以输入 @ 提及其他访客。',defaultName:'星际旅人',loading:'正在接收星际留言…',empty:'还没有留言。来留下第一颗星吧。',loadFailed:'留言暂时未能载入，请点击“刷新留言”重试。',sending:'正在发送…',sent:'留言已送达，其他访客也能看到。',sentRefresh:'留言已送达，列表刷新暂时失败，可稍后点击刷新。',error:'暂时未能完成，请稍后重试。',rate:'操作太频繁，请稍等一会儿再试。',unavailable:'留言服务暂时不可用，请稍后再试。',reply:'回复',replying:'正在回复 ',like:'点赞',liked:'已点赞',remove:'删除',confirmRemove:'确认删除',cancelRemove:'取消',deleted:'这条留言已由作者删除。',deleteConfirm:'删除自己的这条留言？已有回复会保留。',bodyRequired:'请先写下你的想法。',tooLong:'留言最多 1000 字，昵称最多 24 字。',moreFailed:'更多留言暂时未能载入，请重试。',mention:'提及访客'};
  const en={intro:'No account needed. Your nickname and constellation will appear with your public comment.',nickname:'Visitor nickname (optional)',bodyLabel:'Comment',cancelReply:'Cancel reply',send:'Send comment',listTitle:'Star notes',refresh:'Refresh',more:'Load more',placeholder:'Share a thought, or type @ to mention another visitor.',defaultName:'Star traveller',loading:'Receiving star notes…',empty:'No comments yet. Leave the first star.',loadFailed:'Comments could not be loaded. Select Refresh to try again.',sending:'Sending…',sent:'Your comment is public and visible to other visitors.',sentRefresh:'Your comment was saved, but the list could not refresh. Please refresh later.',error:'That could not be completed. Please try again.',rate:'Too many requests. Please wait a moment.',unavailable:'The comment service is temporarily unavailable.',reply:'Reply',replying:'Replying to ',like:'Like',liked:'Liked',remove:'Delete',confirmRemove:'Confirm delete',cancelRemove:'Cancel',deleted:'This comment was deleted by its author.',deleteConfirm:'Delete your comment? Existing replies will remain.',bodyRequired:'Write your thought first.',tooLong:'Comments can have up to 1000 characters; nicknames up to 24.',moreFailed:'More comments could not be loaded. Please retry.',mention:'Mention a visitor'};
  const english=()=>document.documentElement.lang.startsWith('en'),t=key=>(english()?en:zh)[key];
  let config={};try{config=JSON.parse($('portfolioGuestbookConfig')?.textContent||'{}');}catch{}
  const base=String(config.apiBase||'').replace(/\/+$/,'');
  const deleting=new Set();
  const storageKey='jiale.anonymous.visitor.v1';let session=null,sessionTask=null,loadTask=null,items=[],nextCursor=null,loading=false,pending=false,replyingTo=null,mentionItems=[],mentionIndex=0,observer,statusKey='',statusKind='';
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved.token==='string'&&saved.visitor?.id)session=saved;}catch{}
  nickname.value='';nickname.placeholder='';nickname.setAttribute('autocomplete','off');
  function identity(){return window.portfolioConstellationIdentity;}
  function selectedStar(){const api=identity();let value=api?.getSelected?.();if(!value&&session?.visitor.star)value=api?.choose?.(session.visitor.star)||session.visitor.star;if(!value)value=api?.ensure?.()||api?.getSelected?.();return typeof value==='string'?value:value?.id||'Leo';}
  function stars(){return identity()?.stars||[];}
  function starFor(id){return stars().find(s=>s.id===id);}
  function announce(key,kind=''){statusKey=key;statusKind=kind;status.textContent=t(key);status.dataset.kind=kind;}
  function remember(){try{if(session)localStorage.setItem(storageKey,JSON.stringify(session));else localStorage.removeItem(storageKey);}catch{}}
  function errorText(error){return error?.status===429?'rate':error?.status===503?'unavailable':'error';}
  async function request(path,{method='GET',data,authenticated=false}={}){
    if(!base)throw Object.assign(new Error('Unconfigured'),{status:503});
    const headers={Accept:'application/json'};if(data!==undefined)headers['Content-Type']='application/json';if(authenticated&&session?.token)headers.Authorization='Bearer '+session.token;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
    try{const response=await fetch(base+'/api/guestbook'+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data),mode:'cors',credentials:'omit',signal:controller.signal});let result={};try{result=await response.json();}catch{}if(!response.ok)throw Object.assign(new Error('Request failed'),{status:response.status});return result;}finally{clearTimeout(timer);}
  }
  function ensureSession(force=false){if(sessionTask)return sessionTask;sessionTask=updateSession(force).finally(()=>{sessionTask=null;});return sessionTask;}
  async function updateSession(force=false){
    const name=nickname.value.trim()||session?.visitor.nickname||t('defaultName'),star=selectedStar();
    if(force){session=null;remember();}
    if(!session){const result=await request('/session',{method:'POST',data:{nickname:name,star,website:$('anonymousWebsite').value}});if(!result.token||!result.visitor?.id)throw new Error('Invalid visitor response');session={token:result.token,visitor:result.visitor};remember();}
    else if(session.visitor.nickname!==name||session.visitor.star!==star){const result=await request('/session',{method:'PATCH',authenticated:true,data:{nickname:name,star}});session.visitor=result.visitor||{...session.visitor,nickname:name,star};remember();}
    return session;
  }
  async function withSession(operation){try{await ensureSession();return await operation();}catch(error){if(error.status!==401)throw error;await ensureSession(true);return operation();}}
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function button(label,handler,className=''){const node=el('button',className,label);node.type='button';node.addEventListener('click',handler);return node;}
  function avatar(starId){
    const wrap=el('span','anc-avatar'),star=starFor(starId);if(!star){wrap.textContent='✦';wrap.setAttribute('aria-hidden','true');return wrap;}
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 190 150');svg.setAttribute('role','img');svg.setAttribute('aria-label',english()?star.en:star.zh);
    for(const path of star.paths||[]){const line=document.createElementNS(ns,'polyline');line.setAttribute('points',path.map(p=>p.join(',')).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','#d9c18a');line.setAttribute('stroke-width','2');svg.append(line);}
    for(const point of star.points||[]){const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',point[0]);dot.setAttribute('cy',point[1]);dot.setAttribute('r','2.8');dot.setAttribute('fill','#f1dfb3');svg.append(dot);}wrap.append(svg);return wrap;
  }
  function dateLabel(value){const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleString(english()?'en-GB':'zh-CN',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
  function placeForm(){
    const target=replyingTo&&Array.from(feed.children).find(node=>node.dataset.commentId===String(replyingTo.id));
    if(target)target.after(form);else if(formHome)formHome.insertBefore(form,formNext);
    form.dataset.replying=String(!!target);
  }
  function updateReply(){const banner=$('anonymousReplying');banner.hidden=!replyingTo;$('anonymousReplyTarget').textContent=replyingTo?t('replying')+replyingTo.name:'';placeForm();}
  function count(){ $('anonymousCommentCount').textContent=body.value.length+' / 1000'; }
  function insertMention(name){
    const clean=String(name||'').replace(/[\r\n@]/g,'').trim();if(!clean||pending)return;
    const at=body.selectionStart??body.value.length,before=body.value.slice(0,at),match=before.match(/@[^@\n]{0,24}$/),start=match?at-match[0].length:at;
    const inserted='@'+clean+' ',next=body.value.slice(0,start)+inserted+body.value.slice(at);if(next.length>1000)return;
    body.value=next;body.focus();body.setSelectionRange(start+inserted.length,start+inserted.length);closeMentions();count();
  }
  function closeMentions(){mentions.hidden=true;mentions.replaceChildren();mentionItems=[];body.removeAttribute('aria-activedescendant');}
  function refreshMentions(){
    const before=body.value.slice(0,body.selectionStart??body.value.length),match=before.match(/(?:^|\s)@([^@\n]{0,24})$/);if(!match){closeMentions();return;}
    const query=match[1].toLocaleLowerCase(),seen=new Set();mentionItems=items.filter(item=>{const author=item.author;if(!author?.id||seen.has(author.id)||item.deleted)return false;seen.add(author.id);return String(author.nickname||'').toLocaleLowerCase().startsWith(query);}).map(item=>item.author).slice(0,6);
    mentions.replaceChildren();mentions.hidden=!mentionItems.length;mentionIndex=0;
    mentionItems.forEach((author,index)=>{const option=button('@'+author.nickname,()=>insertMention(author.nickname));option.id='anonymousMention'+index;option.setAttribute('role','option');option.setAttribute('aria-selected',String(index===0));option.tabIndex=-1;mentions.append(option);});
    if(mentionItems.length)body.setAttribute('aria-activedescendant','anonymousMention0');else body.removeAttribute('aria-activedescendant');
  }
  function commentNode(item,depth){
    const author=item.author||{},node=el('article','anc-comment'+(depth?' anc-is-reply':''));node.dataset.commentId=String(item.id);
    const head=el('div','anc-comment-head'),meta=el('div','anc-author-meta');head.append(avatar(author.star));
    const name=String(author.nickname||t('defaultName')),nameButton=button(name,()=>insertMention(name),'anc-author-name');nameButton.setAttribute('aria-label',(english()?'Mention ':'提及 ')+name);meta.append(nameButton);
    if(!item.deleted&&String(item.id)===String(config.pinnedCommentId||''))meta.append(el('span','anc-pinned',english()?'Pinned':'置顶'));
    const star=starFor(author.star);if(star)meta.append(el('span','anc-author-star',english()?star.en:star.zh));const date=el('time','anc-time',dateLabel(item.createdAt));date.dateTime=String(item.createdAt||'');meta.append(date);head.append(meta);node.append(head);
    node.append(el('p','anc-comment-body'+(item.deleted?' anc-deleted':''),item.deleted?t('deleted'):String(item.body||'')));
    if(!item.deleted){const actions=el('div','anc-comment-actions');
      actions.append(button(t('reply'),()=>{if(pending)return;replyingTo={id:item.id,name};updateReply();body.focus();if(!body.value)insertMention(name);}));
      const like=button((item.likedByMe?t('liked'):t('like'))+' · '+Math.max(0,Number(item.likes)||0),async()=>{if(like.disabled)return;like.disabled=true;try{const result=await withSession(()=>request('/comments/'+encodeURIComponent(item.id)+'/like',{method:'POST',authenticated:true,data:{}}));const changed=result.comment||result;item.likes=changed.likes??item.likes;item.likedByMe=changed.likedByMe??!item.likedByMe;render();}catch(error){announce(errorText(error),'error');}finally{like.disabled=false;}});like.setAttribute('aria-pressed',String(!!item.likedByMe));actions.append(like);
      if(session?.visitor.id&&session.visitor.id===author.id){
        const id=String(item.id),confirmation=el('span','anc-delete-confirm');confirmation.hidden=true;confirmation.setAttribute('role','group');confirmation.setAttribute('aria-label',t('deleteConfirm'));
        const remove=button(t('remove'),()=>{if(remove.disabled)return;remove.hidden=true;confirmation.hidden=false;confirmRemove.focus();},'anc-delete');remove.disabled=deleting.has(id);
        const confirmRemove=button(t('confirmRemove'),async()=>{
          if(deleting.has(id))return;deleting.add(id);confirmRemove.disabled=true;cancelRemove.disabled=true;remove.disabled=true;
          try{await withSession(()=>request('/comments/'+encodeURIComponent(item.id),{method:'DELETE',authenticated:true}));item.deleted=true;render();try{await load();}catch{}}
          catch(error){announce(errorText(error),'error');}
          finally{deleting.delete(id);render();}
        },'anc-delete-confirm-button');
        const cancelRemove=button(t('cancelRemove'),()=>{confirmation.hidden=true;remove.hidden=false;remove.focus();});
        confirmation.append(el('span','anc-delete-prompt',t('deleteConfirm')),confirmRemove,cancelRemove);actions.append(remove,confirmation);
      }
      node.append(actions);
    }return node;
  }
  function render(){
    if(formHome&&form.parentNode!==formHome)formHome.insertBefore(form,formNext);
    feed.replaceChildren();if(!items.length){feed.append(el('p','anc-empty',t('empty')));more.hidden=true;return;}
    const byId=new Map(items.map(item=>[String(item.id),item])),children=new Map();
    for(const item of items){const parent=item.parentId&&byId.has(String(item.parentId))&&String(item.parentId)!==String(item.id)?String(item.parentId):'';if(!children.has(parent))children.set(parent,[]);children.get(parent).push(item);}
    const seen=new Set();function append(item,depth){const id=String(item.id);if(seen.has(id))return;seen.add(id);feed.append(commentNode(item,depth));for(const child of children.get(id)||[])append(child,Math.min(1,depth+1));}
    const roots=[...(children.get('')||[])];let pinned=byId.get(String(config.pinnedCommentId||''));const ancestors=new Set();
    while(pinned?.parentId&&byId.has(String(pinned.parentId))&&!ancestors.has(String(pinned.id))){ancestors.add(String(pinned.id));pinned=byId.get(String(pinned.parentId));}
    if(pinned){const index=roots.indexOf(pinned);if(index>0)roots.unshift(...roots.splice(index,1));}
    for(const item of roots)append(item,0);for(const item of items)if(!seen.has(String(item.id)))append(item,0);
    more.hidden=!nextCursor;placeForm();
  }
  function load(append=false){if(loadTask){const current=loadTask;return append?current:current.catch(()=>{}).then(()=>load(false));}loadTask=loadNow(append).finally(()=>{loadTask=null;});return loadTask;}
  async function loadNow(append=false){
    loading=true;refresh.disabled=true;more.disabled=true;feed.setAttribute('aria-busy','true');
    if(!items.length){feed.replaceChildren(el('p','anc-empty',t('loading')));}
    try{const cursor=append&&nextCursor?'?cursor='+encodeURIComponent(nextCursor):'';let result;try{result=await request('/comments'+cursor,{authenticated:!!session});}catch(error){if(error.status!==401)throw error;session=null;remember();result=await request('/comments'+cursor);}
      if(!Array.isArray(result.comments))throw new Error('Invalid list response');const incoming=result.comments.filter(item=>item&&item.id!==undefined);items=append?[...new Map([...items,...incoming].map(item=>[String(item.id),item])).values()]:incoming;nextCursor=result.nextCursor||null;render();
    }catch(error){if(!items.length)feed.replaceChildren(el('p','anc-empty',t('loadFailed')));else announce(append?'moreFailed':'loadFailed','error');throw error;}
    finally{loading=false;refresh.disabled=false;more.disabled=false;feed.setAttribute('aria-busy','false');}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending)return;const value=body.value.trim();if(!value){announce('bodyRequired','error');body.focus();return;}if(value.length>1000||nickname.value.trim().length>24){announce('tooLong','error');return;}
    pending=true;submit.disabled=true;body.readOnly=true;nickname.readOnly=true;announce('sending');let saved=false;
    try{await withSession(()=>request('/comments',{method:'POST',authenticated:true,data:{body:value,parentId:replyingTo?.id||null,website:$('anonymousWebsite').value}}));saved=true;body.value='';replyingTo=null;updateReply();closeMentions();count();announce('sent','success');try{await load();}catch{announce('sentRefresh','success');}}
    catch(error){if(!saved)announce(errorText(error),'error');}finally{pending=false;submit.disabled=false;body.readOnly=false;nickname.readOnly=false;}
  });
  body.addEventListener('input',()=>{count();refreshMentions();});body.addEventListener('click',refreshMentions);
  body.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();form.requestSubmit();return;}if(mentions.hidden)return;if(event.key==='Escape'){event.preventDefault();closeMentions();return;}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();mentionIndex=(mentionIndex+(event.key==='ArrowDown'?1:-1)+mentionItems.length)%mentionItems.length;Array.from(mentions.children).forEach((option,index)=>option.setAttribute('aria-selected',String(index===mentionIndex)));body.setAttribute('aria-activedescendant','anonymousMention'+mentionIndex);}else if(event.key==='Enter'&&mentionItems.length){event.preventDefault();insertMention(mentionItems[mentionIndex].nickname);}});
  $('anonymousCancelReply').addEventListener('click',()=>{if(pending)return;replyingTo=null;updateReply();});refresh.addEventListener('click',()=>load().catch(()=>{}));more.addEventListener('click',()=>load(true).catch(()=>{}));
  function language(){root.querySelectorAll('[data-anc-key]').forEach(node=>{node.textContent=t(node.dataset.ancKey);});nickname.placeholder='';body.placeholder=t('placeholder');mentions.setAttribute('aria-label',t('mention'));if(statusKey)announce(statusKey,statusKind);updateReply();count();if(items.length)render();}
  addEventListener('portfolio-language-change',language);language();
  if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load().catch(()=>{});}},{rootMargin:'200px 0px'});observer.observe(root);}else load().catch(()=>{});
  window.portfolioAnonymousComments={refresh:()=>load(),getCount:()=>items.length};
})();
