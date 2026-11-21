(async function extrasSync(){
  const fb=window.FIREBASE_CONFIG;
  if(!fb||!fb.apiKey||String(fb.apiKey).startsWith("YOUR"))return;
  try{
    const V="10.12.2",base="https://www.gstatic.com/firebasejs/"+V+"/";
    const [{getApp},{getAuth,signInAnonymously},{getFirestore,doc,setDoc,getDoc,getDocs,deleteDoc,collection,query,where,limit,serverTimestamp}]=await Promise.all([
      import(base+"firebase-app.js"),
      import(base+"firebase-auth.js"),
      import(base+"firebase-firestore.js")
    ]);
    const wait=f=>new Promise(r=>{const t=setInterval(()=>{let v=false;try{v=f()}catch(e){}if(v){clearInterval(t);r(v)}},200)});
    await wait(()=>getApp());
    const hApp=getApp(),hAuth=getAuth(hApp),hDb=getFirestore(hApp);

    const hashOf=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36)};

    const context=async()=>{
  const u=hAuth.currentUser;
  if(!u||u.isAnonymous)throw new Error("Sign in to report");
  return{db:hDb,uid:u.uid};
};
    window.rpSubmit=async r=>{
      const {db,uid}=await context();
      try{
        await setDoc(doc(db,"reports",uid+"_"+hashOf(r.key)),{
          key:r.key,g:r.g,q:r.q,a:r.a,type:r.type,note:(r.note||"").slice(0,300),uid,created:serverTimestamp()
        });
        return "ok";
      }catch(e){
        if(e&&e.code==="permission-denied")return "dup";
        throw e;
      }
    };

    window.rpIsHost=async()=>{
      const u=hAuth.currentUser;
      if(!u||u.isAnonymous)return false;
      try{return (await getDoc(doc(hDb,"hosts",u.uid))).exists()}catch(e){return false}
    };
    window.rpList=async()=>(await getDocs(query(collection(hDb,"reports"),limit(400)))).docs.map(d=>({id:d.id,...d.data()}));
    window.rpResolve=async key=>{
      const s=await getDocs(query(collection(hDb,"reports"),where("key","==",key)));
      await Promise.all(s.docs.map(d=>deleteDoc(d.ref)));
    };
  }catch(err){
    console.error("Reports failed to load:",err);
  }
})();

// Syncs daily challenge results to the signed-in account (users/{uid}.daily)
// so the daily streak and today's score follow a cadet across devices.
(async function dailySync(){
  const fb=window.FIREBASE_CONFIG;
  if(!fb||!fb.apiKey||String(fb.apiKey).startsWith("YOUR"))return;
  try{
    const V="10.12.2",base="https://www.gstatic.com/firebasejs/"+V+"/";
    const [{getApp},{getFirestore,doc,getDoc,setDoc}]=await Promise.all([
      import(base+"firebase-app.js"),
      import(base+"firebase-firestore.js")
    ]);
    const wait=f=>new Promise(r=>{const t=setInterval(()=>{let v=false;try{v=f()}catch(e){}if(v){clearInterval(t);r(v)}},200)});
    await wait(()=>getApp());
    await wait(()=>typeof window.dailyRecord==="function"&&window.getUser);

    const db=getFirestore(getApp());
    const me=()=>window.getUser&&window.getUser();
    const KEEP=120;

    const trim=g=>{
      const o={};
      Object.keys(g).sort().slice(-KEEP).forEach(k=>{o[k]=g[k]});
      return o;
    };
    // Keep every day from both sides. If both have the same day, keep the higher score.
    const merge=(a,b)=>{
      const o=Object.assign({},b);
      Object.keys(a).forEach(k=>{if(!o[k]||(a[k].s||0)>(o[k].s||0))o[k]=a[k]});
      return o;
    };
    const refreshHome=()=>{
      const e=document.getElementById("xt-daily");
      if(e){e.remove();if(typeof decorate==="function")decorate()}
    };

    const push=async g=>{
      const u=me();
      if(!u)return;
      try{
        await setDoc(doc(db,"users",u.uid),{daily:JSON.stringify(trim(g||dailyGet()))},{merge:true});
      }catch(e){console.warn("Daily save failed",e)}
    };

    let last=0;
    const pull=async force=>{
      const u=me();
      if(!u)return;
      if(!force&&Date.now()-last<60000)return;
      last=Date.now();
      try{
        const s=await getDoc(doc(db,"users",u.uid));
        let cloud={};
        if(s.exists()&&s.data().daily){
          try{cloud=JSON.parse(s.data().daily)||{}}catch(e){cloud={}}
        }
        const local=dailyGet();
        const merged=trim(merge(local,cloud));
        const text=JSON.stringify(merged);
        if(text!==JSON.stringify(local)){
          localStorage.setItem(dKey(),text);
          refreshHome();
        }
        if(text!==JSON.stringify(cloud))await push(merged);
      }catch(e){console.warn("Daily load failed",e)}
    };

    // Save to the account right after a daily challenge is recorded.
    const baseRecord=window.dailyRecord;
    window.dailyRecord=function(t){
      baseRecord(t);
      push();
    };

    window.addEventListener("auth-state-changed",()=>pull(true));
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)pull(false)});
    if(window.authInitialized&&me())pull(true);
  }catch(err){
    console.error("Daily sync failed to load:",err);
  }
})();