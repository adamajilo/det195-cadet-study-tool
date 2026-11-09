const fb=window.FIREBASE_CONFIG;
if(fb&&fb.apiKey&&!String(fb.apiKey).startsWith("YOUR")){
  const V="10.12.2",base="https://www.gstatic.com/firebasejs/"+V+"/";
  const [{initializeApp},{getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signOut},{getFirestore,doc,getDoc,setDoc}]=await Promise.all([
    import(base+"firebase-app.js"),import(base+"firebase-auth.js"),import(base+"firebase-firestore.js")
  ]);
  const app=initializeApp(fb),auth=getAuth(app),db=getFirestore(app);
  const box=document.getElementById("acct");
  let user=null,timer=null,busy=false,again=false;

  const paint=()=>{
    if(!box)return;
    box.innerHTML=user
      ?`<button class="tg" id="so" title="Signed in as ${esc(user.email||"")}">Sign out</button>`
      :'<button class="tg" id="si">Sign in to sync</button>';
    const si=document.getElementById("si"),so=document.getElementById("so");
    if(si)si.onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(()=>toast("Sign-in cancelled"));
    if(so)so.onclick=()=>signOut(auth).then(()=>toast("Signed out. Progress stays on this device."));
  };

  const push=ref=>setDoc(ref,{srs:JSON.stringify(srs),days:[...days],tests:JSON.stringify(store.get("wk2_tests",[])),updated:Date.now()});

  async function sync(){
    if(!user)return false;
    if(busy){again=true;return false}
    busy=true;
    let ok=false;
    try{
      const ref=doc(db,"users",user.uid);
      const snap=await getDoc(ref);
      if(snap.exists()){
        const d=snap.data();
        if(mergeProgress({srs:JSON.parse(d.srs||"{}"),days:d.days||[],tests:JSON.parse(d.tests||"[]")}))render();
      }
      await push(ref);
      ok=true;
    }catch(e){
      console.warn("Sync failed",e);
    }finally{
      busy=false;
      if(again){again=false;sync()}
    }
    return ok;
  }

  window.queueSync=()=>{if(!user)return;clearTimeout(timer);timer=setTimeout(sync,1500)};
  onAuthStateChanged(auth,u=>{user=u;paint();if(u)sync().then(ok=>toast(ok?"Progress synced":"Could not sync, will retry"))});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync()});
  paint();
}