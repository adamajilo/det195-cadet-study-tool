const CACHE="briefing-room-v2";
const CORE=["./","index.html","css/style.css","js/app.js","data/data.js","data/songs.js","js/sync.js","js/board.js","js/board-sync.js","js/live.js","js/live-sync.js","js/extras.js","js/extras-sync.js","js/firebase-config.js","manifest.webmanifest","icon-192.png","data/afsc.txt"];

self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  if(r.headers.has("range")||r.url.endsWith(".mp3"))return;
  if(new URL(r.url).origin!==location.origin)return;
  e.respondWith(
    fetch(r)
      .then(res=>{
        if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}
        return res;
      })
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("index.html")))
  );
});