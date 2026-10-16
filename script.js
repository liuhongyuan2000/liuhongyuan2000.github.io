(()=>{
  'use strict';
  const body=document.body;
  const $=s=>document.querySelector(s);
  function setLanguage(lang){
    const v=lang==='zh'?'zh':'en';body.dataset.lang=v;document.documentElement.lang=v==='zh'?'zh-CN':'en';
    $('#en-btn').classList.toggle('is-active',v==='en');$('#zh-btn').classList.toggle('is-active',v==='zh');
    $('#en-btn').setAttribute('aria-pressed',v==='en');$('#zh-btn').setAttribute('aria-pressed',v==='zh');
    try{localStorage.setItem('hongyuan-site-language',v)}catch(e){}
  }
  try{setLanguage(localStorage.getItem('hongyuan-site-language')||'en')}catch(e){setLanguage('en')}
  $('#en-btn').addEventListener('click',()=>setLanguage('en'));
  $('#zh-btn').addEventListener('click',()=>setLanguage('zh'));
  const menu=$('#main-nav'),toggle=$('#menu-toggle');
  toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
  document.querySelectorAll('#main-nav a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
  function progress(){const full=document.documentElement.scrollHeight-innerHeight;$('#progress').style.width=(full>0?Math.max(0,Math.min(100,scrollY/full*100)):0)+'%'}
  window.addEventListener('scroll',progress,{passive:true});progress();
  const reveal=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('is-visible');reveal.unobserve(en.target)}}),{threshold:.08,rootMargin:'0px 0px 50px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
  const dialog=$('#lightbox'),dialogImage=$('#lightbox-img'),caption=$('#lightbox-caption');
  document.querySelectorAll('[data-img]').forEach(el=>el.addEventListener('click',()=>{
    const src=el.getAttribute('data-img');
    if(!/^assets\/[a-z0-9_.-]+$/i.test(src))return;
    dialogImage.src=src;dialogImage.alt=el.getAttribute('data-caption')||'Research figure';caption.textContent=el.getAttribute('data-caption')||'';
    if(typeof dialog.showModal==='function')dialog.showModal();
  }));
  $('#lightbox-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close()});
  const videoWatcher=new IntersectionObserver(entries=>entries.forEach(en=>{
    const v=en.target;if(en.isIntersecting&&document.visibilityState==='visible')v.play().catch(()=>{});else v.pause();
  }),{threshold:.35});
  document.querySelectorAll('video').forEach(v=>videoWatcher.observe(v));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause())});
  // A deliberately conceptual, interactive vortex-inspired illustration. It is not experimental data.
  const canvas=$('#flow-canvas'); if(!canvas)return;
  const ctx=canvas.getContext('2d'); if(!ctx)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W=0,H=0,dpr=1,clock=0,particles=[],raf=0,lastFrame=0;
  const count=reduce?220:600;
  function respawn(p,right=false){p.x=right?W*(.01+Math.random()*.14):Math.random()*W;p.y=Math.random()*H;p.age=Math.random()*140;p.seed=Math.random()*Math.PI*2;p.width=Math.random()*.85+.3;return p}
  function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=Math.max(1,r.width);H=Math.max(1,r.height);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:count},()=>respawn({}))}
  let debounce;window.addEventListener('resize',()=>{clearTimeout(debounce);debounce=setTimeout(resize,160)});resize();
  function field(x,y,t){const nx=x/W,ny=y/H;const centerX=.52,centerY=.52;const dx=nx-centerX,dy=ny-centerY;const R2=dx*dx+dy*dy+.008;
    const swirl=.017/(R2+.019);const a=1.9+Math.cos((ny+.1)*6+ t*.03)*.16;
    let vx=a-dy*swirl+.38*Math.sin(7*ny-8*nx+t*.65)*Math.exp(-Math.abs(dx)*1.4);
    let vy=dx*swirl+.28*Math.sin(17*nx-8*ny-t*.8)*Math.exp(-Math.abs(dx)*.7);
    const dist=Math.sqrt(dx*dx+dy*dy);if(dist<.095){vx-=dx/dist*1.9;vy-=dy/dist*1.9}
    return[vx,vy]}
  function frame(ms){if(document.hidden){raf=requestAnimationFrame(frame);return}if(ms-lastFrame<26&&!reduce){raf=requestAnimationFrame(frame);return}lastFrame=ms;
    if(reduce)ctx.clearRect(0,0,W,H);else{ctx.fillStyle='rgba(7,21,28,.115)';ctx.fillRect(0,0,W,H)}
    clock+=.014;
    // Analytic decorative streamlines make the wake legible without implying a CFD result.
    ctx.lineWidth=.8;
    for(let row=0;row<27;row++){
      const base=(row+.7)*H/28;
      ctx.beginPath();let pen=false;
      for(let x=0;x<=W+10;x+=7){
        const dx=x-W*.52;const dy=base-H*.52;
        const constrict=Math.exp(-Math.pow(dx/(W*.20),2))*Math.sign(dy)*Math.min(39,25/(Math.abs(dy)/50+.45));
        const downstream=Math.max(0,dx)/W;
        const wake=dx>0 ? Math.sin(dx*.026-clock*.45+row*.18)*14*Math.exp(-downstream*1.2)*Math.exp(-Math.abs(dy)/170):0;
        const yy=base+constrict+wake;
        const blocked=Math.hypot(x-W*.52,yy-H*.52)<Math.min(W,H)*.105;
        if(blocked){pen=false;continue}
        if(!pen){ctx.moveTo(x,yy);pen=true}else{ctx.lineTo(x,yy)}
      }
      ctx.strokeStyle=row%5===0?'rgba(179,249,179,.28)':'rgba(124,216,209,.13)';
      ctx.stroke();
    }
    for(const p of particles){const x=p.x,y=p.y,dir=field(x,y,clock);p.x+=dir[0]*.84;p.y+=dir[1]*.84;p.age++;
      if(p.x>W+6||p.y< -4||p.y>H+4||p.age>310){respawn(p,true);continue}
      const alpha=Math.min(.85,Math.sin(Math.PI*Math.min(1,p.age/310))*.75);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(p.x,p.y);ctx.strokeStyle=`rgba(${p.seed>3.6?'188,247,171':'96,204,198'},${Math.max(0.10,alpha)})`;ctx.lineWidth=p.width;ctx.stroke();
    }
    const cx=W*.52,cy=H*.52,r=Math.min(W,H)*.096;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#0c2b33';ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#a2e4c880';ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,r+8,0,Math.PI*2);ctx.strokeStyle='#a2e4c819';ctx.stroke();
    if(!reduce)raf=requestAnimationFrame(frame);
  }
  if(reduce){ctx.fillStyle='#07151c';ctx.fillRect(0,0,W,H);for(let i=0;i<20;i++)frame(i*40)}else raf=requestAnimationFrame(frame);
})();
