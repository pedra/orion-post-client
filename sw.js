const VERSION="1587477321061-dev";
// CACHE ----------------------------------------------------------------------------
const FILES = [
	'/',

	// Fonts
	'/fonts/material/MaterialIcons-Regular.woff2',
	'/fonts/roboto/roboto-v18-latin-100.woff',
	'/fonts/roboto/roboto-v18-latin-300.woff',
	'/fonts/roboto/roboto-v18-latin-regular.woff',
	'/fonts/roboto/roboto-v18-latin-700.woff',

	// Opcional manifest files ------
	'/icon/site.json',
	'/icon/favicon.ico',
	'/favicon.ico',
	'/icon/favicon-16x16.png',
	'/icon/favicon-32x32.png',
	'/icon/android-chrome-192x192.png',
	'/icon/android-chrome-512x512.png',
	'/icon/apple-touch-icon.png',
	'/icon/safari-pinned-tab.svg',

	// Imagens
	'/img/logo.png',
	'/img/i16.png',
	'/img/i32.png',
	'/img/i192.png',

	// Lang
	'/js/lib/lang/pt_BR.json',
	'/js/lib/lang/en.json',
	'/js/lib/lang/es.json',

	'/css/theme.css',
	'/css/style.css',

	'/js/lib/function.js',
	'/js/lib/util.js',
	'/js/lib/lang.js',
	'/js/lib/show.js',

	'/js/vendor/aes.js',
	'/js/vendor/rsa.js',
	'/js/lib/gate.js',

	'/js/ctrl/home.js',
	'/js/ctrl/auth.js',
	'/js/ctrl/post.js',
	'/js/main.js'
]

const CACHE = 'APP_' + VERSION
const OFFLINE = 'OFFLINE_' + VERSION
const DATAFILE = '/config'

// INSTALL  -------------------------------------------------------------------------
self.addEventListener('install', e => {
	e.waitUntil(
		caches
			.open(CACHE)
			.then(cache => {
				// console.log('[SWORKER caching "' + CACHE + '"]')
				cache.addAll(FILES)
			})
			.then(() => self.skipWaiting())
	)
})

// ACTIVATE -------------------------------------------------------------------------
self.addEventListener('activate', e => {
	e.waitUntil(
		caches.keys().then(async ks => {
			for (const k of ks) {
				if (k !== CACHE) {
					// console.log('[SWORKER removing "' + k + '" cache]')
					await caches.delete(k)
				}
			}
			self.clients.claim()
		})
	)
})

// FETCH   --------------------------------------------------------------------------
self.addEventListener('fetch', event => {
	const {
		request,
		request: {url, method}
	} = event

	// Saves || loads json data to Cache Storage (fake file)
	if (url.match(DATAFILE)) {
		if (method === 'POST') {
			request
				.json()
				.then(body => caches.open(CACHE).then(cache => cache.put(DATAFILE, new Response(JSON.stringify(body)))))
			return event.respondWith(new Response('{}'))
		} else {
			return event.respondWith(caches.match(DATAFILE).then(response => response || new Response('{}')))
		}
	} else {
		// Get & save request in Cache Storage
		if (method !== 'POST') {
			event.respondWith(
				caches.open(CACHE).then(cache =>
					cache.match(event.request).then(
						response =>
							response ||
							fetch(event.request).then(response => {
								// Saves the requested file to CACHE (uncomment next line)
								// cache.put(event.request, response.clone())
								return response
							})
					)
				)
			)
		} else return
	}
})
