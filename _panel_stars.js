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
    const smallScreen=matchMedia('(max-width:760px)');
    const touchMode=()=>smallScreen.matches||!fine.matches;
    const states=new WeakMap();
    let hovered=null;
    const english=()=>document.documentElement.lang.startsWith('en');
    function isPersistent(state){return state.manual==='shown'||(state.manual!=='hidden'&&state.seen);}
    function isVisible(state){return state.manual!=='hidden'&&(isPersistent(state)||state.hovered||state.focused);}
    function render(state){
      const visible=isVisible(state),persistent=isPersistent(state),en=english();
      state.card.classList.toggle('is-star-active',visible);
      state.card.classList.toggle('is-star-pinned',persistent);
      const action=persistent?'hide':visible?'pin':'show';
      state.toggle.textContent=en?({hide:'Hide stars',pin:'Keep stars',show:'Show stars'})[action]:({hide:'隐藏星座',pin:'固定星座',show:'显示星座'})[action];
      state.toggle.setAttribute('aria-pressed',String(persistent));
      const name=en?state.constellation.en:state.constellation.zh;
      state.toggle.setAttribute('aria-label',en?({hide:'Hide ',pin:'Keep ',show:'Show '})[action]+name+' constellation':({hide:'隐藏',pin:'固定',show:'显示'})[action]+name+'星座图');
    }
    function stateFor(card){
      if(states.has(card))return states.get(card);
      const c=assignments.get(card);if(!c)return null;
      const layer=document.createElement('div');layer.className='panel-star-interaction';
      const scout=document.createElement('span');scout.className='panel-star-scout';scout.setAttribute('aria-hidden','true');
      scout.id='panelConstellation'+(cards.indexOf(card)+1);
      scout.innerHTML='<svg viewBox="0 0 190 150" focusable="false" aria-hidden="true">'+c.paths.map(path=>'<polyline pathLength="1" points="'+path.map(p=>p.join(',')).join(' ')+'"/>').join('')+c.points.map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===0?2.2:1.35)+'"/>').join('')+'</svg>';
      const label=document.createElement('span');label.className='panel-constellation-name';
      label.textContent=c.zh+' · '+c.en.toUpperCase();scout.append(label);
      const toggle=document.createElement('button');toggle.type='button';toggle.className='panel-star-toggle';
      toggle.setAttribute('aria-controls',scout.id);
      layer.append(scout,toggle);card.append(layer);
      const state={card,scout,toggle,constellation:c,manual:null,seen:false,hovered:false,focused:false};
      states.set(card,state);
      toggle.addEventListener('click',()=>{state.manual=isPersistent(state)?'hidden':'shown';render(state);});
      render(state);return state;
    }
    // Each card keeps its own chart and manual choice. Only its own button hides it.
    cards.forEach(card=>{if(assignments.has(card))stateFor(card);});
    function remember(card){const state=states.get(card);if(!state)return;state.seen=true;render(state);}
    function clearHover(){if(hovered){hovered.hovered=false;render(hovered);hovered=null;}}
    function revealVisibleCards(){
      if(!touchMode())return;
      for(const card of cards){
        if(!states.has(card))continue;
        const rect=card.getBoundingClientRect();
        if(rect.width&&rect.height&&rect.bottom>0&&rect.top<innerHeight)remember(card);
      }
    }
    if('IntersectionObserver' in window){
      const charts=new IntersectionObserver(entries=>{
        if(touchMode())for(const entry of entries)if(entry.isIntersecting)remember(entry.target);
      },{threshold:0});
      cards.forEach(card=>{if(states.has(card))charts.observe(card);});
    }else if(touchMode())cards.forEach(card=>{if(states.has(card))remember(card);});
    revealVisibleCards();
    document.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||touchMode())return;
      const card=event.target.closest?.('.panel-constellation'),state=card&&states.get(card);
      if(state===hovered)return;
      clearHover();
      if(state){hovered=state;state.hovered=true;render(state);}
    },{passive:true});
    document.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='touch')return;
      const card=event.target.closest?.('.panel-constellation');if(card)remember(card);
    },{passive:true});
    document.addEventListener('focusin',event=>{
      const card=event.target.closest?.('.panel-constellation'),state=card&&states.get(card);
      if(state){state.focused=true;render(state);}
    });
    document.addEventListener('focusout',event=>{
      const card=event.target.closest?.('.panel-constellation'),state=card&&states.get(card);
      if(state&&!card.contains(event.relatedTarget)){state.focused=false;render(state);}
    });
    document.addEventListener('pointerout',event=>{if(!event.relatedTarget)clearHover();});
    // Scrolling clears a desktop hover preview, never an already revealed mobile chart.
    addEventListener('scroll',clearHover,{passive:true});
    addEventListener('resize',()=>{clearHover();revealVisibleCards();},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHover();});
    fine.addEventListener('change',()=>{clearHover();revealVisibleCards();});
    smallScreen.addEventListener('change',()=>{clearHover();revealVisibleCards();});
    addEventListener('portfolio-language-change',()=>{cards.forEach(card=>{const state=states.get(card);if(state)render(state);});});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
