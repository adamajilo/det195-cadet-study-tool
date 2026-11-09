
(async function initSync() {
  const fb = window.FIREBASE_CONFIG;

  if (!fb || !fb.apiKey || String(fb.apiKey).startsWith("YOUR")) {
    console.warn("Firebase config missing or invalid.");
    return;
  }

  try {
    const V = "10.12.2";
    const base = `https://www.gstatic.com/firebasejs/${V}/`;

    const [
      { initializeApp },
      {
        getAuth,
        onAuthStateChanged,
        GoogleAuthProvider,
        signInWithPopup,
        signOut,
        updateProfile
      },
      {
        getFirestore,
        doc,
        setDoc,
        collection,
        query,
        where,
        orderBy,
        limit,
        getDocs,
        getDoc
      }
    ] = await Promise.all([
      import(base + "firebase-app.js"),
      import(base + "firebase-auth.js"),
      import(base + "firebase-firestore.js")
    ]);

    const app = initializeApp(fb);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const box = document.getElementById("acct");

    let user = null;
    let timer = null;
    let busy = false;
    let again = false;

    // Local calendar date, avoiding UTC date shifts.
    const localDate = d =>
      d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");

    const getCurrentWeekId = () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      return localDate(d);
    };

    window.getCurrentWeekId = getCurrentWeekId;

    const getLocalProgress = () => ({
  srs: store.get("wk2_srs", {}),
  days: store.get("wk2_days", []),
  tests: store.get("wk2_tests", []),
  xp: store.get("wk2_xp", {
    weekId: getCurrentWeekId(),
    xp: 0
  })
});

    const getMetrics = () => {
      const cards = typeof C !== "undefined"
        ? C.filter(c =>
            typeof baseVis === "function" &&
            baseVis(c) &&
            c.kind !== "job"
          )
        : [];

      const masteredCount = typeof mastered === "function"
        ? cards.filter(mastered).length
        : 0;

      const currentStreak = typeof streak === "function"
        ? streak()
        : 0;

      const weekId = getCurrentWeekId();
      const savedXp = store.get("wk2_xp", {
        weekId,
        xp: 0
      });

      return {
        masteredCount,
        currentStreak,
        weekId,
        weeklyXp: savedXp.weekId === weekId
          ? Math.max(0, Number(savedXp.xp) || 0)
          : 0
      };
    };

    const paint = () => {
      if (!box) return;

      box.innerHTML = user
        ? `<div class="acct-user">
            <a href="#account" class="user-link">
              ${user.photoURL
                ? `<img src="${esc(user.photoURL)}" class="acct-avatar" alt="">`
                : ""}
              <span>${esc(user.displayName || user.email?.split("@")[0] || "Cadet")}</span>
            </a>
            <button class="tg" id="so">Sign out</button>
          </div>`
        : '<button class="tg" id="si">Sign in with Google</button>';

      const si = document.getElementById("si");
      const so = document.getElementById("so");

      if (si) {
        si.onclick = () =>
          signInWithPopup(auth, new GoogleAuthProvider())
            .catch(err => {
              console.error("Sign-in error:", err);
              toast("Sign-in failed. Please try again.");
            });
      }

      if (so) {
        so.onclick = () =>
          signOut(auth).then(() => toast("Signed out."));
      }
    };

    // Private study progress stays in users/{uid}.
    const pushPrivateProgress = async () => {
      if (!user) return;

      const progress = getLocalProgress();

      await setDoc(doc(db, "users", user.uid), {
  srs: JSON.stringify(progress.srs),
  days: progress.days,
  tests: JSON.stringify(progress.tests),
  xp: progress.xp,
  updated: Date.now()
}, { merge: true });
    };

    // Only public profile information goes into publicProfiles/{uid}.
    const pushPublicProfile = async () => {
      if (!user) return;

      const metrics = getMetrics();

      await setDoc(doc(db, "publicProfiles", user.uid), {
        displayName: user.displayName || user.email?.split("@")[0] || "Cadet",
        photoURL: user.photoURL || "",
        mastered: metrics.masteredCount,
        streak: metrics.currentStreak,
        weekly: {
          weekId: metrics.weekId,
          xp: metrics.weeklyXp
        },
        updated: Date.now()
      }, { merge: true });
    };

    async function sync() {
      if (!user) return false;

      if (busy) {
        again = true;
        return false;
      }

      busy = true;
      let ok = false;

      try {
        const privateRef = doc(db, "users", user.uid);
        const snap = await getDoc(privateRef);

        if (snap.exists()) {
          const data = snap.data();

          if (typeof mergeProgress === "function") {
            const changed = mergeProgress({
  srs: JSON.parse(data.srs || "{}"),
  days: data.days || [],
  tests: JSON.parse(data.tests || "[]"),
  xp: data.xp || null
});

            if (changed && typeof render === "function") {
              render();
            }
          }
        }

        await pushPrivateProgress();
        await pushPublicProfile();

        ok = true;
      } catch (err) {
        console.error("Sync failed:", err);
      } finally {
        busy = false;

        if (again) {
          again = false;
          sync();
        }
      }

      return ok;
    }

    window.updateUserProfile = async (newName, newPhoto) => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast("No active user session");
        return false;
      }

      try {
        await updateProfile(currentUser, {
          displayName: newName,
          photoURL: newPhoto || null
        });

        user = auth.currentUser;

        await pushPublicProfile();
        paint();

        toast("Profile updated!");
        return true;
      } catch (err) {
        console.error("Profile update failed:", err);
        toast("Could not update profile. Please try again.");
        return false;
      }
    };

    // Fetch only profiles belonging to the current week.
    window.fetchWeeklyLeaderboard = async () => {
      const weekId = getCurrentWeekId();

      const q = query(
        collection(db, "publicProfiles"),
        where("weekly.weekId", "==", weekId),
        orderBy("weekly.xp", "desc"),
        limit(25)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          name: data.displayName || "Anonymous Cadet",
          photo: data.photoURL || "",
          xpWeekly: Number(data.weekly?.xp) || 0,
          mastered: Number(data.mastered) || 0,
          streak: Number(data.streak) || 0
        };
      });
    };

    // Public profile lookup, never private study progress.
    window.fetchUserProfile = async userId => {
      const snap = await getDoc(
        doc(db, "publicProfiles", userId)
      );

      return snap.exists() ? snap.data() : null;
    };

    window.getUser = () => auth.currentUser;

    window.queueSync = () => {
      if (!user) return;

      clearTimeout(timer);
      timer = setTimeout(sync, 1500);
    };

    onAuthStateChanged(auth, async currentUser => {
      user = currentUser;
      paint();

      if (user) {
        const ok = await sync();

        if (ok) toast("Progress synced");
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && user) sync();
    });

    paint();

  } catch (err) {
    console.error("Firebase failed to load:", err);
  }
})();
