(async function boardSync() {
  const fb = window.FIREBASE_CONFIG;
  if (!fb || !fb.apiKey || String(fb.apiKey).startsWith("YOUR")) return;
  try {
    const V = "10.12.2", base = "https://www.gstatic.com/firebasejs/" + V + "/";
    const [{ getApp }, { getAuth }, { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy, limit }] = await Promise.all([
      import(base + "firebase-app.js"),
      import(base + "firebase-auth.js"),
      import(base + "firebase-firestore.js")
    ]);
    const wait = f => new Promise(r => { const t = setInterval(() => { let v = false; try { v = f() } catch (e) { } if (v) { clearInterval(t); r(v) } }, 200) });
    await wait(() => getApp());
    await wait(() => window.queueSync && window.getCurrentWeekId && window.lbGetFlags);

    const app = getApp(), auth = getAuth(app), db = getFirestore(app);
    const me = () => auth.currentUser;
    const week = () => window.getCurrentWeekId();

    window.lbSaveFlags = async f => {
      const u = me(); if (!u) return;
      try { await setDoc(doc(db, "users", u.uid), { flags: f }, { merge: true }) }
      catch (e) { console.warn("Flags save failed", e) }
    };

    window.lbWriteEntry = async () => {
      const u = me();
      if (!u || !window.isListed()) return;
      const w = week(), s = store.get("wk2_xp", { weekId: w, xp: 0 });
      const xp = s.weekId === w ? Math.max(0, Number(s.xp) || 0) : 0;
      if (xp <= 0) return;
      const k = "wk2_xpat_" + u.uid + "_" + w;
      let p; try { p = JSON.parse(localStorage.getItem(k) || "null") } catch (e) { p = null }
      p = p || { xp: -1, at: 0 };
      if (p.xp !== xp) { p = { xp, at: Date.now() }; localStorage.setItem(k, JSON.stringify(p)) }
      try {
        await setDoc(doc(db, "weeklyResults", w, "entries", u.uid), {
          name: u.displayName || (u.email || "Cadet").split("@")[0],
          photo: u.photoURL || "",
          xp,
          xpAt: p.at,
          daily: { [today()]: xp },
          updated: Date.now()
        }, { merge: true });
      } catch (e) { console.warn("Entry write failed", e) }
    };

    window.lbDeleteMine = async () => {
      const u = me(); if (!u) return;
      try {
        await deleteDoc(doc(db, "publicProfiles", u.uid));
        await deleteDoc(doc(db, "weeklyResults", week(), "entries", u.uid));
      } catch (e) { console.warn("Delete failed", e) }
    };

    window.lbFetchHistory = async () => {
      const cur = week(), have = new Map();
      (await getDocs(query(collection(db, "weeklyResults"), orderBy("weekId", "desc"), limit(40)))).forEach(d => have.set(d.id, d.data()));
      for (let w = LB_FIRST; w < cur; w = plusDays(w, 7)) {
        if (have.has(w)) continue;
        const es = [];
        (await getDocs(query(collection(db, "weeklyResults", w, "entries"), orderBy("xp", "desc"), limit(10)))).forEach(d => es.push({ uid: d.id, ...d.data() }));
        const sum = closeWeek(w, es);
        try { await setDoc(doc(db, "weeklyResults", w), sum); have.set(w, sum) }
        catch (e) { const s = await getDoc(doc(db, "weeklyResults", w)); have.set(w, s.exists() ? s.data() : sum) }
      }
      return [...have.values()].filter(w => w.top && w.top.length).sort((a, b) => b.weekId < a.weekId ? -1 : 1);
    };

    const onAuth = async () => {
      const u = me(); if (!u) return;
      let cloud = null;
      try { const s = await getDoc(doc(db, "users", u.uid)); cloud = s.exists() ? s.data().flags || null : null } catch (e) { }
      const local = window.lbGetFlags();
      const merged = {
        gold: !!((cloud && cloud.gold) || local.gold),
        listed: cloud && typeof cloud.listed === "boolean" ? cloud.listed : local.listed
      };
      window.lbSetFlagsLocal(merged);
      if (!cloud || cloud.gold !== merged.gold || cloud.listed !== merged.listed) window.lbSaveFlags(merged);
      if (merged.listed) { window.queueSync(); window.lbWriteEntry() }
      else window.lbDeleteMine();
    };

    window.addEventListener("auth-state-changed", onAuth);
    if (window.authInitialized && me()) onAuth();

    const baseQueue = window.queueSync;
    let t = null;
    window.queueSync = () => { baseQueue(); clearTimeout(t); t = setTimeout(() => window.lbWriteEntry(), 4000) };
    document.addEventListener("visibilitychange", () => { if (!document.hidden) window.lbWriteEntry() });
  } catch (err) {
    console.error("Leaderboard history failed to load:", err);
  }
})();

//flights
(async function flightsSync() {
  const fb = window.FIREBASE_CONFIG;
  if (!fb || !fb.apiKey || String(fb.apiKey).startsWith("YOUR")) return;
  try {
    const V = "10.12.2", base = "https://www.gstatic.com/firebasejs/" + V + "/";
    const [{ getApp }, { getFirestore, doc, getDoc, getDocs, collection, query, where, limit }] = await Promise.all([
      import(base + "firebase-app.js"),
      import(base + "firebase-firestore.js")
    ]);
    const wait = f => new Promise(r => { const t = setInterval(() => { let v = false; try { v = f() } catch (e) { } if (v) { clearInterval(t); r(v) } }, 200) });
    await wait(() => getApp());
    const db = getFirestore(getApp());

    let cfgP = null;
    window.flGetConfig = () => {
      if (!cfgP) cfgP = getDoc(doc(db, "config", "flights")).then(s => {
        if (!s.exists()) return null;
        const d = s.data();
        const names = Array.isArray(d.names) ? d.names.map(x => String(x).trim()).filter(Boolean).slice(0, 12) : [];
        const term = String(d.term || "").trim().slice(0, 20);
        return term && names.length ? { term, names } : null;
      }).catch(e => { cfgP = null; console.warn("Flight config failed", e); return null });
      return cfgP;
    };

    window.flFetchProfiles = async term => {
      const s = await getDocs(query(collection(db, "publicProfiles"), where("flightTerm", "==", term), limit(500)));
      return s.docs.map(d => ({ id: d.id, ...d.data() }));
    };

    const loadMine = async () => {
      const u = window.getUser && window.getUser();
      if (!u || !window.flGetSaved || window.flGetSaved()) return;
      try {
        const s = await getDoc(doc(db, "publicProfiles", u.uid));
        if (!s.exists()) return;
        const d = s.data();
        if (d.flight && d.flightTerm) window.flSetSaved(d.flight, d.flightTerm, true);
      } catch (e) { }
    };
    window.addEventListener("auth-state-changed", loadMine);
    if (window.authInitialized) loadMine();
  } catch (err) {
    console.error("Flights failed to load:", err);
  }
})();