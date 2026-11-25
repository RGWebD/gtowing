(()=>{
const d=document,root=d.documentElement;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* live open/closed, America/Chicago. Hours as Google listed them (Thanksgiving week 2026).
   Thu/Fri regular hours were hidden behind holiday overrides -> "call to confirm". */
const WEEK={0:null,1:[360,1440],2:[360,1440],3:[360,1020],4:'unk',5:'unk',6:[480,1320]};
const HOLI={'2026-11-26':{h:null,n:'Thanksgiving'},'2026-11-27':{h:[360,1440],n:'Black Friday'}};
function ctNow(t=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(t);const o={};p.forEach(x=>o[x.type]=x.value);
 return{day:DN.indexOf(o.weekday),min:(+o.hour%24)*60+(+o.minute),date:`${o.year}-${o.month}-${o.day}`,hh:o.hour,mm:o.minute}}
const hoursFor=n=>HOLI[n.date]?HOLI[n.date].h:WEEK[n.day];
const fmt=m=>{if(m>=1440)return'12 AM';const h=Math.floor(m/60),mi=m%60,ap=h<12?'AM':'PM',h12=h%12||12;return h12+(mi?':'+String(mi).padStart(2,'0'):'')+' '+ap};
function status(){const n=ctNow(),h=hoursFor(n);let st='closed',t;
 if(h==='unk'){st='unk';t='Call to confirm today’s hours'}
 else if(h&&n.min>=h[0]&&n.min<h[1]){st='open';t='Open now · until '+fmt(h[1])+' CT'}
 else if(h&&n.min<h[0]){t='Closed · opens '+fmt(h[0])+' CT'}
 else{t='Closed now';for(let k=1;k<8;k++){const nx=ctNow(new Date(Date.now()+k*864e5)),hx=hoursFor(nx);if(hx==='unk'){t='Closed now · call to confirm hours';break}if(hx){t='Closed · opens '+(k===1?'tomorrow':DN[nx.day])+' '+fmt(hx[0])+' CT';break}}}
 if(HOLI[n.date])t+=' · '+HOLI[n.date].n;
 $$('[data-status]').forEach(el=>{el.classList.remove('open','closed','unk');el.classList.add(st);const s=$('span',el);if(s)s.textContent=t});
 $$('.hours tr').forEach(tr=>tr.classList.toggle('today',+tr.dataset.d===n.day));
 $$('[data-clock]').forEach(c=>c.textContent=n.hh+':'+n.mm+' CT')}
status();setInterval(status,30000);

/* header, chain/hook progress, mobile bar */
const hdr=$('.hdr'),mbar=$('.mbar');
function onScroll(){const y=scrollY,h=root.scrollHeight-innerHeight,p=h>0?Math.min(1,y/h):0;hdr&&hdr.classList.toggle('scrolled',y>30);root.style.setProperty('--p',p.toFixed(4));if(mbar)mbar.classList.toggle('show',y>260)}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* mobile nav */
const bg=$('.burger'),mn=$('.mnav');
if(bg&&mn){const set=o=>{bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu');mn.classList.toggle('open',o);mn.setAttribute('aria-hidden',!o);mn.inert=!o;d.body.style.overflow=o?'hidden':''};
 mn.inert=true;bg.addEventListener('click',()=>set(bg.getAttribute('aria-expanded')!=='true'));
 $$('a',mn).forEach(a=>a.addEventListener('click',()=>set(false)));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&mn.classList.contains('open')){set(false);bg.focus()}})}

/* split headings */
$$('.split-h').forEach(h=>{if(RM)return;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(d.createTextNode(w));return}const ws=d.createElement('span');ws.style.whiteSpace='nowrap';ws.style.display='inline-block';[...w].forEach(ch=>{const s=d.createElement('span');s.className='ch1';s.textContent=ch;ws.appendChild(s)});f.appendChild(ws)});c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};
 h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());walk(h);$$('span,em',h).forEach(s=>s.setAttribute('aria-hidden','true'));$$('.ch1',h).forEach((c,i)=>c.style.transitionDelay=(i*18)+'ms')});

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
$$('[data-r],.split-h').forEach(el=>{if(RM)el.classList.add('in');else io.observe(el)});
const ph=$('.phero');if(ph)requestAnimationFrame(()=>ph.classList.add('go'));

/* emergency light-bar intro (home only, once per session) */
const hero=$('.hero'),intro=$('.intro');
const goHero=()=>hero&&hero.classList.add('go');
if(intro){let seen=false;try{seen=sessionStorage.getItem('gt-intro')==='1';sessionStorage.setItem('gt-intro','1')}catch(e){}
 if(RM||seen){intro.classList.add('gone');goHero()}else{setTimeout(()=>intro.classList.add('gone'),1500);setTimeout(goHero,1300)}}
else goHero();

/* counters */
function runCount(el){const end=+el.dataset.count,dec=+(el.dataset.dec||0),out=$('b',el)||el;
 if(RM){out.textContent=end.toFixed(dec);return}
 const t0=performance.now(),D=1700;(function f(t){const k=Math.min(1,(t-t0)/D),q=1-Math.pow(1-k,4);out.textContent=(end*q).toFixed(dec);if(k<1)requestAnimationFrame(f);else out.textContent=end.toFixed(dec)})(t0)}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target)}}),{threshold:.3});
$$('[data-count]').forEach(el=>cio.observe(el));

/* gauge */
$$('[data-gauge]').forEach(g=>{const v=+g.dataset.gauge,k=v/5;const go=()=>{g.style.setProperty('--off',(100-k*100).toFixed(1));g.style.setProperty('--deg',(-90+k*180).toFixed(1)+'deg')};
 if(RM){go();return}const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){go();o.disconnect()}},{threshold:.4});o.observe(g)});

/* tilt cards */
if(FINE&&!RM)$$('.tcard,.tilt').forEach(c=>{c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.setProperty('--ry',(x*12).toFixed(2)+'deg');c.style.setProperty('--rx',(-y*12).toFixed(2)+'deg')});c.addEventListener('pointerleave',()=>{c.style.setProperty('--ry','0deg');c.style.setProperty('--rx','0deg')})});

/* magnetic buttons */
if(FINE&&!RM)$$('.btn.mag').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform=`translate(${(x*.22).toFixed(1)}px,${(y*.32).toFixed(1)}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});

/* road timeline: lane paints + truck drives as you scroll; stops stay lit */
$$('.road').forEach(rd=>{const as=$('.asphalt',rd),stops=$$('.stop',rd);
 function upd(){const r=rd.getBoundingClientRect();const k=RM?1:Math.min(1,Math.max(0,(innerHeight*.6-r.top)/r.height));as.style.setProperty('--k',k.toFixed(3));
  stops.forEach(s=>{const sr=s.getBoundingClientRect();if(RM||sr.top+sr.height*.3<innerHeight*.72)s.classList.add('lit')})}
 addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});addEventListener('resize',upd);upd()});

/* reviews carousel */
$$('.car').forEach(c=>{const tr=$('.car-track',c),sl=$$('.slide',c),dots=$('.dots',c);let i=0,tm;
 sl.forEach((s,k)=>{const b=d.createElement('button');b.type='button';b.setAttribute('aria-label','Show review '+(k+1));b.onclick=()=>go(k,1);dots.appendChild(b)});
 function go(k,user){i=(k+sl.length)%sl.length;tr.style.transform=`translateX(${-100*i}%)`;$$('button',dots).forEach((b,j)=>b.setAttribute('aria-current',j===i));sl.forEach((s,j)=>{s.setAttribute('aria-hidden',j!==i);s.inert=j!==i});if(user)auto()}
 function auto(){clearInterval(tm);if(!RM)tm=setInterval(()=>go(i+1),7000)}
 $('.car-p',c).onclick=()=>go(i-1,1);$('.car-n',c).onclick=()=>go(i+1,1);
 c.addEventListener('mouseenter',()=>clearInterval(tm));c.addEventListener('mouseleave',auto);c.addEventListener('focusin',()=>clearInterval(tm));c.addEventListener('focusout',auto);
 let sx=null;tr.addEventListener('pointerdown',e=>sx=e.clientX);addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)go(i+(dx<0?1:-1),1)});
 go(0);auto()});

/* filter chips */
const chipsF=$$('.chip-f');
chipsF.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f;chipsF.forEach(x=>x.setAttribute('aria-pressed',x===b));$$('.mason .gal-item').forEach(it=>it.classList.toggle('hide',f!=='all'&&it.dataset.cat!==f))}));

/* lightbox */
const lb=$('.lbx');
if(lb){const im=$('img',lb),cap=$('figcaption',lb),cnt=$('.lbx-c',lb),btns=$$('button',lb);let list=[],k=0,last=null;
 const vis=it=>[...it.parentElement.children].filter(i=>i.classList.contains('gal-item')&&!i.classList.contains('hide'));
 function show(n){k=(n+list.length)%list.length;const it=list[k],ti=$('img',it);im.src=it.dataset.full;im.alt=ti.alt;cap.textContent=ti.alt;cnt.textContent=(k+1)+' / '+list.length}
 $$('.gal-item').forEach(it=>it.addEventListener('click',()=>{list=vis(it);last=it;show(list.indexOf(it));lb.classList.add('open');lb.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';$('.lbx-x',lb).focus()}));
 const close=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');d.body.style.overflow='';last&&last.focus()};
 $('.lbx-x',lb).onclick=close;$('.lbx-p',lb).onclick=()=>show(k-1);$('.lbx-n',lb).onclick=()=>show(k+1);
 lb.addEventListener('click',e=>{if(e.target===lb)close()});
 let tx=null;lb.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});lb.addEventListener('touchend',e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50)show(k+(dx<0?1:-1))});
 addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(k-1);if(e.key==='ArrowRight')show(k+1);
  if(e.key==='Tab'){const i=btns.indexOf(d.activeElement);e.preventDefault();btns[(i+(e.shiftKey?-1:1)+btns.length)%btns.length].focus()}})}

/* tow notes planner (nothing is sent from the page) */
const pf=$('.planner');
if(pf){const out=$('.out',pf),pre=$('pre',out),cp=$('.copy',pf),sms=$('.smsb',pf);
 pf.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(pf);const L=[];
  const add=(k,l)=>{const v=(fd.get(k)||'').trim();if(v)L.push(l+': '+v)};
  add('where','Location');add('veh','Vehicle');add('what','Problem');add('to','Take it to');add('notes','Notes');
  if(!L.length)L.push('I need a tow.');pre.textContent=L.join('\n');out.hidden=false;
  const body=encodeURIComponent('Tow request\n'+L.join('\n'));const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);sms.href='sms:+14697569818'+(ios?'&':'?')+'body='+body});
 cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.textContent);$('.lbl',cp).textContent='Copied'}catch(e){$('.lbl',cp).textContent='Select & copy'}})}

/* demo pill */
const dm=$('.demo');if(dm){try{if(sessionStorage.getItem('gt-demo')==='x')dm.remove()}catch(e){};const x=$('button',dm);x&&x.addEventListener('click',()=>{dm.remove();try{sessionStorage.setItem('gt-demo','x')}catch(e){}})}
})();
