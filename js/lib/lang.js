const LANG = {
	node: [],
	path: '/js/lib/lang/',
	lang: 'pt_BR',

	load: (lang, cb) => {
		LANG.lang = lang || LANG.lang
		GATE.get(LANG.path + LANG.lang + '.json', (e, d) => {
			if (e !== false) return cb(false)
			var data = JSON.parse(d) || false
			if (data == false) return cb(false)

			data.forEach(a => (LANG.node[a.node] = a.text))
			return cb(true)
		})
	},
	get: (node, id) => LANG.node[node][id] || ''
}
