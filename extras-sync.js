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