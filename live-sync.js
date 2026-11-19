(async function liveSync(){
  const fb=window.FIREBASE_CONFIG;
  if(!fb||!fb.apiKey||String(fb.apiKey).startsWith("YOUR"))return;
  try{
    const V="10.12.2",base="https://www.gstatic.com/firebasejs/"+V+"/";
    const [{getApp,initializeApp},{getAuth,signInAnonymously},{getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,deleteField,collection,getDocs,query,where,onSnapshot,writeBatch,serverTimestamp}]=await Promise.all([
      import(base+"firebase-app.js"),
      import(base+"firebase-auth.js"),
      import(base+"firebase-firestore.js")
    ]);
    const wait=f=>new Promise(r=>{const t=setInterval(()=>{let v=false;try{v=f()}catch(e){}if(v){clearInterval(t);r(v)}},200)});
    await wait(()=>getApp());

    const hApp=getApp(),hAuth=getAuth(hApp),hDb=getFirestore(hApp);
    const pApp=initializeApp(fb,"live"),pAuth=getAuth(pApp),pDb=getFirestore(pApp);
    const gref=(db,code)=>doc(db,"games",code);
    const dbFor=r=>r==="host"?hDb:pDb;

    window.lvIsHost=async()=>{
      const u=hAuth.currentUser;
      if(!u)return false;
      try{return (await getDoc(doc(hDb,"hosts",u.uid))).exists()}catch(e){return false}
    };

    window.lvCreate=async({name,deck,secs})=>{
      const u=hAuth.currentUser;
      if(!u)throw new Error("Sign in first");
      let code=null;
      for(let i=0;i<8&&!code;i++){
        const c=String(Math.floor(100000+Math.random()*900000));
        if(!(await getDoc(gref(hDb,c))).exists())code=c;
      }
      if(!code)throw new Error("No free code");
      await setDoc(gref(hDb,code),{hostUid:u.uid,name:name||"Live quiz",status:"lobby",qIndex:-1,total:deck.length,secs,created:serverTimestamp()});
      await setDoc(doc(hDb,"games",code,"private","key"),{deck:JSON.stringify(deck)});
      return code;
    };

    window.lvLoadDeck=async code=>JSON.parse((await getDoc(doc(hDb,"games",code,"private","key"))).data().deck);

    window.lvOpenQuestion=(code,idx,q)=>updateDoc(gref(hDb,code),{
      status:"question",
      qIndex:idx,
      current:{index:idx,text:q.text,options:q.options,imgs:q.imgs||[]},
      startedAt:serverTimestamp(),
      reveal:deleteField()
    });

    window.lvCloseQuestion=async(code,idx,correct,secs)=>{
      const gs=await getDoc(gref(hDb,code));
      const sa=gs.data().startedAt;
      const t0=sa&&sa.toMillis?sa.toMillis():Date.now();
      const answers=await getDocs(query(collection(hDb,"games",code,"answers"),where("q","==",idx)));
      const counts=[0,0,0,0],gains={};
      answers.forEach(d=>{
        const a=d.data();
        if(a.choice>=0&&a.choice<4)counts[a.choice]++;
        if(a.choice===correct){
          const at=a.at&&a.at.toMillis?a.at.toMillis():t0;
          const frac=Math.min(1,Math.max(0,at-t0)/(secs*1000));
          gains[a.uid]=Math.round(1000*(1-frac/2));
        }
      });
      const players=await getDocs(collection(hDb,"games",code,"players"));
      const batch=writeBatch(hDb);
      players.forEach(p=>{const g=gains[p.id]||0;batch.update(p.ref,{score:(p.data().score||0)+g,last:g})});
      batch.update(gref(hDb,code),{status:"reveal",reveal:{correct,counts}});
      await batch.commit();
    };

    window.lvFinish=code=>updateDoc(gref(hDb,code),{status:"done"});
    window.lvKick=(code,uid)=>deleteDoc(doc(hDb,"games",code,"players",uid));
    window.lvDeleteGame=async code=>{
      for(const sub of ["players","answers","private"]){
        const s=await getDocs(collection(hDb,"games",code,sub));
        await Promise.all(s.docs.map(d=>deleteDoc(d.ref)));
      }
      await deleteDoc(gref(hDb,code));
    };

    window.lvWatchGame=(code,cb,role)=>onSnapshot(gref(dbFor(role),code),s=>cb(s.exists()?s.data():null),e=>console.warn("Game watch",e));
    window.lvWatchPlayers=(code,cb,role)=>onSnapshot(collection(dbFor(role),"games",code,"players"),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),e=>console.warn("Players watch",e));
    window.lvWatchAnswers=(code,idx,cb)=>onSnapshot(query(collection(hDb,"games",code,"answers"),where("q","==",idx)),s=>cb(s.size),e=>console.warn("Answers watch",e));

    window.lvJoin=async(code,name)=>{
      if(!pAuth.currentUser)await signInAnonymously(pAuth);
      const u=pAuth.currentUser;
      const g=await getDoc(gref(pDb,code));
      if(!g.exists()||g.data().status==="done")throw new Error("Game not found");
      const pr=doc(pDb,"games",code,"players",u.uid);
      if(!(await getDoc(pr)).exists())await setDoc(pr,{name,score:0,joined:serverTimestamp(),last:0});
      return u.uid;
    };

    window.lvAnswer=(code,idx,choice)=>{
      const u=pAuth.currentUser;
      return setDoc(doc(pDb,"games",code,"answers",idx+"_"+u.uid),{uid:u.uid,q:idx,choice,at:serverTimestamp()});
    };
  }catch(err){
    console.error("Live quiz failed to load:",err);
  }
})();