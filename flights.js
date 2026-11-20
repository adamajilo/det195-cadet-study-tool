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