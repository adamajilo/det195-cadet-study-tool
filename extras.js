const SPK='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const AUDIO_BASE={"Chinese":"audio/zh/","Phonetic Alphabet":"audio/nato/"};
const slugOf=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
function audioFor(c){
  const b=AUDIO_BASE[c.g];
  if(!b)return null;
  const s=slugOf(c.g==="Chinese"?c.q:c.a.split("\n")[0]);
  return s?b+s+".mp3":null;
}
const audioSeen={};
const audioExists=p=>{
  if(!(p in audioSeen))audioSeen[p]=fetch(p,{method:"HEAD"}).then(r=>r.ok).catch(()=>false);
  return audioSeen[p];
};
const AUD=new Audio();

const hash32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function dailyCards(date){
  const tm=termOf(nextTest());
  const bag=C.filter(c=>c.kind!=="job"&&c.kind!=="ac"&&c.kind!=="zh"&&termOf(c)===tm).sort((a,b)=>keyOf(a)<keyOf(b)?-1:1);
  const r=rng(hash32(date)),out=[];
  while(out.length<10&&bag.length)out.push(bag.splice(Math.floor(r()*bag.length),1)[0]);
  return out;
}
const dKey=()=>"wk2_daily_"+((store.getAccount&&store.getAccount())||"guest");
const dailyGet=()=>{try{return JSON.parse(localStorage.getItem(dKey())||"{}")}catch(e){return{}}};
function dailyStreak(){
  const g=dailyGet();let n=0;const d=new Date();
  if(!g[ymd(d)])d.setDate(d.getDate()-1);
  while(g[ymd(d)]){n++;d.setDate(d.getDate()-1)}
  return n;
}
function dailyRecord(t){
  const d=today(),g=dailyGet();
  if(g[d])return;
  g[d]={s:t.res.filter(Boolean).length,n:t.qs.length,r:t.res.map(x=>x?1:0)};
  localStorage.setItem(dKey(),JSON.stringify(g));
}
const finishBase=finish;
finish=function(){
  const t=T,was=t&&t.done;
  finishBase();
  if(t&&!was&&t.done&&t.label==="Daily challenge")dailyRecord(t);
};

function closeModal(){const m=document.getElementById("xt-modal");if(m)m.remove()}
function openReport(c){
  closeModal();
  const m=document.createElement("div");
  m.className="modal";m.id="xt-modal";
  m.innerHTML=`<div class="modal-card" role="dialog" aria-label="Report a mistake"><h3>Report a mistake</h3><p class="sub" style="margin:0 0 10px">${esc(c.q)}</p><div class="chips" id="xt-types">${["Wrong answer","Typo","Wrong photo","Other"].map((t,i)=>`<button class="tg" data-t="${t}" aria-pressed="${i===0}">${t}</button>`).join("")}</div><textarea class="ti" id="xt-note" maxlength="300" rows="3" placeholder="What looks wrong? (optional)"></textarea><div class="acts" style="margin-top:12px"><button class="btn go" id="xt-send">Send</button><button class="btn" id="xt-cancel">Cancel</button></div></div>`;
  document.body.appendChild(m);
  let type="Wrong answer";
  m.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{type=b.dataset.t;m.querySelectorAll("[data-t]").forEach(x=>x.setAttribute("aria-pressed",x===b))});
  $("#xt-cancel").onclick=closeModal;
  m.addEventListener("click",e=>{if(e.target===m)closeModal()});
  $("#xt-send").onclick=async()=>{
    if(!window.rpSubmit){toast("Reporting is not available yet");return}
    $("#xt-send").disabled=true;
    try{
      const r=await window.rpSubmit({key:keyOf(c),g:c.g,q:c.q.slice(0,200),a:c.a.split("\n")[0].slice(0,200),type,note:$("#xt-note").value.trim()});
      toast(r==="ok"?"Thanks, report sent":"You already reported this card");
      closeModal();
    }catch(e){console.error(e);toast("Could not send the report");$("#xt-send").disabled=false}
  };
}

function decorateDrill(){
  if(!D||!D.q[D.i]||!document.querySelector(".flip"))return;
  const c=D.q[D.i];
  const q=document.getElementById("quit");
  if(q&&!document.getElementById("xt-report")){
    const b=document.createElement("button");
    b.className="tg";b.id="xt-report";b.type="button";b.textContent="Report a mistake";
    b.onclick=()=>openReport(c);
    q.parentElement.appendChild(b);
  }
  const p=audioFor(c);
  if(p&&!document.getElementById("xt-speak"))audioExists(p).then(ok=>{
    if(!ok||!D||D.q[D.i]!==c||document.getElementById("xt-speak"))return;
    const face=document.querySelector(cfg.rev?".face.front":".face.back");
    if(!face)return;
    const b=document.createElement("button");
    b.className="speak";b.id="xt-speak";b.type="button";b.setAttribute("aria-label","Listen");b.innerHTML=SPK;
    b.onclick=e=>{e.stopPropagation();AUD.src=p;AUD.currentTime=0;AUD.play().catch(()=>toast("Could not play the audio"))};
    face.appendChild(b);
  });
}

function decorateHome(){
  const hero=document.querySelector(".hero");
  if(!hero||document.getElementById("xt-daily"))return;
  const res=dailyGet()[today()];
  hero.insertAdjacentHTML("afterend",`<section class="daily" id="xt-daily"><div><p class="kick">DAILY CHALLENGE</p><b>${res?res.s+"/"+res.n+" today":"10 questions, the same for everyone"}</b><small>${dailyStreak()} day daily streak</small></div><button class="btn ${res?"":"go"}" id="xt-daily-go">${res?"Practice again":"Start"}</button></section>`);
  $("#xt-daily-go").onclick=()=>{
    const cards=dailyCards(today());
    if(cards.length<4){toast("Not enough cards yet");return}
    startTest(cards,cards.length,dailyGet()[today()]?"Daily practice":"Daily challenge");
    if(location.hash!=="#test")location.hash="test";
  };
}

function decorateTest(){
  if(!T||!T.done||T.label!=="Daily challenge"||document.getElementById("xt-share"))return;
  const done=document.querySelector(".done");
  if(!done)return;
  const g=dailyGet()[today()];
  if(!g)return;
  const text="Det 195 Briefing Room daily "+fmt(today())+" "+g.s+"/"+g.n+"\n"+g.r.map(x=>x?"🟩":"🟥").join("");
  done.insertAdjacentHTML("beforeend",'<div class="acts" style="margin-top:14px"><button class="btn go" id="xt-share">Copy share text</button></div>');
  $("#xt-share").onclick=()=>{
    if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast("Copied"),()=>toast("Could not copy"));
    else toast("Could not copy");
  };
}

async function adminView(){
  const app=$("#app");
  app.innerHTML='<h2 class="h">Mistake reports</h2><p class="note">Loading...</p>';
  const ok=window.rpIsHost?await window.rpIsHost():false;
  if(location.hash!=="#admin")return;
  if(!ok){app.innerHTML='<h2 class="h">Mistake reports</h2><p class="note">This page is for approved hosts. Sign in with a host account.</p>';return}
  let list=[];
  try{list=await window.rpList()}catch(e){console.error(e);app.innerHTML='<h2 class="h">Mistake reports</h2><p class="note">Could not load the reports.</p>';return}
  const by={};
  list.forEach(r=>{const x=by[r.key]=by[r.key]||{key:r.key,g:r.g,q:r.q,a:r.a,items:[]};x.items.push(r)});
  const groups=Object.values(by).sort((a,b)=>b.items.length-a.items.length);
  if(!groups.length){app.innerHTML='<h2 class="h">Mistake reports</h2><p class="note">No open reports.</p>';return}
  app.innerHTML=`<h2 class="h">Mistake reports</h2><p class="sub">${groups.length} card${groups.length===1?"":"s"} reported, most reports first.</p>
  ${groups.map((g,i)=>`<div class="week-card"><b>${esc(g.q)}</b><span class="badge">${g.items.length} report${g.items.length===1?"":"s"}</span>
  <p class="sub" style="margin:6px 0">${esc(g.g)}. Current answer: ${esc(g.a)}</p>
  <ul class="podium">${g.items.map(r=>`<li><span>${esc(r.type||"Other")}</span><span class="xp" style="font-weight:500">${esc(r.note||"")}</span></li>`).join("")}</ul>
  <div class="acts" style="justify-content:flex-start;margin-top:8px"><button class="btn" data-fix="${i}">Mark fixed</button></div></div>`).join("")}`;
  document.querySelectorAll("[data-fix]").forEach(b=>b.onclick=async()=>{
    const g=groups[+b.dataset.fix];
    if(!confirm("Remove all reports for this card?"))return;
    try{await window.rpResolve(g.key);toast("Cleared");adminView()}catch(e){console.error(e);toast("Could not clear")}
  });
}
views.admin=adminView;

function zhByAnswer(){
  const m=new Map();
  C.forEach(c=>{if(c.kind==="zh")m.set(c.a.split("\n")[0],c)});
  return m;
}
function decorateTestQuestion(){
  if(!T||T.done||T.typed)return;
  const q=T.qs[T.i];
  if(!q)return;
  const map=zhByAnswer();
  document.querySelectorAll(".opts .ans").forEach(btn=>{
    if(btn.querySelector(".spk"))return;
    const card=map.get(q.opts[+btn.dataset.j]);
    if(!card)return;
    const p=audioFor(card);
    if(!p)return;
    audioExists(p).then(ok=>{
      if(!ok||!T||T.done||T.qs[T.i]!==q||!btn.isConnected||btn.querySelector(".spk"))return;
      const s=document.createElement("span");
      s.className="spk";s.setAttribute("role","button");s.tabIndex=0;
      s.setAttribute("aria-label","Listen");s.title=p;s.innerHTML=SPK;
      const play=e=>{e.stopPropagation();e.preventDefault();AUD.src=p;AUD.currentTime=0;AUD.play().catch(()=>toast("Could not play the audio"))};
      s.onclick=play;
      s.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")play(e)};
      btn.appendChild(s);
    });
  });
}

function decorate(){
  const r=location.hash.slice(1)||"home";
  if(r==="home")decorateHome();
  else if(r==="drill")decorateDrill();
  else if(r==="test"){decorateTest();decorateTestQuestion()}
}
(function(){
  const app=$("#app");
  if(!app)return;
  let busy=false;
  const obs=new MutationObserver(()=>{
    if(busy)return;
    busy=true;
    queueMicrotask(()=>{obs.disconnect();try{decorate()}finally{obs.observe(app,{childList:true});busy=false}});
  });
  obs.observe(app,{childList:true});
  decorate();
})();
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
(function(){
  const link=document.getElementById("adminLink");
  if(!link)return;
  const check=()=>{if(window.rpIsHost)window.rpIsHost().then(ok=>{link.hidden=!ok})};
  window.addEventListener("auth-state-changed",check);
  setTimeout(check,2500);
})();