const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const keyOf=c=>c.w+"|"+c.q;
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>ymd(new Date());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
const daysBetween=(a,b)=>Math.round((new Date(b+"T00:00")-new Date(a+"T00:00"))/864e5);
const fmt=s=>new Date(s+"T00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});

const cfg=Object.assign({zh:true,ac:false,rev:false},store.get("wk2_cfg",{}));
const srs=store.get("wk2_srs",{});
const days=store.get("wk2_days",[]);
const INTERVAL=[0,0,1,3,7,14];
const saveCfg=()=>store.set("wk2_cfg",cfg);
const saveSrs=()=>store.set("wk2_srs",srs);
function touchDay(){const t=today();if(!days.includes(t)){days.push(t);store.set("wk2_days",days.slice(-90))}}
function streak(){let n=0;const d=new Date();if(!days.includes(ymd(d)))d.setDate(d.getDate()-1);while(days.includes(ymd(d))){n++;d.setDate(d.getDate()-1)}return n}

const visible=c=>(cfg.zh||c.kind!=="zh")&&(cfg.ac||(c.kind!=="ac"&&c.g!=="Aircraft"));
const weeksFor=t=>t.t==="Midterm"?[1,2,3,4]:t.t==="Final"?WEEKS:[t.w];
const nextTest=()=>SCHED.find(t=>t.d>=today())||SCHED[SCHED.length-1];
const scopeCards=ws=>C.filter(c=>visible(c)&&ws.includes(c.w));
const box=c=>(srs[keyOf(c)]||{b:0}).b;
const isDue=c=>{const s=srs[keyOf(c)];return !s||s.d<=today()};
const mastered=c=>box(c)>=4;

function rate(c,ok){
  const k=keyOf(c);const prev=srs[k]?srs[k].b:0;
  const b=ok?Math.min(5,Math.max(2,prev+1)):1;
  srs[k]={b,d:addDays(INTERVAL[b])};saveSrs();touchDay();
}

function photos(c){
  const p=(IMG[c.g]||{})[c.q];
  if(!p)return[];
  if(typeof p==="string")return[[p,""]];
  if(Array.isArray(p))return p.map(i=>typeof i==="string"?[i,""]:[i[0],i[1]||""]).filter(i=>i[0]);
  return[p.uurp&&[p.uurp,"Utility Uniform"],p.erb&&[p.erb,"Epaulet"]].filter(Boolean);
}
function shots(c,quiet){
  const l=photos(c);if(!l.length)return"";
  const name=c.a.split("\n")[0];
  return`<div class="shots">${l.map(([src,cap])=>`<figure class="shot"><img class="pic" src="${esc(src)}" alt="${quiet?"":esc(cap||name)}" loading="lazy">${cap&&!quiet?`<figcaption>${esc(cap)}</figcaption>`:""}</figure>`).join("")}</div>`;
}
(function(){
  const k=store.get("wk_known",[]);
  if(k.length&&!Object.keys(srs).length){k.forEach(x=>{srs[x]={b:3,d:addDays(3)}});saveSrs()}
})();

let D=null,RC=null,T=null,tick=null;
function startDrill(cards,smart){
  const tier=c=>box(c)>0&&isDue(c)?0:!box(c)?1:2;
  const part=n=>shuffle(cards.filter(c=>tier(c)===n)).sort((x,y)=>box(x)-box(y));
  const q=smart?[...part(0),...part(1).slice(0,20)]:[...part(0),...part(1),...part(2)];
  RC=null;D={q:q.slice(0,60),src:cards,i:0,on:false,hit:0,miss:0};
  if(location.hash!=="#drill")location.hash="drill";else render();
}

function home(){
  const t=nextTest(),sc=scopeCards(weeksFor(t)),all=C.filter(visible);
  const left=Math.max(0,daysBetween(today(),t.d));
  const due=sc.filter(c=>box(c)>0&&isDue(c)).length;
  const tiles=[...new Set(all.map(c=>c.g))].map(g=>{
    const cs=all.filter(c=>c.g===g);
    const bx=[0,1,2,3,4,5].map(n=>cs.filter(c=>box(c)===n).length);
    return`<button class="tile" data-g="${esc(g)}"><b>${esc(g)}</b><span>Week ${cs[0].w}, ${cs.length} cards, ${bx[4]+bx[5]} mastered</span><i class="seg">${bx.map((n,i)=>`<u class="b${i}" style="flex:${n}"></u>`).join("")}</i></button>`;
  }).join("");
  $("#app").innerHTML=`
  <section class="hero"><div><p class="kick">UP NEXT</p><h2>${esc(t.t)}</h2><p>${left===0?"Today":left+(left===1?" day":" days")} away, ${fmt(t.d)}. ${esc(t.f)}</p></div><button class="btn go" id="goTest">Study this test</button></section>
  <div class="stats"><div class="stat"><b>${all.filter(mastered).length}<small>/${all.length}</small></b><span>Mastered</span></div><div class="stat"><b>${streak()}</b><span>Day streak</span></div><div class="stat"><b>${due}</b><span>Due for review</span></div></div>
  <h2 class="h">Topics</h2><p class="sub">Tap a topic to drill it. The bar shows how far each card has climbed, from new on the left to mastered on the right.</p>
  <div class="tiles">${tiles}</div>`;
  $("#goTest").onclick=()=>startDrill(sc);
  document.querySelectorAll(".tile").forEach(b=>b.onclick=()=>startDrill(all.filter(c=>c.g===b.dataset.g)));
}

function drill(){
  const app=$("#app");
  if(RC){
    const q=RC.qs[RC.i];
    if(!q){
      app.innerHTML=`<div class="done"><b>${RC.hit}/${RC.qs.length}</b><p>Photo drill complete.</p><div class="acts"><button class="btn go" id="again">Back to drill</button></div></div>`;
      $("#again").onclick=()=>{RC=null;render()};return;
    }
    app.innerHTML=`<div class="prog"><i style="width:${RC.i/RC.qs.length*100}%"></i></div><div class="qcard">${qPrompt(q)}</div><div class="opts">${q.opts.map((o,j)=>`<button class="ans" data-j="${j}">${esc(o)}</button>`).join("")}</div><div class="acts" style="margin-top:14px"><button class="btn go" id="nx" hidden>Next</button></div>`;
    document.querySelectorAll(".ans").forEach(b=>b.onclick=()=>{
      if(RC.pick!=null)return;
      const j=+b.dataset.j;RC.pick=j;const ok=q.opts[j]===q.right;rate(q.c,ok);if(ok)RC.hit++;
      document.querySelectorAll(".ans").forEach((x,k)=>{if(q.opts[k]===q.right)x.classList.add("right");else if(k===j)x.classList.add("wrong")});
      $("#nx").hidden=false;$("#nx").focus();
    });
    $("#nx").onclick=()=>{RC.i++;RC.pick=null;render()};
    return;
  }
  if(D){
    const c=D.q[D.i];
    if(!c){
      const m=C.filter(visible).filter(mastered).length;
      app.innerHTML=`<div class="done"><b>${D.hit}/${D.hit+D.miss}</b><p>${D.q.length?"Session complete. You have "+m+" cards mastered overall.":"Nothing to review right now. Come back tomorrow or pick a topic from Home."}</p><div class="acts"><button class="btn go" id="again">Back to drill</button>${D.src&&D.src.length?'<button class="btn" id="prac">Practice these anyway</button><button class="btn" id="rst">Reset these cards</button>':""}<button class="btn" id="toHome">Home</button></div></div>`;
      $("#again").onclick=()=>{D=null;render()};$("#toHome").onclick=()=>{D=null;location.hash="home"};if($("#prac"))$("#prac").onclick=()=>startDrill(D.src);if($("#rst"))$("#rst").onclick=()=>{if(confirm("Reset progress for these "+D.src.length+" cards?")){const src=D.src;src.forEach(c=>delete srs[keyOf(c)]);saveSrs();startDrill(src)}};return;
    }
    const P=`<p class="ft">${esc(c.q)}</p>`;
    const A=`${shots(c)}<p class="ft${c.kind==="zh"?" zh":""}">${esc(c.a)}</p>`;
    const [f,b]=cfg.rev?[A,P]:[P,A];
    app.innerHTML=`<div class="prog"><i style="width:${D.i/D.q.length*100}%"></i></div>
    <div class="flip ${D.on?"on":""}" id="flip"><div class="face front"><div class="tag"><span>Week ${c.w}, ${esc(c.g)}</span><span>${box(c)?"Box "+box(c):"New"}</span></div>${f}</div><div class="face back"><div class="tag"><span>Week ${c.w}, ${esc(c.g)}</span><span>${box(c)?"Box "+box(c):"New"}</span></div>${b}</div></div>
    <div class="acts">${D.on?'<button class="btn miss" id="miss">Missed it</button><button class="btn hit" id="hit">Got it</button>':'<button class="btn go" id="show">Show answer</button>'}</div>
    <div class="row"><button class="tg" id="quit">End session</button></div>`;
    const next=()=>{D.i++;D.on=false;render()};
    $("#flip").onclick=()=>{D.on=!D.on;render()};
    if(D.on){$("#miss").onclick=()=>{rate(c,false);D.miss++;D.q.splice(Math.min(D.q.length,D.i+4),0,c);next()};$("#hit").onclick=()=>{rate(c,true);D.hit++;next()}}
    else $("#show").onclick=()=>{D.on=true;render()};
    $("#quit").onclick=()=>{D=null;render()};
    return;
  }
  const t=nextTest(),sc=scopeCards(weeksFor(t)),all=C.filter(visible);
  const n=a=>a.filter(c=>box(c)>0&&isDue(c)).length;
  app.innerHTML=`<h2 class="h">Drill</h2><p class="sub">Cards you miss come back sooner. Cards you get right come back after a longer gap.</p>
  <div class="opts">
    <button class="opt" data-s="test"><b>${esc(t.t)} set</b><span>${sc.length} cards, ${n(sc)} due</span></button>
    <button class="opt" data-s="due"><b>Due for review</b><span>${n(all)} cards across every topic</span></button>
    <button class="opt" data-s="weak"><b>Weak spots</b><span>${all.filter(c=>box(c)===1).length} cards you keep missing</span></button>
    <button class="opt" data-s="all"><b>Everything</b><span>${all.length} cards, new ones mixed in</span></button>
    <button class="opt" data-s="rec"><b>Photo recognition</b><span>${all.filter(c=>photos(c).length).length} cards with photos</span></button>
  </div>
  <div class="row"><button class="tg" id="rev" aria-pressed="${cfg.rev}">Answer first</button><button class="tg" id="zh" aria-pressed="${cfg.zh}">Chinese phrases</button><button class="tg" id="ac" aria-pressed="${cfg.ac}">Aircraft (FTP only)</button><button class="tg" id="rall">Reset all progress</button></div>`;
  document.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{const s=b.dataset.s;if(s==="rec"){const ph=all.filter(c=>photos(c).length);if(!ph.length)return;D=null;RC={qs:shuffle(ph).slice(0,20).map(c=>buildQ(c,all,true)),i:0,hit:0,pick:null};render();return}startDrill(s==="test"?sc:s==="due"?all.filter(c=>box(c)>0):s==="weak"?all.filter(c=>box(c)===1):all,s==="due")});
  ["rev","zh","ac"].forEach(k=>$("#"+k).onclick=()=>{cfg[k]=!cfg[k];saveCfg();render()});
  $("#rall").onclick=()=>{if(confirm("Reset all card progress?")){Object.keys(srs).forEach(k=>delete srs[k]);saveSrs();render()}};
}

let RS=null;
function recite(){
  const app=$("#app");
  if(!RS){
    app.innerHTML=`<h2 class="h">Recite</h2><p class="sub">Say each line out loud first, then reveal it to check yourself.</p><div class="list">${R.map((r,i)=>`<button class="ritem" data-i="${i}">${esc(r.t)}<span>Week ${r.w}${r.l.length?", "+r.l.filter(x=>x[0]!=="#").length+" lines":", check against the guide"}</span></button>`).join("")}</div>`;
    document.querySelectorAll(".ritem").forEach(b=>b.onclick=()=>{RS={r:R[+b.dataset.i],n:0,hint:false};render()});return;
  }
  const r=RS.r;
  if(!r.l.length){
    app.innerHTML=`<h2 class="h">${esc(r.t)}</h2><p class="note">Say or write it from memory, then open the study guide to Week ${r.w} and compare line by line. Add the lyrics to songs.js to practice it here.</p><button class="btn" id="back">Back to list</button>`;
    $("#back").onclick=()=>{RS=null;render()};return;
  }
  const total=r.l.filter(x=>x[0]!=="#").length;let seen=0;
  const rows=r.l.map(x=>{
    if(x[0]==="#")return`<p class="ln head">${esc(x.slice(1).trim())}</p>`;
    seen++;
    if(seen<=RS.n)return`<p class="ln">${esc(x)}</p>`;
    return`<p class="ln hide">${RS.hint?esc(x.split(/\s+/).map(w=>w[0]).join(" ")):"&nbsp;"}</p>`;
  }).join("");
  app.innerHTML=`<h2 class="h">${esc(r.t)}</h2><p class="sub">${RS.n} of ${total} lines shown</p><div class="lines">${rows}</div>
  <div class="acts"><button class="btn go" id="nx">Show next line</button><button class="btn" id="ht">${RS.hint?"Hide hints":"Letter hints"}</button><button class="btn" id="all">Show all</button><button class="btn" id="rs">Start over</button><button class="btn" id="back">Back</button></div>`;
  $("#nx").onclick=()=>{RS.n=Math.min(total,RS.n+1);render()};
  $("#ht").onclick=()=>{RS.hint=!RS.hint;render()};
  $("#all").onclick=()=>{RS.n=total;render()};
  $("#rs").onclick=()=>{RS.n=0;render()};
  $("#back").onclick=()=>{RS=null;render()};
}

function plan(){
  const t=nextTest(),sc=scopeCards(weeksFor(t));
  const left=Math.max(1,daysBetween(today(),t.d));
  const todo=sc.filter(c=>!mastered(c)).length;
  const rows=SCHED.map(x=>{const dl=daysBetween(today(),x.d);return`<tr class="${x===t?"now":""}"><td>${esc(x.t)}</td><td>${fmt(x.d)}</td><td>${esc(x.f)}</td><td>${dl<0?"Done":dl===0?"Today":dl+" days"}</td></tr>`}).join("");
  $("#app").innerHTML=`<h2 class="h">Plan</h2>
  <p class="note">${todo?`${todo} cards in ${esc(t.t)} are not mastered yet. That is about ${Math.ceil(todo/left)} a day to be ready by ${fmt(t.d)}.`:`Every card in ${esc(t.t)} is mastered. Keep reviewing to hold it.`}</p>
  <div class="tw"><table><thead><tr><th>TEST</th><th>DATE</th><th>COVERS</th><th>IN</th></tr></thead><tbody>${rows}</tbody></table></div>
  <p class="sub" style="margin-top:14px">The guide's schedule, midterm list and final list do not always agree on which week a topic belongs to, so confirm with your flight if a test covers something unexpected.</p>`;
}

function buildQ(c,pool,img){
  const first=x=>x.a.split("\n")[0];
  let same=pool.filter(x=>x!==c&&x.g===c.g);
  if(same.length<3)same=same.concat(shuffle(pool.filter(x=>x!==c&&x.g!==c.g)));
  const right=first(c);const opts=[right];
  for(const x of shuffle(same)){const v=first(x);if(!opts.includes(v))opts.push(v);if(opts.length===4)break}
  return{c,img:!!img&&photos(c).length>0,right,opts:shuffle(opts)};
}
const qPrompt=q=>q.img?shots(q.c,true)+'<p class="ft">Who or what is this?</p>':'<p class="ft">'+esc(q.c.q)+'</p>';
const mmss=ms=>{const t=Math.max(0,Math.round(ms/1000));return Math.floor(t/60)+":"+String(t%60).padStart(2,"0")};
const paint=()=>{const e=$("#timer");if(e&&T&&!T.done)e.textContent=mmss(T.end-Date.now())};

function startTest(cards,n,label){
  const pool=C.filter(visible);
  T={qs:shuffle(cards).slice(0,n).map(c=>buildQ(c,pool,Math.random()<.4)),i:0,ans:[],label,start:Date.now(),limit:n*45000,done:false};
  T.end=T.start+T.limit;
  clearInterval(tick);
  tick=setInterval(()=>{if(T.end-Date.now()<=0)finish();else paint()},500);
  render();
}
function finish(){
  if(!T||T.done)return;
  clearInterval(tick);
  T.used=Math.min(T.limit,Date.now()-T.start);
  T.res=T.qs.map((q,j)=>T.ans[j]!=null&&q.opts[T.ans[j]]===q.right);
  T.res.forEach((ok,j)=>rate(T.qs[j].c,ok));
  const h=store.get("wk2_tests",[]);
  h.unshift({d:today(),l:T.label,s:T.res.filter(Boolean).length,n:T.qs.length});
  store.set("wk2_tests",h.slice(0,8));
  T.done=true;render();
}

function test(){
  const app=$("#app");
  if(!T){
    const sets=[["Next test",scopeCards(weeksFor(nextTest()))],["Midterm set",scopeCards([1,2,3,4])],["Final set",scopeCards(WEEKS)],["Everything",C.filter(visible)]];
    const n=cfg.tn||20;
    const hist=store.get("wk2_tests",[]);
    app.innerHTML=`<h2 class="h">Test</h2><p class="sub">No feedback until you submit, like the real thing. ${n} questions in ${Math.round(n*.75)} minutes.</p>
    <div class="row">${[10,20,30].map(x=>`<button class="tg" data-n="${x}" aria-pressed="${x===n}">${x} questions</button>`).join("")}</div>
    <div class="opts">${sets.map(([l,cs],i)=>`<button class="opt" data-i="${i}"><b>${l}</b><span>${cs.length} cards</span></button>`).join("")}</div>
    ${hist.length?`<h2 class="h" style="margin-top:22px">Recent scores</h2><div class="tw"><table><tbody>${hist.map(h=>`<tr><td>${fmt(h.d)}</td><td>${esc(h.l)}</td><td>${h.s}/${h.n}</td></tr>`).join("")}</tbody></table></div>`:""}`;
    document.querySelectorAll(".tg").forEach(b=>b.onclick=()=>{cfg.tn=+b.dataset.n;saveCfg();render()});
    document.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{const [l,cs]=sets[+b.dataset.i];if(cs.length>=4)startTest(cs,Math.min(n,cs.length),l)});
    return;
  }
  if(T.done){
    const n=T.qs.length,s=T.res.filter(Boolean).length,pct=Math.round(s/n*100);
    const by={};T.qs.forEach((q,j)=>{const g=q.c.g;by[g]=by[g]||[0,0];by[g][1]++;if(T.res[j])by[g][0]++});
    const missed=T.qs.filter((q,j)=>!T.res[j]);
    app.innerHTML=`<div class="done"><b>${s}/${n}</b><p>${pct}%, finished in ${mmss(T.used)}</p></div>
    <h2 class="h" style="margin-top:22px">By topic</h2><div class="tw"><table><tbody>${Object.entries(by).map(([g,v])=>`<tr><td>${esc(g)}</td><td>${v[0]}/${v[1]}</td></tr>`).join("")}</tbody></table></div>
    ${missed.length?`<h2 class="h" style="margin-top:22px">Missed</h2><div class="rows">${missed.map(q=>`<div class="miss-item">${q.img?shots(q.c):`<b>${esc(q.c.q)}</b>`}<p>Correct: ${esc(q.right)}</p></div>`).join("")}</div>`:""}
    <div class="acts" style="margin-top:18px">${missed.length?'<button class="btn go" id="retry">Retry missed</button>':""}<button class="btn" id="newt">New test</button><button class="btn" id="toHome">Home</button></div>`;
    if(missed.length)$("#retry").onclick=()=>startTest(missed.map(q=>q.c),missed.length,"Retry missed");
    $("#newt").onclick=()=>{T=null;render()};
    $("#toHome").onclick=()=>{T=null;location.hash="home"};
    return;
  }
  const q=T.qs[T.i],n=T.qs.length;
  app.innerHTML=`<div class="row"><span class="timer" id="timer"></span><span class="sub" style="margin:0">Question ${T.i+1} of ${n}</span></div>
  <div class="qnav">${T.qs.map((_,j)=>`<button data-j="${j}" class="${T.ans[j]!=null?"filled":""} ${j===T.i?"cur":""}">${j+1}</button>`).join("")}</div>
  <div class="qcard">${qPrompt(q)}</div>
  <div class="opts">${q.opts.map((o,j)=>`<button class="ans ${T.ans[T.i]===j?"sel":""}" data-j="${j}">${esc(o)}</button>`).join("")}</div>
  <div class="acts" style="margin-top:14px"><button class="btn" id="pv" ${T.i?"":"disabled"}>Previous</button><button class="btn" id="nx" ${T.i<n-1?"":"disabled"}>Next</button><button class="btn go" id="sub">Submit test</button></div>`;
  document.querySelectorAll(".ans").forEach(b=>b.onclick=()=>{T.ans[T.i]=+b.dataset.j;render()});
  document.querySelectorAll(".qnav button").forEach(b=>b.onclick=()=>{T.i=+b.dataset.j;render()});
  $("#pv").onclick=()=>{T.i--;render()};
  $("#nx").onclick=()=>{T.i++;render()};
  $("#sub").onclick=()=>{const left=n-T.ans.filter(x=>x!=null).length;if(!left||confirm(left+" unanswered. Submit anyway?"))finish()};
  paint();
}

const views={home,drill,test,recite,plan};
function render(){
  const r=views[location.hash.slice(1)]?location.hash.slice(1):"home";
  document.querySelectorAll("#nav a").forEach(a=>a.getAttribute("data-r")===r?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
  const s=streak();$("#streak").textContent=s?s+" day streak":"No streak yet";
  if(r!=="test")clearInterval(tick);
  views[r]();
}
window.addEventListener("hashchange",()=>{D=D&&location.hash==="#drill"?D:null;RC=RC&&location.hash==="#drill"?RC:null;T=T&&location.hash==="#test"?T:null;RS=null;render()});
document.addEventListener("keydown",e=>{
  if(location.hash!=="#drill"||!D||!D.q[D.i]||e.target.tagName==="BUTTON"&&e.key===" ")return;
  const c=D.q[D.i];
  if(e.key===" "){e.preventDefault();D.on=!D.on;render()}
  else if(D.on&&e.key==="1"){rate(c,false);D.miss++;D.q.splice(Math.min(D.q.length,D.i+4),0,c);D.i++;D.on=false;render()}
  else if(D.on&&e.key==="2"){rate(c,true);D.hit++;D.i++;D.on=false;render()}
});
render();