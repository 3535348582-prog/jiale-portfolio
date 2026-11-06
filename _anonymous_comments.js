/* Anonymous identities belong to this device. Public content is always loaded from the server. */
(() => {
  'use strict';
  const root=document.getElementById('anonymousComments');if(!root||root.dataset.mounted)return;root.dataset.mounted='true';
  const $=id=>document.getElementById(id),form=$('anonymousCommentForm'),nickname=$('anonymousNickname'),body=$('anonymousCommentBody'),feed=$('anonymousCommentFeed'),status=$('anonymousCommentStatus'),submit=$('anonymousCommentSubmit'),refresh=$('anonymousCommentRefresh'),more=$('anonymousCommentMore'),mentions=$('anonymousMentionList');
  const formHome=form.parentNode,formNext=form.nextSibling;
  const identitySave=$('anonymousIdentitySave'),identityStatus=$('anonymousIdentityStatus');let savingIdentity=false,ownerVerified=false,restoreTask=null;
  const zh={intro:'无需注册，填写昵称就能留言。昵称和星座会随留言公开显示。',nickname:'访客昵称（可选）',bodyLabel:'留言内容',cancelReply:'取消回复',send:'发送留言',listTitle:'星际留言',refresh:'刷新留言',more:'查看更多留言',placeholder:'留下你的想法，也可以输入 @ 提及其他访客。',defaultName:'星际旅人',loading:'正在接收星际留言…',empty:'还没有留言。来留下第一颗星吧。',loadFailed:'留言暂时未能载入，请点击“刷新留言”重试。',sending:'正在发送…',sent:'留言已送达，其他访客也能看到。',sentRefresh:'留言已送达，列表刷新暂时失败，可稍后点击刷新。',error:'暂时未能完成，请稍后重试。',rate:'操作太频繁，请稍等一会儿再试。',unavailable:'留言服务暂时不可用，请稍后再试。',reply:'回复',replying:'正在回复 ',like:'点赞',liked:'已点赞',remove:'删除',confirmRemove:'确认删除',cancelRemove:'取消',deleted:'这条留言已由作者删除。',deleteConfirm:'删除自己的这条留言？已有回复会保留。',bodyRequired:'请先写下你的想法。',tooLong:'留言最多 1000 字，昵称最多 24 字。',moreFailed:'更多留言暂时未能载入，请重试。',mention:'提及访客'};
  const en={intro:'No account needed. Your nickname and constellation will appear with your public comment.',nickname:'Visitor nickname (optional)',bodyLabel:'Comment',cancelReply:'Cancel reply',send:'Send comment',listTitle:'Star notes',refresh:'Refresh',more:'Load more',placeholder:'Share a thought, or type @ to mention another visitor.',defaultName:'Star traveller',loading:'Receiving star notes…',empty:'No comments yet. Leave the first star.',loadFailed:'Comments could not be loaded. Select Refresh to try again.',sending:'Sending…',sent:'Your comment is public and visible to other visitors.',sentRefresh:'Your comment was saved, but the list could not refresh. Please refresh later.',error:'That could not be completed. Please try again.',rate:'Too many requests. Please wait a moment.',unavailable:'The comment service is temporarily unavailable.',reply:'Reply',replying:'Replying to ',like:'Like',liked:'Liked',remove:'Delete',confirmRemove:'Confirm delete',cancelRemove:'Cancel',deleted:'This comment was deleted by its author.',deleteConfirm:'Delete your comment? Existing replies will remain.',bodyRequired:'Write your thought first.',tooLong:'Comments can have up to 1000 characters; nicknames up to 24.',moreFailed:'More comments could not be loaded. Please retry.',mention:'Mention a visitor'};
  Object.assign(zh,{saveIdentity:'保存发言信息',identitySaving:'正在保存…',identitySaved:'发言信息已保存。',identityRequired:'请先填写昵称，再保存发言信息。',identityHelp:'填写昵称并选择星座后可保存。',identityCurrent:'当前以 {name} · {star} 发言'});
  Object.assign(en,{saveIdentity:'Save identity',identitySaving:'Saving…',identitySaved:'Your comment identity is saved.',identityRequired:'Enter a nickname before saving your identity.',identityHelp:'Enter a nickname and choose a constellation to save your identity.',identityCurrent:'Posting as {name} · {star}'});
  Object.assign(zh,{owner:'站主',ownerIdentity:'已识别站主 · 沈佳乐 · 狮子座'});
  Object.assign(en,{owner:'Creator',ownerIdentity:'Site creator · Jiale Shen · Leo'});
  Object.assign(zh,{entryEyebrow:'JIALE / 星空入口',entryTitle:'欢迎来到这片星空。',entryIntro:'选一个身份，开始这次探索。',entryGuest:'以访客身份进入',entryGuestHelp:'直接浏览，也可以正常留言交流。',entryOwner:'我是站主，验证进入',entryOwnerHelp:'验证码仅发送至站主的 QQ 邮箱。',entryMailTitle:'验证站主身份',entryMailHint:'验证码将发送至 353****582@qq.com，发送成功后 60 秒内有效。',entryCodeLabel:'邮箱验证码',entryVerify:'验证并进入',entryResend:'重新发送验证码',entryBack:'返回身份选择',entrySwitch:'切换进入身份',entrySafety:'页面内容仅由站主维护，访客可以正常留言交流。',entrySending:'正在发送验证码…',entryChecking:'正在验证…',entrySent:'验证码已发送至 353****582@qq.com。',entryCodeInvalid:'验证码不正确、已过期或已使用，请重新获取。',entryFormat:'请输入六位数字验证码。',entryExpired:'验证码已过期，请重新获取。',entryMailUnavailable:'邮箱验证暂未配置完成，暂时无法发送验证码。你仍可作为访客浏览和留言。',entryMailFailed:'验证码暂时未能发送，请稍后重试。',entryRate:'请求较频繁，请等待倒计时结束后重试。',entryRequired:'请先选择进入身份。',entryOwnerRequired:'请重新验证站主身份后再操作。',entrySeconds:'有效期还剩 {seconds} 秒',entryCooldown:'{seconds} 秒后可重发',entryRequest:'发送验证码'});
  Object.assign(en,{entryEyebrow:'JIALE / STAR GATE',entryTitle:'Welcome to this little universe.',entryIntro:'Choose how you would like to enter.',entryGuest:'Enter as a visitor',entryGuestHelp:'Explore freely, and join the conversation.',entryOwner:'Verify as the site creator',entryOwnerHelp:'The code goes only to the creator’s QQ mailbox.',entryMailTitle:'Verify the site creator',entryMailHint:'The code goes to 353****582@qq.com and is valid for 60 seconds after sending.',entryCodeLabel:'Email verification code',entryVerify:'Verify and enter',entryResend:'Send a new code',entryBack:'Back to identity choice',entrySwitch:'Switch entry identity',entrySafety:'Page content is maintained by the creator. Visitors are welcome to comment and reply.',entrySending:'Sending the code…',entryChecking:'Verifying…',entrySent:'A code was sent to 353****582@qq.com.',entryCodeInvalid:'The code is incorrect, expired or already used. Request a new code.',entryFormat:'Enter a six-digit code.',entryExpired:'The code has expired. Request a new one.',entryMailUnavailable:'Email verification is not configured yet, so a code cannot be sent. You can still enter as a visitor.',entryMailFailed:'The code could not be sent. Please try again later.',entryRate:'Too many requests. Wait until the countdown ends and try again.',entryRequired:'Choose an entry identity first.',entryOwnerRequired:'Verify the creator identity again before continuing.',entrySeconds:'Code expires in {seconds}s',entryCooldown:'Resend in {seconds}s',entryRequest:'Send a code'});
  Object.assign(zh,{entryOwnerHelp:'通过私密口令和邮箱验证码进入。',entryKeyLabel:'站主私密口令',entryKeyHelp:'口令正确后，才会向站主邮箱发送验证码。',entryKeyResend:'每次发送或重发都需填写口令，发送后会自动清空。',entryKeyRequired:'请先填写 16–128 位站主私密口令。',entryKeyInvalid:'站主口令不正确，验证码未发送。',entryKeyUnavailable:'站主发送口令尚未配置，暂时无法发送验证码。你仍可作为访客进入。',entryMailUnconfirmed:'未能确认验证码发送，请稍后手动重试。'});
  Object.assign(en,{entryOwnerHelp:'Enter with the private passphrase and an email code.',entryKeyLabel:'Private creator passphrase',entryKeyHelp:'Only a correct passphrase can send a code to the creator’s mailbox.',entryKeyResend:'Enter the passphrase for each send or resend. The field clears after sending.',entryKeyRequired:'Enter a private creator passphrase with 16–128 characters.',entryKeyInvalid:'The creator passphrase is incorrect. No code was sent.',entryKeyUnavailable:'The creator’s sending passphrase is not configured yet. You can still enter as a visitor.',entryMailUnconfirmed:'Code delivery could not be confirmed. Please retry manually later.'});
  const english=()=>document.documentElement.lang.startsWith('en'),t=key=>(english()?en:zh)[key];
  let config={};try{config=JSON.parse($('portfolioGuestbookConfig')?.textContent||'{}');}catch{}
  const base=String(config.apiBase||'').replace(/\/+$/,'');
  const deleting=new Set();
  const gate=$('portfolioEntryGate'),guestStorageKey='jiale.anonymous.guest.v1',ownerStorageKey='jiale.anonymous.owner.v1';
  let entryMode=gate?'choice':'guest',ownerGrant='',grantExpiresAt=0,gateVersion=0,codeChallenge='',codeExpiresAt=0,resendAt=0,requestingCode=false,verifyingCode=false,entryMessage='',entryMessageKind='',gateTimer=null,priorFocus=null,inertNodes=[],savedOverflow='';
  const storageKey='jiale.anonymous.visitor.v1';let session=null,sessionTask=null,loadTask=null,items=[],nextCursor=null,loading=false,pending=false,replyingTo=null,mentionItems=[],mentionIndex=0,observer,statusKey='',statusKind='';
  function readIdentity(key){try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved.token==='string'&&saved.token&&saved.visitor?.id)return {token:saved.token,visitor:{id:saved.visitor.id,nickname:saved.visitor.nickname,star:saved.visitor.star,knownOwner:saved.visitor.knownOwner===true,isOwner:false}};}catch{}return null;}
  const legacyIdentity=readIdentity(storageKey);if(!gate)session=readIdentity(guestStorageKey)||legacyIdentity;
  nickname.value='';nickname.placeholder='';nickname.setAttribute('autocomplete','off');
  function identity(){return window.portfolioConstellationIdentity;}
  function hasGrant(){return !!ownerGrant&&Date.now()<grantExpiresAt;}
  function isOwner(){return entryMode==='owner'&&hasGrant()&&ownerVerified&&session?.visitor.isOwner===true;}
  function acceptVisitor(visitor){
    if(!visitor?.id)throw new Error('Invalid visitor response');
    ownerVerified=entryMode==='owner'&&hasGrant()&&visitor.isOwner===true;session.visitor={...visitor,isOwner:ownerVerified,knownOwner:visitor.knownOwner===true};
    if(ownerVerified){session.visitor.nickname='沈佳乐';session.visitor.star='Leo';nickname.value='';identity()?.choose?.('Leo');}
    remember();
  }
  async function restoreSession(){
    try{const result=await request('/session',{authenticated:true});if(!result.visitor){session=null;ownerVerified=false;remember();return;}acceptVisitor(result.visitor);}
    catch(error){if(error.status===401){session=null;ownerVerified=false;remember();}}
  }
  function selectedStar(){if(isOwner()){identity()?.choose?.('Leo');return 'Leo';}const api=identity();let value=api?.getSelected?.();if(!value&&session?.visitor.star)value=api?.choose?.(session.visitor.star)||session.visitor.star;if(!value)value=api?.ensure?.()||api?.getSelected?.();return typeof value==='string'?value:value?.id||'Leo';}
  function stars(){return identity()?.stars||[];}
  function starFor(id){return stars().find(s=>s.id===id);}
  function announce(key,kind=''){statusKey=key;statusKind=kind;status.textContent=t(key);status.dataset.kind=kind;}
  function updateIdentityUI(){
    const owner=isOwner();form.dataset.owner=String(owner);nickname.disabled=owner;
    if(identitySave){identitySave.hidden=owner;identitySave.textContent=t(savingIdentity?'identitySaving':'saveIdentity');identitySave.disabled=owner||savingIdentity||pending;}
    const starControls=$('guestbookIdentity');if(starControls)starControls.hidden=owner;
    if(identityStatus){const star=starFor(session?.visitor.star);identityStatus.textContent=owner?t('ownerIdentity'):session?t('identityCurrent').replace('{name}',session.visitor.nickname).replace('{star}',star?(english()?star.en:star.zh):session.visitor.star):t('identityHelp');}
  }
  function storeIdentity(key,value){try{if(value){const visitor=value.visitor;localStorage.setItem(key,JSON.stringify({token:value.token,visitor:{id:visitor.id,nickname:visitor.nickname,star:visitor.star,knownOwner:visitor.knownOwner===true,isOwner:false}}));}else localStorage.removeItem(key);}catch{}}
  function remember(){if(entryMode==='owner')storeIdentity(ownerStorageKey,session);else if(entryMode==='guest')storeIdentity(guestStorageKey,session);updateIdentityUI();}
  function errorText(error){return error?.code==='owner_verification_required'?'entryOwnerRequired':error?.code==='entry_required'?'entryRequired':error?.status===429?'rate':error?.status===503?'unavailable':'error';}
  async function request(path,{method='GET',data,authenticated=false}={}){
    if(!base)throw Object.assign(new Error('Unconfigured'),{status:503});
    const headers={Accept:'application/json'};if(data!==undefined)headers['Content-Type']='application/json';if(authenticated&&session?.token){headers.Authorization='Bearer '+session.token;if(hasGrant())headers['X-Owner-Grant']=ownerGrant;}
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),path==='/owner/request-code'?30000:18000);
    try{const response=await fetch(base+'/api/guestbook'+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data),mode:'cors',credentials:'omit',signal:controller.signal});let result={};try{result=await response.json();}catch{}if(!response.ok)throw Object.assign(new Error('Request failed'),{status:response.status,code:result.code||'',retryAfter:Number(result.retryAfter||response.headers?.get?.('Retry-After'))||0});return result;}finally{clearTimeout(timer);}
  }
  function ensureSession(force=false){if(sessionTask)return sessionTask;sessionTask=(async()=>{if(restoreTask)await restoreTask;return updateSession(force);})().finally(()=>{sessionTask=null;});return sessionTask;}
  async function updateSession(force=false){
    if(entryMode==='choice')throw Object.assign(new Error('Choose entry identity'),{status:403,code:'entry_required'});
    if(entryMode==='owner'&&!isOwner())throw Object.assign(new Error('Creator verification required'),{status:403,code:'owner_verification_required'});
    if(entryMode==='guest'&&!session&&!force){const candidate=readIdentity(guestStorageKey)||legacyIdentity;if(candidate){try{await activateGuestIdentity(candidate);}catch(error){session=null;ownerVerified=false;updateIdentityUI();if(error.status!==401)throw error;storeIdentity(guestStorageKey,null);}}}
    if(entryMode==='guest'&&session?.visitor.knownOwner){storeIdentity(ownerStorageKey,session);session=null;ownerVerified=false;}
    const name=isOwner()?'沈佳乐':nickname.value.trim()||session?.visitor.nickname||t('defaultName'),star=selectedStar();
    if(force){session=null;ownerVerified=false;remember();}
    if(!session){const result=await request('/session',{method:'POST',data:{nickname:name,star,website:$('anonymousWebsite').value}});if(!result.token||!result.visitor?.id)throw new Error('Invalid visitor response');session={token:result.token,visitor:result.visitor};acceptVisitor(result.visitor);}
    else if(session.visitor.nickname!==name||session.visitor.star!==star){const result=await request('/session',{method:'PATCH',authenticated:true,data:{nickname:name,star}});acceptVisitor(result.visitor||{...session.visitor,nickname:name,star});}
    return session;
  }
  async function withSession(operation){try{await ensureSession();return await operation();}catch(error){if(entryMode==='owner'&&(error.status===401||error.code==='owner_verification_required')){openEntryChoice();setEntryMessage('entryOwnerRequired','error');throw error;}if(error.status!==401)throw error;await ensureSession(true);return operation();}}
  identitySave?.addEventListener('click',async()=>{
    if(savingIdentity||pending)return;
    if(!session&&!nickname.value.trim()){announce('identityRequired','error');nickname.focus();return;}
    if(nickname.value.trim().length>24){announce('tooLong','error');return;}
    savingIdentity=true;submit.disabled=true;nickname.readOnly=true;updateIdentityUI();
    try{await withSession(()=>Promise.resolve(session));nickname.value='';announce('identitySaved','success');try{await load();}catch{render();}}
    catch(error){announce(errorText(error),'error');}
    finally{savingIdentity=false;submit.disabled=false;nickname.readOnly=false;updateIdentityUI();}
  });

  function asTime(value){const number=Number(value);if(Number.isFinite(number)&&number>0)return number<1e12?number*1000:number;const parsed=Date.parse(value);return Number.isFinite(parsed)?parsed:0;}
  function clearOwnerGrant(){ownerGrant='';grantExpiresAt=0;ownerVerified=false;if(session)session.visitor.isOwner=false;updateIdentityUI();}
  function setEntryMessage(key,kind=''){entryMessage=key;entryMessageKind=kind;const node=$('entryStatus');if(node){node.textContent=key?t(key):'';node.dataset.kind=kind;}}
  function entryError(error,verifying=false){if(error?.code==='owner_code_invalid')return 'entryCodeInvalid';if(error?.code==='invalid_owner_code_request')return 'entryFormat';if(error?.code==='owner_key_required')return 'entryKeyRequired';if(error?.code==='owner_key_invalid')return 'entryKeyInvalid';if(error?.code==='owner_key_unavailable')return 'entryKeyUnavailable';if(error?.code==='owner_mail_unavailable')return 'entryMailUnavailable';if(error?.code==='owner_mail_failed')return 'entryMailUnconfirmed';return error?.status===429?'entryRate':verifying?'error':'entryMailFailed';}
  function entryTick(){
    const now=Date.now(),left=Math.max(0,Math.ceil((codeExpiresAt-now)/1000)),wait=Math.max(0,Math.ceil((resendAt-now)/1000));
    const timer=$('entryCodeTimer'),resend=$('entryResend'),verify=$('entryVerify'),owner=$('entryOwner');
    if(timer)timer.textContent=codeChallenge?(left?t('entrySeconds').replace('{seconds}',left):t('entryExpired')):'';
    if(resend){resend.disabled=requestingCode||verifyingCode||wait>0;resend.textContent=requestingCode?t('entrySending'):wait?t('entryCooldown').replace('{seconds}',wait):t(codeChallenge?'entryResend':'entryRequest');}
    if(verify){verify.disabled=requestingCode||verifyingCode||!codeChallenge||!left;verify.textContent=t(verifyingCode?'entryChecking':'entryVerify');}
    if(owner)owner.disabled=false;const key=$('entryOwnerKey');if(key)key.disabled=requestingCode||verifyingCode;
    if(ownerGrant&&!hasGrant()){clearOwnerGrant();openEntryChoice();setEntryMessage('entryOwnerRequired','error');}
  }
  function showEntryChoice(){if(!gate)return;gate.setAttribute('aria-labelledby','entryTitle');gate.setAttribute('aria-describedby','entryIntro');$('entryChoice').hidden=false;$('entryOwnerPanel').hidden=true;$('entryGuest').focus({preventScroll:true});}
  function openEntryChoice(){
    if(!gate)return;gateVersion++;if(session&&entryMode!=='choice')remember();clearOwnerGrant();entryMode='choice';codeChallenge='';codeExpiresAt=0;$('entryCode').value='';$('entryOwnerKey').value='';setEntryMessage('');
    if(gate.hidden){priorFocus=document.activeElement;savedOverflow=document.body.style.overflow;gate.hidden=false;document.body.style.overflow='hidden';inertNodes=Array.from(document.body.children).filter(node=>node!==gate).map(node=>[node,node.inert]);for(const [node] of inertNodes)node.inert=true;}
    showEntryChoice();entryTick();
  }
  function closeEntryGate(){if(!gate)return;gateVersion++;gate.hidden=true;for(const [node,inert] of inertNodes)node.inert=inert;inertNodes=[];document.body.style.overflow=savedOverflow;if(priorFocus?.isConnected&&!gate.contains(priorFocus))priorFocus.focus({preventScroll:true});}
  async function activateGuestIdentity(candidate){
    session=candidate;const result=await request('/session',{authenticated:true});if(result.visitor?.knownOwner){storeIdentity(ownerStorageKey,{token:candidate.token,visitor:result.visitor});session=null;ownerVerified=false;const created=await request('/session',{method:'POST',data:{nickname:t('defaultName'),star:selectedStar(),website:''}});session={token:created.token,visitor:created.visitor};acceptVisitor(created.visitor);}else if(result.visitor)acceptVisitor(result.visitor);else {session=null;updateIdentityUI();}
  }
  async function enterGuest(){
    if(!gate)return;gateVersion++;if(entryMode==='owner'&&session)storeIdentity(ownerStorageKey,session);clearOwnerGrant();$('entryOwnerKey').value='';entryMode='guest';nickname.value='';const candidate=readIdentity(guestStorageKey)||legacyIdentity;session=null;updateIdentityUI();closeEntryGate();
    restoreTask=(async()=>{if(!candidate)return;try{await activateGuestIdentity(candidate);}catch{session=null;ownerVerified=false;updateIdentityUI();}})().finally(()=>{restoreTask=null;});
    await restoreTask;load().catch(()=>{});
  }
  async function prepareOwnerIdentity(version){
    if(restoreTask)await restoreTask;
    if(version!==gateVersion)return;
    const stored=readIdentity(ownerStorageKey),candidate=stored||legacyIdentity;entryMode='owner';session=candidate;clearOwnerGrant();
    if(candidate){try{const result=await request('/session',{authenticated:true});if(version!==gateVersion)return;if(result.visitor&&(stored||result.visitor.knownOwner)){acceptVisitor(result.visitor);return;}}catch(error){if(error.status!==401)throw error;}}
    const created=await request('/session',{method:'POST',data:{nickname:'沈佳乐',star:'Leo',website:''}});if(version!==gateVersion)return;if(!created.token||!created.visitor?.id)throw new Error('Invalid visitor response');session={token:created.token,visitor:created.visitor};acceptVisitor(created.visitor);
  }
  function showOwnerPanel(){if(!gate)return;$('entryChoice').hidden=true;$('entryOwnerPanel').hidden=false;gate.setAttribute('aria-labelledby','entryMailTitle');gate.setAttribute('aria-describedby','entryKeyHelp');const key=$('entryOwnerKey');if(!key.disabled)key.focus({preventScroll:true});else $('entryBack').focus({preventScroll:true});entryTick();}
  async function requestOwnerCode(){
    if(!gate||requestingCode||verifyingCode)return;showOwnerPanel();
    if(Date.now()<resendAt){setEntryMessage('entryRate','error');entryTick();return;}
    let ownerKey=$('entryOwnerKey').value.trim();if(ownerKey.length<16||ownerKey.length>128){setEntryMessage('entryKeyRequired','error');$('entryOwnerKey').focus({preventScroll:true});return;}
    const version=gateVersion;requestingCode=true;setEntryMessage('entrySending');entryTick();
    try{await prepareOwnerIdentity(version);if(version!==gateVersion)return;const result=await request('/owner/request-code',{method:'POST',authenticated:true,data:{ownerKey}});ownerKey='';if(version!==gateVersion)return;$('entryOwnerKey').value='';const expires=asTime(result.expiresAt);if(!result.challengeId||expires<=Date.now())throw new Error('Invalid code response');codeChallenge=String(result.challengeId);codeExpiresAt=expires;resendAt=Date.now()+Math.max(0,Number(result.resendAfter??result.retryAfter??60))*1000;$('entryCode').value='';setEntryMessage('entrySent','success');$('entryCode').focus({preventScroll:true});}
    catch(error){if(version!==gateVersion)return;if(error.retryAfter)resendAt=Date.now()+error.retryAfter*1000;setEntryMessage(entryError(error),'error');}
    finally{ownerKey='';if(version===gateVersion)$('entryOwnerKey').value='';requestingCode=false;entryTick();}
  }
  async function verifyOwnerCode(event){
    event?.preventDefault();if(!gate||verifyingCode||requestingCode)return;const code=$('entryCode').value.trim();if(!/^\d{6}$/.test(code)){setEntryMessage('entryFormat','error');$('entryCode').focus({preventScroll:true});return;}if(!codeChallenge||Date.now()>=codeExpiresAt){setEntryMessage('entryExpired','error');entryTick();return;}
    const version=gateVersion;verifyingCode=true;setEntryMessage('entryChecking');entryTick();
    try{const result=await request('/owner/verify-code',{method:'POST',authenticated:true,data:{challengeId:codeChallenge,code}});if(version!==gateVersion)return;const expires=asTime(result.expiresAt);if(typeof result.grantToken!=='string'||!result.grantToken||expires<=Date.now()||result.visitor?.isOwner!==true)throw new Error('Invalid verification response');ownerGrant=result.grantToken;grantExpiresAt=expires;entryMode='owner';acceptVisitor(result.visitor);codeChallenge='';codeExpiresAt=0;$('entryCode').value='';$('entryOwnerKey').value='';setEntryMessage('');closeEntryGate();load().catch(()=>{});}
    catch(error){if(version!==gateVersion)return;if(error.retryAfter)resendAt=Date.now()+error.retryAfter*1000;setEntryMessage(entryError(error,true),'error');}
    finally{verifyingCode=false;entryTick();}
  }
  function initEntryGate(){
    if(!gate)return;document.body.append(gate);priorFocus=document.activeElement;savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';inertNodes=Array.from(document.body.children).filter(node=>node!==gate).map(node=>[node,node.inert]);for(const [node] of inertNodes)node.inert=true;
    $('entryGuest').addEventListener('click',()=>enterGuest());$('entryOwner').addEventListener('click',showOwnerPanel);$('entryResend').addEventListener('click',requestOwnerCode);$('entryBack').addEventListener('click',openEntryChoice);$('entryCodeForm').addEventListener('submit',verifyOwnerCode);$('entryCode').addEventListener('input',()=>{$('entryCode').value=$('entryCode').value.replace(/\D/g,'').slice(0,6);});
    $('anonymousIdentitySwitch')?.addEventListener('click',()=>{if(!pending&&!savingIdentity)openEntryChoice();});
    gate.addEventListener('keydown',event=>{if(gate.hidden)return;event.stopPropagation();if(event.key==='Escape'){event.preventDefault();openEntryChoice();return;}if(event.key==='Tab'){const controls=Array.from(gate.querySelectorAll('button,input')).filter(node=>!node.disabled&&!node.hidden&&!node.closest('[hidden]'));if(!controls.length)return;const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
    addEventListener('pageshow',event=>{if(event.persisted){session=null;openEntryChoice();}});gateTimer=setInterval(entryTick,1000);showEntryChoice();entryTick();
  }

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
    const author=item.author||{},owner=author.isOwner===true,node=el('article','anc-comment'+(depth?' anc-is-reply':'')+(owner?' anc-is-owner':''));node.dataset.commentId=String(item.id);
    const head=el('div','anc-comment-head'),meta=el('div','anc-author-meta');head.append(avatar(owner?'Leo':author.star));
    const name=owner?'沈佳乐':String(author.nickname||t('defaultName')),nameButton=button(name,()=>insertMention(name),'anc-author-name');nameButton.setAttribute('aria-label',(english()?'Mention ':'提及 ')+name);meta.append(nameButton);
    if(owner)meta.append(el('span','anc-owner-badge',t('owner')));
    if(!item.deleted&&String(item.id)===String(config.pinnedCommentId||''))meta.append(el('span','anc-pinned',english()?'Pinned':'置顶'));
    const star=starFor(owner?'Leo':author.star);if(star)meta.append(el('span','anc-author-star',english()?star.en:star.zh));const date=el('time','anc-time',dateLabel(item.createdAt));date.dateTime=String(item.createdAt||'');meta.append(date);head.append(meta);node.append(head);
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
    try{const cursor=append&&nextCursor?'?cursor='+encodeURIComponent(nextCursor):'';let result;try{result=await request('/comments'+cursor,{authenticated:!!session});}catch(error){if(error.status!==401)throw error;session=null;ownerVerified=false;remember();result=await request('/comments'+cursor);}
      if(!Array.isArray(result.comments))throw new Error('Invalid list response');const incoming=result.comments.filter(item=>item&&item.id!==undefined);items=append?[...new Map([...items,...incoming].map(item=>[String(item.id),item])).values()]:incoming;nextCursor=result.nextCursor||null;render();
    }catch(error){if(!items.length)feed.replaceChildren(el('p','anc-empty',t('loadFailed')));else announce(append?'moreFailed':'loadFailed','error');throw error;}
    finally{loading=false;refresh.disabled=false;more.disabled=false;feed.setAttribute('aria-busy','false');}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending||savingIdentity)return;const value=body.value.trim();if(!value){announce('bodyRequired','error');body.focus();return;}if(value.length>1000||nickname.value.trim().length>24){announce('tooLong','error');return;}
    pending=true;submit.disabled=true;body.readOnly=true;nickname.readOnly=true;updateIdentityUI();announce('sending');let saved=false;
    try{await withSession(()=>request('/comments',{method:'POST',authenticated:true,data:{body:value,parentId:replyingTo?.id||null,website:$('anonymousWebsite').value}}));saved=true;body.value='';replyingTo=null;updateReply();closeMentions();count();announce('sent','success');try{await load();}catch{announce('sentRefresh','success');}}
    catch(error){if(!saved)announce(errorText(error),'error');}finally{pending=false;submit.disabled=false;body.readOnly=false;nickname.readOnly=false;updateIdentityUI();}
  });
  body.addEventListener('input',()=>{count();refreshMentions();});body.addEventListener('click',refreshMentions);
  body.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();form.requestSubmit();return;}if(mentions.hidden)return;if(event.key==='Escape'){event.preventDefault();closeMentions();return;}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();mentionIndex=(mentionIndex+(event.key==='ArrowDown'?1:-1)+mentionItems.length)%mentionItems.length;Array.from(mentions.children).forEach((option,index)=>option.setAttribute('aria-selected',String(index===mentionIndex)));body.setAttribute('aria-activedescendant','anonymousMention'+mentionIndex);}else if(event.key==='Enter'&&mentionItems.length){event.preventDefault();insertMention(mentionItems[mentionIndex].nickname);}});
  $('anonymousCancelReply').addEventListener('click',()=>{if(pending)return;replyingTo=null;updateReply();});refresh.addEventListener('click',()=>load().catch(()=>{}));more.addEventListener('click',()=>load(true).catch(()=>{}));
  function language(){if(gate){gate.querySelectorAll('[data-entry-key]').forEach(node=>node.textContent=t(node.dataset.entryKey));if(entryMessage)setEntryMessage(entryMessage,entryMessageKind);entryTick();}root.querySelectorAll('[data-entry-key]').forEach(node=>node.textContent=t(node.dataset.entryKey));root.querySelectorAll('[data-anc-key]').forEach(node=>{node.textContent=t(node.dataset.ancKey);});nickname.placeholder='';body.placeholder=t('placeholder');mentions.setAttribute('aria-label',t('mention'));if(statusKey)announce(statusKey,statusKind);updateReply();updateIdentityUI();count();if(items.length)render();}
  addEventListener('portfolio-language-change',language);language();
  if(gate)initEntryGate();else if(session)restoreTask=restoreSession().finally(()=>{restoreTask=null;});
  if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load().catch(()=>{});}},{rootMargin:'200px 0px'});observer.observe(root);}else load().catch(()=>{});
  window.portfolioAnonymousComments={refresh:()=>load(),getCount:()=>items.length};
})();
