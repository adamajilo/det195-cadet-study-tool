(async function flightsSync(){
  const fb=window.FIREBASE_CONFIG;
  if(!fb||!fb.apiKey||String(fb.apiKey).startsWith("YOUR"))return;
  try{
    const V="10.12.2",base="https://www.gstatic.com/firebasejs/"+V+"/";
    const [{getApp},{getFirestore,doc,getDoc,getDocs,collection,query,where,limit}]=await Promise.all([
      import(base+"firebase-app.js"),
      import(base+"firebase-firestore.js")
    ]);
    const wait=f=>new Promise(r=>{const t=setInterval(()=>{let v=false;try{v=f()}catch(e){}if(v){clearInterval(t);r(v)}},200)});
    await wait(()=>getApp());
    const db=getFirestore(getApp());

    let cfgP=null;
    window.flGetConfig=()=>{
      if(!cfgP)cfgP=getDoc(doc(db,"config","flights")).then(s=>{
        if(!s.exists())return null;
        const d=s.data();
        const names=Array.isArray(d.names)?d.names.map(x=>String(x).trim()).filter(Boolean).slice(0,12):[];
        const term=String(d.term||"").trim().slice(0,20);
        return term&&names.length?{term,names}:null;
      }).catch(e=>{cfgP=null;console.warn("Flight config failed",e);return null});
      return cfgP;
    };

    window.flFetchProfiles=async term=>{
      const s=await getDocs(query(collection(db,"publicProfiles"),where("flightTerm","==",term),limit(500)));
      return s.docs.map(d=>({id:d.id,...d.data()}));
    };

    const loadMine=async()=>{
      const u=window.getUser&&window.getUser();
      if(!u||!window.flGetSaved||window.flGetSaved())return;
      try{
        const s=await getDoc(doc(db,"publicProfiles",u.uid));
        if(!s.exists())return;
        const d=s.data();
        if(d.flight&&d.flightTerm)window.flSetSaved(d.flight,d.flightTerm,true);
      }catch(e){}
    };
    window.addEventListener("auth-state-changed",loadMine);
    if(window.authInitialized)loadMine();
  }catch(err){
    console.error("Flights failed to load:",err);
  }
})();