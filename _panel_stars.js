/* Decorate information cards without changing their content or hit targets. */
(()=>{
  'use strict';
  function mount(){
    const cards=[...document.querySelectorAll('.ai-lab,.ai-tool,.skill-card,.role-grid>article,.profile-summary,.education-aside,.experience-card,.case-card,.project-card,.qualification')];
    const definitions=window.portfolioConstellations||[];
    const byId=new Map(definitions.map(c=>[c.id,c]));
    const used=new Set(['Leo']);
    const assignments=new WeakMap();
    const groups=[['.role-grid>article',['UMi','Lyr','Gem']],['.ai-tool',['Cyg','Cep','Aql','And']],['.skill-card',['Tau','Vir','CrB']],['.education-aside',['Aur']],['.ai-lab',['Peg']],['.qualification',['Tri']]];
    for(const [selector,ids] of groups)document.querySelectorAll(selector).forEach((card,i)=>{if(byId.has(ids[i])){assignments.set(card,byId.get(ids[i]));used.add(ids[i]);}});
    document.querySelectorAll('.qualification').forEach(card=>assignments.set(card,byId.get('Tri')));
    cards.forEach(card=>{
      if(card.matches('.profile-summary'))assignments.set(card,byId.get('Leo'));
      if(!assignments.has(card)){const c=definitions.find(c=>!used.has(c.id));if(c){assignments.set(card,c);used.add(c.id);}}
      const c=assignments.get(card);if(c){card.classList.add('panel-constellation');card.dataset.constellation=c.id;card.dataset.constellationName=c.zh;}
    });
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
      for(const entry of entries)entry.target.classList.toggle('is-gold-visible',entry.isIntersecting);
    },{threshold:0}):null;
    cards.forEach((card,index)=>{
      if(card.classList.contains('panel-gilded'))return;
      card.classList.add('panel-gilded');
      card.style.setProperty('--gold-delay',`${-(index%7)*.83}s`);
      const edge=document.createElement('span');
      edge.className='panel-gold-edge';edge.setAttribute('aria-hidden','true');
      edge.append(document.createElement('span'));
      const wash=document.createElement('span');
      wash.className='panel-gold-wash';wash.setAttribute('aria-hidden','true');
      card.append(edge,wash);
      if(observer)observer.observe(card);else card.classList.add('is-gold-visible');
    });

    const fine=matchMedia('(hover:hover) and (pointer:fine)');
    const states=new WeakMap();
    let active=null;
    function stop(){
      if(active){active.card.classList.remove('is-star-active');clearTimeout(active.timer);active=null;}
    }
    function stateFor(card){
      if(states.has(card))return states.get(card);
      const layer=document.createElement('div');layer.className='panel-star-interaction';layer.setAttribute('aria-hidden','true');
      const scout=document.createElement('span');scout.className='panel-star-scout';
      const c=assignments.get(card);
      scout.innerHTML='<svg viewBox="0 0 190 150" focusable="false" aria-hidden="true">'+c.paths.map(path=>'<polyline pathLength="1" points="'+path.map(p=>p.join(',')).join(' ')+'"/>').join('')+c.points.map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===0?2.2:1.35)+'"/>').join('')+'</svg>';
      const label=document.createElement('span');label.className='panel-constellation-name';
      label.textContent=c.zh+' · '+c.en.toUpperCase();scout.append(label);
      layer.append(scout);card.append(layer);
      const state={card,scout,timer:0,mode:''};states.set(card,state);return state;
    }
    // Reserve every chart's own document-flow footer before any interaction.
    // Text and links retain their original space; hovering never changes height.
    cards.forEach(card=>{if(assignments.has(card))stateFor(card);});
    function place(card,x,y,mode){
      if(active?.card!==card){stop();active=stateFor(card);}
      active.mode=mode;clearTimeout(active.timer);
      active.card.classList.add('is-star-active');
      if(mode==='touch')active.timer=setTimeout(stop,2200);
    }
    document.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||!fine.matches)return;
      const card=event.target.closest?.('.panel-constellation');
      if(card)place(card,event.clientX,event.clientY,'pointer');
      else if(active?.mode==='pointer')stop();
    },{passive:true});
    document.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='touch')return;
      const card=event.target.closest?.('.panel-constellation');
      if(card)place(card,event.clientX,event.clientY,'touch');
    },{passive:true});
    document.addEventListener('focusin',event=>{
      const card=event.target.closest?.('.panel-constellation');if(!card)return;
      const r=event.target.getBoundingClientRect();place(card,r.left+r.width/2,r.top+r.height/2,'focus');
    });
    document.addEventListener('focusout',event=>{
      if(active?.mode==='focus'&&!active.card.contains(event.relatedTarget))stop();
    });
    document.addEventListener('pointerout',event=>{if(!event.relatedTarget&&active?.mode==='pointer')stop();});
    addEventListener('scroll',()=>{if(active?.mode!=='focus')stop();},{passive:true});
    addEventListener('resize',stop,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
