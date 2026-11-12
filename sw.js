const CACHE="briefing-room-v1";
const CORE=["./","index.html","style.css","app.js","data.js","songs.js","sync.js","firebase-config.js","manifest.webmanifest","icon-192.png","afsc.txt"];

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
