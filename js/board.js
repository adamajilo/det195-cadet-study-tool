const LB_FIRST="2026-11-08";
const weekIdOfDate=s=>{const d=new Date(s+"T00:00");d.setDate(d.getDate()-d.getDay());return ymd(d)};
const plusDays=(s,n)=>{const d=new Date(s+"T00:00");d.setDate(d.getDate()+n);return ymd(d)};
const rankEntries=a=>a.slice().sort((x,y)=>(y.xp||0)-(x.xp||0)||(x.xpAt||0)-(y.xpAt||0));
const leadAt=(es,date)=>{
  let best=null;
  es.forEach(e=>{
    const ds=Object.keys(e.daily||{}).filter(d=>d<=date).sort();
    const v=ds.length?e.daily[ds[ds.length-1]]:0;
    if(v>0&&(!best||v>best.v||(v===best.v&&(e.xpAt||0)<best.at)))best={uid:e.uid,v,at:e.xpAt||0};
  });
  return best;
};
const closeWeek=(week,es)=>{
  const top=rankEntries(es).filter(e=>e.xp>0).slice(0,3);
  const f=leadAt(es,plusDays(week,5));
  return{
    weekId:week,
    closedAt:Date.now(),
    entrants:es.length,
    top:top.map(e=>({uid:e.uid,name:e.name||"Cadet",photo:e.photo||"",xp:e.xp})),
    comeback:!!(top.length&&f&&f.uid!==top[0].uid)
  };
};
const MEDALS=["gold","silver","bronze"];
const trophyCounts=(hist,uid)=>{
  const c={gold:0,silver:0,bronze:0,comebacks:0};
  (hist||[]).forEach(w=>{
    w.top.forEach((t,i)=>{if(t.uid===uid)c[MEDALS[i]]++});
    if(w.comeback&&w.top[0]&&w.top[0].uid===uid)c.comebacks++;
  });
  return c;
};
const CUP={gold:"#e2b53c",silver:"#c3cbd6",bronze:"#c77f45"};
const trophy=(k,s=22)=>`<svg class="trophy" width="${s}" height="${s}" viewBox="0 0 24 24" role="img" aria-label="${k} trophy"><path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="${CUP[k]}"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" fill="none" stroke="${CUP[k]}" stroke-width="1.6"/><rect x="10.8" y="13" width="2.4" height="4" fill="${CUP[k]}"/><rect x="8" y="17" width="8" height="3" rx="1" fill="${CUP[k]}"/></svg>`;

const flagKey=()=>"wk2_flags_"+((store.getAccount&&store.getAccount())||"guest");
const flags=()=>{
  try{return Object.assign({listed:false,gold:false},JSON.parse(localStorage.getItem(flagKey())||"{}"))}
  catch(e){return{listed:false,gold:false}}
};
const setFlags=f=>{
  localStorage.setItem(flagKey(),JSON.stringify(f));
  if(window.lbSaveFlags)window.lbSaveFlags(f);
};
window.lbGetFlags=flags;
window.lbSetFlagsLocal=f=>{localStorage.setItem(flagKey(),JSON.stringify(f));applyTheme()};
window.isListed=()=>!!flags().listed;

function applyTheme(){
  const r=document.documentElement;
  const t=cfg.night?"night":(cfg.gold&&flags().gold?"gold":"");
  if(t)r.dataset.theme=t;else delete r.dataset.theme;
}
setNight=function(on){cfg.night=on;saveCfg();applyTheme()};
applyTheme();

function checkGold(){
  const f=flags();
  if(f.gold)return;
  const pool=C.filter(c=>c.kind!=="job"&&c.kind!=="ac");
  if(pool.length&&pool.every(mastered)){
    f.gold=true;setFlags(f);
    cfg.gold=true;saveCfg();applyTheme();
    toast("Gold theme unlocked");
  }
}
const rateBase=rate;
rate=function(c,ok){rateBase(c,ok);checkGold()};

let HIST=null,HIST_AT=0;
async function lbHistory(force){
  if(!window.lbFetchHistory)return[];
  if(!force&&HIST&&Date.now()-HIST_AT<60000)return HIST;
  try{HIST=await window.lbFetchHistory();HIST_AT=Date.now()}
  catch(e){console.error("History failed",e);HIST=HIST||[]}
  return HIST;
}

let LBV="week";
const timeLeft=()=>{
  const now=new Date(),nx=new Date(now);
  nx.setDate(now.getDate()+((7-now.getDay())||7));
  nx.setHours(0,0,0,0);
  const d=Math.max(0,nx-now);
  return`${Math.floor(d/864e5)}d ${Math.floor(d%864e5/36e5)}h ${Math.floor(d%36e5/6e4)}m ${Math.floor(d%6e4/1e3)}s`;
};

views.leaderboard=async function(){
  const app=$("#app");
  if(window.lbInterval){clearInterval(window.lbInterval);window.lbInterval=null}
  const user=window.getUser?window.getUser():null;
  const tabs=`<div class="srow"><button class="tg" data-v="week" aria-pressed="${LBV==="week"}">This week</button><button class="tg" data-v="past" aria-pressed="${LBV==="past"}">Past weeks</button></div>`;
  const note=user&&!flags().listed?'<p class="note">You are not on the leaderboard. Turn it on in Account to appear here and compete for the podium.</p>':"";
  const head=`<h2 class="h">Leaderboard</h2>${tabs}${note}`;
  const bind=()=>document.querySelectorAll("#app [data-v]").forEach(b=>b.onclick=()=>{LBV=b.dataset.v;views.leaderboard()});

  if(LBV==="past"){
    app.innerHTML=head+'<p class="note">Loading past weeks...</p>';bind();
    const h=await lbHistory(true);
    if(location.hash!=="#leaderboard")return;
    if(!h.length){app.innerHTML=head+'<p class="note">No finished weeks yet. The first podium appears after this week ends.</p>';bind();return}
    const wins={};
    h.forEach(w=>{const t=w.top[0];if(t){wins[t.uid]=wins[t.uid]||{name:t.name,n:0};wins[t.uid].n++}});
    const best=Object.values(wins).sort((a,b)=>b.n-a.n)[0];
    const cards=h.map(w=>`<div class="week-card"><b>Week of ${fmt(w.weekId)}</b>${w.comeback?'<span class="badge">Last-day comeback</span>':""}<ul class="podium">${w.top.map((t,i)=>`<li>${trophy(MEDALS[i],22)}<span>${esc(t.name)}</span><span class="xp">${t.xp} XP</span></li>`).join("")}</ul></div>`).join("");
    app.innerHTML=head+(best?`<p class="sub">Most weeks won: <b>${esc(best.name)}</b> (${best.n})</p>`:"")+cards;
    bind();
    return;
  }

  const timer=`<div id="lb-timer" class="note lb-timer">Reset in: ${timeLeft()}</div>`;
  app.innerHTML=head+timer+'<div id="lb-loading" class="note">Loading weekly rankings...</div>';
  bind();
  window.lbInterval=setInterval(()=>{const e=document.getElementById("lb-timer");if(e)e.textContent="Reset in: "+timeLeft()},1000);
  if(typeof window.fetchWeeklyLeaderboard!=="function"){$("#lb-loading").textContent="Leaderboard connection is not ready. Please refresh the page.";return}
  let data;
  try{data=await window.fetchWeeklyLeaderboard()}
  catch(err){console.error("Leaderboard loading failed:",err);const l=$("#lb-loading");if(l)l.textContent="Unable to load rankings. Please try again later.";return}
  if(location.hash!=="#leaderboard")return;
  if(!data.length){$("#lb-loading").textContent="No one is on the board this week yet. Turn on the leaderboard in Account and complete a review to join.";return}
  const rows=data.map((item,i)=>`<tr><td>${i<3?trophy(MEDALS[i],22):"<b>#"+(i+1)+"</b>"}</td><td><button class="lb-profile-btn" data-profile="${esc(item.id)}">${item.photo?`<img src="${esc(item.photo)}" class="lb-avatar" alt="">`:""}<span>${esc(item.name)}</span></button></td><td><b>${item.xpWeekly}</b> XP</td><td><b>${item.mastered}</b> cards</td><td><b>${item.streak}</b> days</td></tr>`).join("");
  app.innerHTML=head+timer+`<div class="tw"><table id="lb-table"><thead><tr><th>RANK</th><th>CADET</th><th>WEEKLY XP</th><th>MASTERED</th><th>STREAK</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  bind();
  document.querySelectorAll("[data-profile]").forEach(b=>b.onclick=()=>window.viewCadetProfile(b.dataset.profile));
};

window.viewCadetProfile=async userId=>{
  if(typeof window.fetchUserProfile!=="function")return;
  const app=$("#app");
  app.innerHTML='<p class="note">Loading cadet profile...</p>';
  let p;
  try{p=await window.fetchUserProfile(userId)}
  catch(err){console.error("Profile loading failed:",err);toast("Could not load cadet profile");return}
  if(!p){toast("Cadet profile not found");return}
  const h=await lbHistory(false);
  const t=trophyCounts(h,userId);
  app.innerHTML=`<h2 class="h">Cadet Profile</h2><p class="sub">Public cadet profile and study standing.</p>
  <div class="qcard cadet-profile">
    ${p.photoURL?`<img src="${esc(p.photoURL)}" class="profile-photo" alt="">`:""}
    <h3>${esc(p.displayName||"Cadet")}</h3>
    <div class="profile-stats">
      <div class="stat"><b>${Number(p.streak)||0}</b><span>Day Streak</span></div>
      <div class="stat"><b>${Number(p.mastered)||0}</b><span>Total Mastered</span></div>
      <div class="stat"><b>${Number(p.weekly&&p.weekly.xp)||0}</b><span>Weekly XP</span></div>
      <div class="stat"><b>${Number(p.totalXp)||0}</b><span>Lifetime XP</span></div>
    </div>
    <div class="trophy-row">${MEDALS.map(k=>`<div>${trophy(k,28)}<span>${t[k]}</span></div>`).join("")}</div>
    <div class="acts"><button class="btn go" id="back-leaderboard">Back to Leaderboard</button></div>
  </div>`;
  $("#back-leaderboard").onclick=()=>views.leaderboard();
};

const accountBase=views.account||(()=>{});
views.account=function(){
  accountBase();
  const g=document.querySelector(".account-grid");
  const u=window.getUser?window.getUser():null;
  if(!g||!u)return;
  const f=flags();
  const pool=C.filter(c=>c.kind!=="job"&&c.kind!=="ac");
  const done=pool.filter(mastered).length;
  g.insertAdjacentHTML("beforeend",`
    <div class="qcard" style="margin:0;text-align:left;align-items:stretch;">
      <h3 style="margin-top:0;font:700 1.2rem var(--d);">Leaderboard</h3>
      <p class="sub" style="margin:0 0 12px">${f.listed?"You are on the weekly leaderboard with your display name.":"You are hidden. Turn this on to appear on the weekly leaderboard and in the history."}</p>
      <div class="acts" style="justify-content:flex-start;"><button class="btn ${f.listed?"":"go"}" id="lb-opt">${f.listed?"Leave leaderboard":"Join leaderboard"}</button></div>
    </div>
    <div class="qcard" style="margin:0;text-align:left;align-items:stretch;">
      <h3 style="margin-top:0;font:700 1.2rem var(--d);">Trophies</h3>
      <div class="trophy-row" id="acc-trophies"><span class="sub" style="margin:0">Loading...</span></div>
    </div>
    <div class="qcard" style="margin:0;text-align:left;align-items:stretch;">
      <h3 style="margin-top:0;font:700 1.2rem var(--d);">Gold theme</h3>
      ${f.gold
        ?`<p class="sub" style="margin:0 0 12px">Unlocked for mastering every card.</p><div class="acts" style="justify-content:flex-start;"><button class="btn ${cfg.gold?"":"go"}" id="gold-toggle">${cfg.gold?"Turn off gold theme":"Use gold theme"}</button></div>`
        :`<p class="sub" style="margin:0">Master every card to unlock it. ${done} of ${pool.length} mastered.</p>`}
    </div>`);
  $("#lb-opt").onclick=async()=>{
    const fl=flags();fl.listed=!fl.listed;setFlags(fl);
    if(fl.listed){if(window.queueSync)window.queueSync();if(window.lbWriteEntry)window.lbWriteEntry()}
    else if(window.lbDeleteMine)await window.lbDeleteMine();
    toast(fl.listed?"You are on the leaderboard":"Removed from the leaderboard");
    views.account();
  };
  const gt=document.getElementById("gold-toggle");
  if(gt)gt.onclick=()=>{cfg.gold=!cfg.gold;saveCfg();applyTheme();views.account()};
  lbHistory(false).then(h=>{
    const el=document.getElementById("acc-trophies");
    if(!el)return;
    const t=trophyCounts(h,u.uid);
    el.innerHTML=MEDALS.map(k=>`<div>${trophy(k,30)}<span>${t[k]}</span></div>`).join("")+(t.comebacks?`<span class="badge">${t.comebacks} comeback${t.comebacks>1?"s":""}</span>`:"");
  });
};

//flights
const FL_MIN=3;
const flKey=()=>"wk2_flight_"+((store.getAccount&&store.getAccount())||"guest");
window.flGetSaved=()=>{
  try{const v=JSON.parse(localStorage.getItem(flKey())||"null");return v&&typeof v==="object"?v:null}
  catch(e){return null}
};
window.flSetSaved=(flight,term,quiet)=>{
  try{localStorage.setItem(flKey(),JSON.stringify({flight:flight||"",term:String(term||"")}))}catch(e){}
  if(!quiet&&window.queueSync)window.queueSync();
};
window.flightFields=()=>{
  const s=window.flGetSaved();
  return s?{flight:String(s.flight||"").slice(0,20),flightTerm:String(s.term||"").slice(0,20)}:{};
};

const flAccBase=views.account;
views.account=function(){
  flAccBase();
  const g=document.querySelector(".account-grid");
  const u=window.getUser?window.getUser():null;
  if(!g||!u||document.getElementById("fl-card"))return;
  g.insertAdjacentHTML("beforeend",'<div class="qcard" id="fl-card" style="margin:0;text-align:left;align-items:stretch;"><h3 style="margin-top:0;font:700 1.2rem var(--d);">Flight</h3><div id="fl-body"><p class="sub" style="margin:0">Loading...</p></div></div>');
  const draw=cf=>{
    const body=document.getElementById("fl-body");
    if(!body)return;
    if(!cf){body.innerHTML='<p class="sub" style="margin:0">Flights have not been set up yet.</p>';return}
    const s=window.flGetSaved();
    const mine=s&&s.term===cf.term&&cf.names.includes(s.flight)?s.flight:"";
    const listed=window.isListed&&window.isListed();
    body.innerHTML=`<p class="sub" style="margin:0 0 10px">${mine?"Your flight for "+esc(cf.term)+": <b>"+esc(mine)+"</b>.":"Pick your flight for "+esc(cf.term)+"."}${listed?"":" Your flight counts once you join the leaderboard."}</p><div class="row">${cf.names.map(n=>`<button class="tg" data-fl="${esc(n)}" aria-pressed="${n===mine}">${esc(n)}</button>`).join("")}${mine?'<button class="tg" id="fl-clear">Clear</button>':""}</div>`;
    body.querySelectorAll("[data-fl]").forEach(b=>b.onclick=()=>{window.flSetSaved(b.dataset.fl,cf.term);toast("Flight saved");draw(cf)});
    const c=document.getElementById("fl-clear");
    if(c)c.onclick=()=>{window.flSetSaved("","");toast("Flight cleared");draw(cf)};
  };
  const load=n=>{
    if(window.flGetConfig){window.flGetConfig().then(draw);return}
    if(n>0)setTimeout(()=>load(n-1),1000);else draw(null);
  };
  load(5);
};

async function flightsView(){
  const app=$("#app");
  if(window.lbInterval){clearInterval(window.lbInterval);window.lbInterval=null}
  const head='<h2 class="h">Leaderboard</h2><div class="srow"><button class="tg" data-flv="week" aria-pressed="false">This week</button><button class="tg" data-flv="past" aria-pressed="false">Past weeks</button><button class="tg" aria-pressed="true">Flights</button></div>';
  const bind=()=>document.querySelectorAll("#app [data-flv]").forEach(b=>b.onclick=()=>{LBV=b.dataset.flv;views.leaderboard()});
  app.innerHTML=head+'<p class="note">Loading flight standings...</p>';
  bind();
  const cf=window.flGetConfig?await window.flGetConfig():null;
  if(location.hash!=="#leaderboard")return;
  if(!cf){app.innerHTML=head+'<p class="note">Flights have not been set up yet.</p>';bind();return}
  let list;
  try{list=await window.flFetchProfiles(cf.term)}
  catch(e){console.error("Flight standings failed:",e);app.innerHTML=head+'<p class="note">Unable to load flight standings. Please try again later.</p>';bind();return}
  if(location.hash!=="#leaderboard")return;
  const cur=window.getCurrentWeekId();
  const by={};
  cf.names.forEach(n=>{by[n]={name:n,n:0,xp:0}});
  list.forEach(p=>{
    const f=by[p.flight];
    if(!f||p.flightTerm!==cf.term)return;
    f.n++;
    f.xp+=p.weekly&&p.weekly.weekId===cur?Math.max(0,Number(p.weekly.xp)||0):0;
  });
  const all=Object.values(by).map(f=>({...f,avg:f.n?f.xp/f.n:0}));
  const ranked=all.filter(f=>f.n>=FL_MIN).sort((a,b)=>b.avg-a.avg||b.xp-a.xp);
  const rest=all.filter(f=>f.n<FL_MIN).sort((a,b)=>b.n-a.n);
  const s=window.flGetSaved();
  const mine=s&&s.term===cf.term?s.flight:"";
  const row=(f,rk)=>`<tr class="${f.name===mine?"me":""}"><td>${rk}</td><td><b>${esc(f.name)}</b></td><td>${f.n}</td><td><b>${Math.round(f.avg)}</b> XP</td><td>${f.xp} XP</td></tr>`;
  const body=ranked.map((f,i)=>row(f,i<3?trophy(MEDALS[i],22):"<b>#"+(i+1)+"</b>")).join("")+rest.map(f=>row(f,"-")).join("");
  app.innerHTML=head+`<p class="sub">Flight score is the average weekly XP per member on the leaderboard, so a bigger flight has no advantage. A flight needs ${FL_MIN} members to be ranked. Resets every Sunday with the weekly board.</p>
  <div class="tw"><table id="fl-table"><thead><tr><th>RANK</th><th>FLIGHT</th><th>MEMBERS</th><th>AVG XP</th><th>TOTAL XP</th></tr></thead><tbody>${body}</tbody></table></div>
  ${rest.length?`<p class="sub" style="margin-top:10px">Flights with fewer than ${FL_MIN} members are not ranked yet.</p>`:""}`;
  bind();
}

const flLbBase=views.leaderboard;
views.leaderboard=async function(){
  await flLbBase();
  if(location.hash!=="#leaderboard")return;
  const row=document.querySelector("#app .srow");
  if(!row||row.querySelector("[data-flt]"))return;
  row.insertAdjacentHTML("beforeend",'<button class="tg" data-flt="1" aria-pressed="false">Flights</button>');
  row.querySelector("[data-flt]").onclick=flightsView;
};