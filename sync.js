(async function initSync() {
  const fb = window.FIREBASE_CONFIG;
  if (!fb || !fb.apiKey || String(fb.apiKey).startsWith("YOUR")) {
    console.log("Firebase config missing or invalid.");
    return;
  }

  try {
    const V = "10.12.2", base = "https://www.gstatic.com/firebasejs/" + V + "/";
    const [
      { initializeApp },
      { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, updateProfile },
      { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs }
    ] = await Promise.all([
      import(base + "firebase-app.js"), 
      import(base + "firebase-auth.js"), 
      import(base + "firebase-firestore.js")
    ]);

    const app = initializeApp(fb), auth = getAuth(app), db = getFirestore(app);
    const box = document.getElementById("acct");
    let user = null, timer = null, busy = false, again = false;

    // Helper: Returns YYYY-MM-DD of the most recent Sunday for weekly resets
    const getCurrentWeekId = () => {
      const d = new Date();
      const day = d.getDay(); // 0 is Sunday
      d.setDate(d.getDate() - day);
      return d.toISOString().split("T")[0];
    };

    // Render Auth UI in Header
    const paint = () => {
      if (!box) return;
      box.innerHTML = user
        ? `<div class="acct-user">
            <a href="#account" class="user-link">
              ${user.photoURL ? `<img src="${esc(user.photoURL)}" class="acct-avatar" alt="">` : ""}
              <span>${esc(user.displayName || user.email.split("@")[0])}</span>
            </a>
            <button class="tg" id="so">Sign out</button>
           </div>`
        : '<button class="tg" id="si">Sign in to sync</button>';
      
      const si = document.getElementById("si"), so = document.getElementById("so");
      if (si) si.onclick = () => signInWithPopup(auth, new GoogleAuthProvider()).catch(() => toast("Sign-in cancelled"));
      if (so) so.onclick = () => signOut(auth).then(() => toast("Signed out."));
    };

    // Push User Profile, Spaced Repetition Stats & Weekly Metrics to Firestore
    const push = async ref => {
      if (!user) return;
      const allCards = (typeof C !== "undefined" && typeof visible === "function") ? C.filter(visible) : [];
      const masteredCount = (typeof mastered === "function") ? allCards.filter(mastered).length : 0;
      const currentStreak = (typeof streak === "function") ? streak() : 0;
      
      const weekId = getCurrentWeekId();
      
      // Pull existing document to handle weekly rollover
      const snap = await getDoc(ref);
      let weeklyData = { weekId, mastered: 0, xp: 0 };
      
      if (snap.exists()) {
        const existing = snap.data();
        if (existing.weekly && existing.weekly.weekId === weekId) {
          weeklyData = existing.weekly;
          const prevMastered = existing.mastered || 0;
          if (masteredCount > prevMastered) {
            const diff = masteredCount - prevMastered;
            weeklyData.mastered += diff;
            weeklyData.xp += diff * 50; // 50 XP per mastered card
          }
        } else {
          // New week started! Reset weekly stats
          weeklyData = { weekId, mastered: 0, xp: currentStreak * 25 };
        }
      } else {
        weeklyData.xp = currentStreak * 25;
      }

      const safeSrs = (typeof srs !== "undefined") ? JSON.stringify(srs) : "{}";
      const safeDays = (typeof days !== "undefined") ? [...days] : [];
      const safeTests = (typeof store !== "undefined") ? JSON.stringify(store.get("wk2_tests", [])) : "[]";

      await setDoc(ref, {
        displayName: user.displayName || user.email.split("@")[0] || "Cadet",
        photoURL: user.photoURL || "",
        mastered: masteredCount,
        streak: currentStreak,
        weekly: weeklyData,
        srs: safeSrs,
        days: safeDays,
        tests: safeTests,
        updated: Date.now()
      }, { merge: true });
    };

    async function sync() {
      if (!user) return false;
      if (busy) { again = true; return false; }
      busy = true;
      let ok = false;
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          if (typeof mergeProgress === "function" && d.srs) {
            if (mergeProgress({
              srs: JSON.parse(d.srs || "{}"),
              days: d.days || [],
              tests: JSON.parse(d.tests || "[]")
            }) && typeof render === "function") {
              render();
            }
          }
        }
        await push(ref);
        ok = true;
      } catch (e) {
        console.warn("Sync failed:", e);
      } finally {
        busy = false;
        if (again) { again = false; sync(); }
      }
      return ok;
    }

    // Expose Profile Update Handler
    window.updateUserProfile = async (newName, newPhoto) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast("No active user session");
        return false;
      }

      try {
        await updateProfile(currentUser, {
          displayName: newName,
          photoURL: newPhoto
        });

        const ref = doc(db, "users", currentUser.uid);
        await setDoc(ref, {
          displayName: newName,
          photoURL: newPhoto,
          updated: Date.now()
        }, { merge: true });

        user = auth.currentUser;
        paint();
        toast("Profile updated!");
        return true;
      } catch (err) {
        console.error("Profile update error details:", err);
        paint();
        toast("Profile updated locally (cloud sync retry scheduled)");
        if (typeof queueSync === "function") queueSync();
        return false;
      }
    };

    // Fetch Weekly Leaderboard
    window.fetchWeeklyLeaderboard = async () => {
      try {
        const weekId = getCurrentWeekId();
        const q = query(
          collection(db, "users"), 
          orderBy("weekly.xp", "desc"), 
          orderBy("weekly.mastered", "desc"), 
          limit(25)
        );
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          // Filter out records from previous weeks if query fallback returns them
          if (data.weekly && data.weekly.weekId === weekId) {
            list.push({
              id: docSnap.id,
              name: data.displayName || "Anonymous Cadet",
              photo: data.photoURL || "",
              xpWeekly: data.weekly?.xp || 0,
              masteredWeekly: data.weekly?.mastered || 0,
              streak: data.streak || 0
            });
          }
        });
        return list;
      } catch (err) {
        console.error("Error fetching weekly leaderboard:", err);
        return [];
      }
    };

    // Fetch Individual Cadet Profile for Inspection
    window.fetchUserProfile = async (userId) => {
      try {
        const docRef = doc(db, "users", userId);
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() : null;
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        return null;
      }
    };

    window.getUser = () => auth.currentUser;
    window.queueSync = () => { if (!user) return; clearTimeout(timer); timer = setTimeout(sync, 1500); };
    
    onAuthStateChanged(auth, u => { 
      user = u; 
      paint(); 
      if (u) {
        sync().then(ok => {
          if (ok) toast("Progress synced");
        });
      } 
    });

    document.addEventListener("visibilitychange", () => { if (!document.hidden) sync(); });
    paint();
  } catch (err) {
    console.warn("Firebase failed to load:", err);
  }
})();