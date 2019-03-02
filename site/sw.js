var CACHE_VERSION = 21;

// Shorthand identifier mapped to specific versioned cache.
var CURRENT_CACHES = {
  assets: 'asset-cache-v' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
    event.waitUntil(
	caches.open(CURRENT_CACHES['assets']).then(
	    function(cache) {
		return cache.addAll([
		    '/',
		    '/index.html',
		    '/style.css',
		    'https://unpkg.com/redux@4.0.1/dist/redux.min.js',
		    '/reducers.js',
		    '/actions.js',
		    '/index.js',
		    '/parser.js'
		]);
	    }));
});

self.addEventListener('activate', function(event) {
    var expectedCacheNames = Object.values(CURRENT_CACHES);

    // Active worker won't be treated as activated until promise
    // resolves successfully.
    event.waitUntil(
	caches.keys().then(
	    function(cacheNames) {
		return Promise.all(
		    cacheNames.map(
			function(cacheName) {
			    if (!expectedCacheNames.includes(cacheName)) {
				console.log('Deleting out of date cache:', cacheName);
            
				return caches.delete(cacheName);
			    } else {
				return undefined;
			    }
			}));
	    }));
});

self.addEventListener('fetch', function(event) {
  console.log('Handling fetch event for', event.request.url);

  event.respondWith(
    
    // Opens Cache objects that start with 'font'.
    caches.open(CURRENT_CACHES['assets']).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (response) {
          console.log('Found response in cache:', response);

	  console.log('Fetching request from the network for cache update');

	  fetch(event.request).then(function(networkResponse) {
	    cache.put(event.request, networkResponse.clone());
	    return;
	  });
	    
          return response;
        }

        console.log('Fetching request from the network');

        return fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());

          return networkResponse;
        });
      }).catch(function(error) {
        
        // Handles exceptions that arise from match() or fetch().
        console.error('Error in fetch handler:', error);

        throw error;
      });
    })
  );
});
