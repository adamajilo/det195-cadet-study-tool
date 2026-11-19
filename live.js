const LVC=["#d1403a","#2f6fd1","#d99a12","#1f9d6b"];
const LVL=["A","B","C","D"];
const LV={mode:"menu",code:"",deck:[],idx:-1,secs:15,game:null,players:[],answered:0,uid:null,unsub:[],unsubA:null,tm:null,timerQ:-1,choice:null,lastQ:-1,revealing:false,name:""};
const LVT=typeof trophy==="function"?trophy:()=>"";

function lvStop(){
  LV.unsub.forEach(f=>{try{f()}catch(e){}});LV.unsub=[];
  if(LV.unsubA){try{LV.unsubA()}catch(e){}LV.unsubA=null}
  clearInterval(LV.tm);
}
function lvReset(){
  lvStop();
  Object.assign(LV,{mode:"menu",code:"",deck:[],idx:-1,game:null,players:[],answered:0,uid:null,timerQ:-1,choice:null,lastQ:-1,revealing:false});
}
const lvRanked=()=>LV.players.slice().sort((a,b)=>(b.score||0)-(a.score||0));
const lvImgs=a=>a&&a.length?`<div class="shots">${a.map(s=>`<figure class="shot"><img class="pic" src="${esc(s)}" alt=""></figure>`).join("")}</div>`:"";
function lvCountdown(secs,onEnd){
  clearInterval(LV.tm);
  const t0=Date.now();
  const tick=()=>{
    const left=Math.max(0,secs*1000-(Date.now()-t0));
    const e=document.getElementById("lv-timer");
    if(e)e.textContent=Math.ceil(left/1000);
    if(left<=0){clearInterval(LV.tm);if(onEnd)onEnd()}
  };
  tick();LV.tm=setInterval(tick,250);
}
function lvBuildDeck(cards,n){
  const pool=C.filter(baseVis);
  return shuffle(cards).slice(0,n).map(c=>{
    const q=buildQ(c,pool,Math.random()<.4);
    return{text:q.img?"Who or what is this?":q.c.q,options:q.opts,correct:q.opts.indexOf(q.right),imgs:q.img?photos(q.c).map(p=>p[0]):[]};
  }).filter(q=>q.options.length>=2&&q.correct>=0);
}

function lvMenu(){
  const app=$("#app");
  const saved=localStorage.getItem("lv_name")||"";
  app.innerHTML=`<h2 class="h">Live quiz</h2><p class="sub">Join a game your host started, or host one for your flight.</p>
  <div class="qcard lv-box"><h3 class="lv-h">Join a game</h3>
    <input class="ti" id="lv-code" inputmode="numeric" maxlength="6" placeholder="6-digit code" aria-label="Game code">
    <input class="ti" id="lv-name" maxlength="20" placeholder="Your nickname" aria-label="Nickname" value="${esc(saved)}">
    <div class="acts"><button class="btn go" id="lv-join">Join</button></div>
  </div>
  <div id="lv-hostbox"></div>`;
  $("#lv-join").onclick=()=>{
    const code=$("#lv-code").value.trim(),name=$("#lv-name").value.trim();
    if(!/^\d{6}$/.test(code)){toast("Enter the 6-digit code");return}
    if(!name){toast("Choose a nickname");return}
    lvJoinGame(code,name);
  };
  const box=document.getElementById("lv-hostbox");
  const user=window.getUser?window.getUser():null;
  if(!window.lvIsHost){box.innerHTML='<p class="note">Live quizzes are still loading. Refresh in a moment.</p>';return}
  if(!user){box.innerHTML='<p class="note">Sign in with Google to host a game.</p>';return}
  window.lvIsHost().then(ok=>{
    if(LV.mode!=="menu"||!document.getElementById("lv-hostbox"))return;
    const resume=localStorage.getItem("lv_host");
    box.innerHTML=ok
      ?`<div class="acts" style="justify-content:flex-start"><button class="btn go" id="lv-host">Host a game</button>${resume?`<button class="btn" id="lv-resume">Resume game ${esc(resume)}</button>`:""}</div>`
      :'<p class="note">Hosting is limited to approved hosts. Ask the site owner to add your account.</p>';
    if(!ok)return;
    $("#lv-host").onclick=()=>{LV.mode="setup";views.live()};
    if(resume)$("#lv-resume").onclick=()=>lvResume(resume);
  });
}

function lvSetup(){
  const nt=nextTest();
  const sets=[["Next test: "+nt.t,scopeCards(weeksFor(nt),termOf(nt))],...SCHED.filter(x=>x.big).map(x=>[x.t,scopeCards(weeksFor(x),termOf(x))]),["Everything",C.filter(visible)]];
  $("#app").innerHTML=`<h2 class="h">Host a game</h2><p class="sub">Pick what to quiz on. Players answer on their own phones.</p>
  <div class="qcard lv-box">
    <label>Game name<input class="ti" id="lv-gname" maxlength="40" value="Det 195 quiz"></label>
    <label>Cards<select class="ti" id="lv-set">${sets.map((s,i)=>`<option value="${i}">${esc(s[0])} (${s[1].length} cards)</option>`).join("")}</select></label>
    <label>Questions<select class="ti" id="lv-n"><option>10</option><option selected>15</option><option>20</option></select></label>
    <label>Seconds per question<select class="ti" id="lv-secs"><option>10</option><option selected>15</option><option>20</option><option>30</option></select></label>
    <div class="acts"><button class="btn go" id="lv-make">Create game</button><button class="btn" id="lv-back">Back</button></div>
  </div>`;
  $("#lv-back").onclick=()=>{LV.mode="menu";views.live()};
  $("#lv-make").onclick=()=>lvHostStart(sets[+$("#lv-set").value][1],+$("#lv-n").value,+$("#lv-secs").value,$("#lv-gname").value.trim());
}

async function lvHostStart(cards,n,secs,name){
  const deck=lvBuildDeck(cards,n);
  if(deck.length<3){toast("Not enough cards for a game");return}
  try{
    const code=await window.lvCreate({name,deck,secs});
    localStorage.setItem("lv_host",code);
    Object.assign(LV,{mode:"host",code,deck,secs,idx:-1,game:null,players:[],timerQ:-1});
    lvWatchHost();views.live();
  }catch(e){console.error(e);toast("Could not create the game")}
}
async function lvResume(code){
  try{
    const deck=await window.lvLoadDeck(code);
    Object.assign(LV,{mode:"host",code,deck,game:null,players:[],timerQ:-1});
    lvWatchHost();views.live();
  }catch(e){console.error(e);localStorage.removeItem("lv_host");toast("That game is no longer available");views.live()}
}
function lvWatchHost(){
  LV.unsub.push(window.lvWatchGame(LV.code,g=>{
    LV.game=g;
    if(g){if(typeof g.qIndex==="number")LV.idx=g.qIndex;if(g.secs)LV.secs=g.secs}
    if(location.hash==="#live"&&LV.mode==="host")views.live();
  },"host"));
  LV.unsub.push(window.lvWatchPlayers(LV.code,p=>{
    LV.players=p;
    if(location.hash==="#live"&&LV.mode==="host"&&LV.game&&LV.game.status!=="question")views.live();
  },"host"));
}
async function lvOpen(idx){
  LV.revealing=false;LV.answered=0;LV.timerQ=-1;
  if(LV.unsubA){LV.unsubA();LV.unsubA=null}
  const q=LV.deck[idx];
  try{
    await window.lvOpenQuestion(LV.code,idx,{text:q.text,options:q.options,imgs:q.imgs});
    LV.unsubA=window.lvWatchAnswers(LV.code,idx,n=>{
      LV.answered=n;
      const e=document.getElementById("lv-count");
      if(e)e.textContent=n+" of "+LV.players.length+" answered";
      if(LV.players.length&&n>=LV.players.length)lvReveal();
    });
  }catch(e){console.error(e);toast("Could not open the question")}
}
async function lvReveal(){
  if(LV.revealing||!LV.game||LV.game.status!=="question")return;
  LV.revealing=true;clearInterval(LV.tm);
  try{await window.lvCloseQuestion(LV.code,LV.idx,LV.deck[LV.idx].correct,LV.secs)}
  catch(e){console.error(e);toast("Could not score the question");LV.revealing=false}
}
async function lvEnd(){
  if(!confirm("Delete this game for everyone?"))return;
  lvStop();
  try{await window.lvDeleteGame(LV.code)}catch(e){console.error(e)}
  localStorage.removeItem("lv_host");
  lvReset();views.live();
}

function lvHostView(){
  const app=$("#app"),g=LV.game;
  if(!g){app.innerHTML='<p class="note">Loading game...</p>';return}
  const ranked=lvRanked();
  if(g.status==="lobby"){
    app.innerHTML=`<h2 class="h">${esc(g.name||"Live quiz")}</h2><p class="sub">Players open this site, choose Live, and enter the code.</p>
    <div class="lv-code">${esc(LV.code)}</div>
    <h3 class="lv-h">${ranked.length} in the lobby</h3>
    <div class="chips">${ranked.map(p=>`<button class="tg" data-kick="${esc(p.id)}" title="Remove player">${esc(p.name)} ×</button>`).join("")||'<span class="sub">Waiting for players...</span>'}</div>
    <div class="acts" style="margin-top:18px"><button class="btn go" id="lv-start" ${ranked.length?"":"disabled"}>Start game</button><button class="btn" id="lv-end">Cancel game</button></div>`;
    document.querySelectorAll("[data-kick]").forEach(b=>b.onclick=()=>window.lvKick(LV.code,b.dataset.kick));
    $("#lv-start").onclick=()=>lvOpen(0);
    $("#lv-end").onclick=lvEnd;
    return;
  }
  if(g.status==="question"){
    const q=g.current||{options:[]};
    app.innerHTML=`<div class="row"><span class="timer" id="lv-timer">${LV.secs}</span><span class="sub" style="margin:0">Question ${g.qIndex+1} of ${g.total}</span><span class="sub" style="margin:0" id="lv-count">${LV.answered} of ${ranked.length} answered</span></div>
    <div class="qcard"><p class="ft">${esc(q.text||"")}</p>${lvImgs(q.imgs)}</div>
    <div class="lv-grid">${q.options.map((o,i)=>`<div class="lv-ans" style="background:${LVC[i]}"><b>${LVL[i]}</b> ${esc(o)}</div>`).join("")}</div>
    <div class="acts" style="margin-top:14px"><button class="btn" id="lv-rev">Reveal now</button></div>`;
    $("#lv-rev").onclick=lvReveal;
    if(LV.timerQ!==g.qIndex){LV.timerQ=g.qIndex;lvCountdown(LV.secs,()=>setTimeout(lvReveal,800))}
    return;
  }
  if(g.status==="reveal"){
    const q=g.current||{options:[]},r=g.reveal||{correct:-1,counts:[0,0,0,0]};
    const max=Math.max(1,...r.counts);
    const last=g.qIndex>=g.total-1;
    app.innerHTML=`<div class="qcard"><p class="ft">${esc(q.text||"")}</p>${lvImgs(q.imgs)}</div>
    <div class="lv-grid">${q.options.map((o,i)=>`<div class="lv-ans ${i===r.correct?"correct":"dim"}" style="background:${LVC[i]}"><b>${LVL[i]}</b> ${esc(o)}<div class="lv-bar"><i style="width:${r.counts[i]/max*100}%"></i></div><small>${r.counts[i]} answered</small></div>`).join("")}</div>
    <h3 class="lv-h">Top scores</h3>
    <div class="tw"><table><tbody>${ranked.slice(0,5).map((p,i)=>`<tr><td>#${i+1}</td><td>${esc(p.name)}</td><td>${p.score||0}</td><td>${p.last?"+"+p.last:""}</td></tr>`).join("")}</tbody></table></div>
    <div class="acts" style="margin-top:14px"><button class="btn go" id="lv-next">${last?"Finish game":"Next question"}</button></div>`;
    $("#lv-next").onclick=()=>last?window.lvFinish(LV.code):lvOpen(g.qIndex+1);
    return;
  }
  const kinds=["gold","silver","bronze"];
  app.innerHTML=`<h2 class="h">Final results</h2>
  <div class="tw"><table><tbody>${ranked.map((p,i)=>`<tr><td>${i<3?LVT(kinds[i],24):"#"+(i+1)}</td><td>${esc(p.name)}</td><td>${p.score||0}</td></tr>`).join("")}</tbody></table></div>
  <div class="acts" style="margin-top:18px"><button class="btn" id="lv-del">Delete game</button></div>`;
  $("#lv-del").onclick=lvEnd;
}

async function lvJoinGame(code,name){
  try{
    const uid=await window.lvJoin(code,name);
    localStorage.setItem("lv_name",name);
    Object.assign(LV,{mode:"play",code,uid,name,game:null,players:[],lastQ:-1,choice:null,timerQ:-1});
    LV.unsub.push(window.lvWatchGame(code,g=>{LV.game=g;if(location.hash==="#live"&&LV.mode==="play")views.live()},"player"));
    LV.unsub.push(window.lvWatchPlayers(code,p=>{LV.players=p;if(location.hash==="#live"&&LV.mode==="play"&&LV.game&&LV.game.status!=="question")views.live()},"player"));
    views.live();
  }catch(e){console.error(e);toast("Could not join that game")}
}
function lvPlayerView(){
  const app=$("#app"),g=LV.game;
  if(!g){app.innerHTML='<p class="note">This game has ended.</p><div class="acts"><button class="btn" id="lv-leave">Back</button></div>';$("#lv-leave").onclick=()=>{lvReset();views.live()};return}
  const ranked=lvRanked(),me=LV.players.find(p=>p.id===LV.uid),place=ranked.findIndex(p=>p.id===LV.uid)+1;
  if(g.status==="lobby"){
    app.innerHTML=`<h2 class="h">You are in</h2><p class="sub">${esc(LV.name)}, wait for the host to start. ${ranked.length} player${ranked.length===1?"":"s"} so far.</p>`;
    return;
  }
  if(g.status==="question"){
    const q=g.current||{options:[]};
    if(LV.lastQ!==g.qIndex){LV.lastQ=g.qIndex;LV.choice=null;LV.timerQ=-1}
    app.innerHTML=`<div class="row"><span class="timer" id="lv-timer">${g.secs}</span><span class="sub" style="margin:0">Question ${g.qIndex+1} of ${g.total}</span></div>
    <div class="qcard"><p class="ft">${esc(q.text||"")}</p>${lvImgs(q.imgs)}</div>
    ${LV.choice!=null?'<p class="note">Answer locked in. Wait for the reveal.</p>':""}
    <div class="lv-grid">${q.options.map((o,i)=>`<button class="lv-ans" data-i="${i}" style="background:${LVC[i]}" ${LV.choice!=null?"disabled":""}><b>${LVL[i]}</b> ${esc(o)}</button>`).join("")}</div>`;
    document.querySelectorAll(".lv-ans[data-i]").forEach(b=>b.onclick=async()=>{
      if(LV.choice!=null)return;
      const i=+b.dataset.i;LV.choice=i;lvPlayerView();
      try{await window.lvAnswer(LV.code,g.qIndex,i)}catch(e){console.warn(e);toast("Too late")}
    });
    if(LV.timerQ!==g.qIndex){LV.timerQ=g.qIndex;lvCountdown(g.secs)}
    return;
  }
  if(g.status==="reveal"){
    const r=g.reveal||{correct:-1},ok=LV.choice===r.correct;
    app.innerHTML=`<div class="done"><b>${LV.choice==null?"No answer":ok?"Correct":"Not this time"}</b><p>${ok&&me?"+"+(me.last||0)+" points":"The answer was "+esc((g.current.options||[])[r.correct]||"")}</p></div>
    <div class="stats" style="margin-top:14px"><div class="stat"><b>${me?me.score||0:0}</b><span>Score</span></div><div class="stat"><b>${place||"-"}</b><span>Place</span></div></div>`;
    return;
  }
  const kinds=["gold","silver","bronze"];
  app.innerHTML=`<div class="done"><b>${place?"#"+place:"Done"}</b><p>${esc(LV.name)}, you finished with ${me?me.score||0:0} points.</p></div>
  <div class="tw" style="margin-top:14px"><table><tbody>${ranked.slice(0,5).map((p,i)=>`<tr><td>${i<3?LVT(kinds[i],24):"#"+(i+1)}</td><td>${esc(p.name)}</td><td>${p.score||0}</td></tr>`).join("")}</tbody></table></div>
  <div class="acts" style="margin-top:18px"><button class="btn" id="lv-leave">Leave</button></div>`;
  $("#lv-leave").onclick=()=>{lvReset();views.live()};
}

views.live=function(){
  if(LV.mode==="host")return lvHostView();
  if(LV.mode==="play")return lvPlayerView();
  if(LV.mode==="setup")return lvSetup();
  return lvMenu();
};