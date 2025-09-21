const STATIC_CACHE = 'imgmagic-v3';
const ASSET_PATHS = [
  '/', '/offline.html', '/assets/css/styles.css', '/assets/js/pwa.js'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      await Promise.all(ASSET_PATHS.map(p => cache.add(p).catch(()=>null)));
      // Best-effort pre-cache local heavy assets if present
      const optionals = [
        '/assets/vendors/opencv/opencv.js',
        '/assets/models/rmbg/model.onnx'
      ];
      await Promise.all(optionals.map(p => cache.add(p).catch(()=>null)));
    })
  );
});

function isLocalHeavyAsset(url){
  return url.origin === location.origin && (url.pathname.startsWith('/assets/vendors/') || url.pathname.startsWith('/assets/models/'));
}

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if(isLocalHeavyAsset(url)){
    // cache-first for vendors/models
    e.respondWith(
      caches.match(e.request).then(cached=>{
        if(cached) return cached;
        return fetch(e.request).then(res=>{
          const copy = res.clone(); caches.open(STATIC_CACHE).then(c=> c.put(e.request, copy));
          return res;
        }).catch(()=> caches.match('/offline.html'));
      })
    );
    return;
  }
  // network-first for everything else
  e.respondWith(
    fetch(e.request).catch(()=> caches.match(e.request).then(r=> r || caches.match('/offline.html')))
  );
});
