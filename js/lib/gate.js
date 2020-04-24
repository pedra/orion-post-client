/* GATEWAY
   ----------------------------------------------------------------------------
 * Gate static object
 * 
 * Usage:
 * 
 * First, start the GATE static object
 * 		GATE.init(Page.Home, Page.Login, null, null, null, null, report, glass)
 * 
 * If successful, call the home page (external function "homePage"). 
 * Otherwise, it calls the LOGIN page.
 * 
 * 		GATE.login('your login', 'your password') -> 
 * 		GATE.logout() -> to clear access data (logout)
 * 
 * Simple GET/POST method using fetch.
 * "Callback" receives the error and the resulting data [callback (error, data)].
 * 
 * 		GATE.get(url, callback)
 * 		GATE.post(url, data, callback)
 * 
 */
const GATE = {
	// Application
	app_id: 'Orion-sample',
	app_version: '0.0.1',

	// Server api url
	keyUrl: '/key',
	loginUrl: '/login',
	gateUrl: '/gate',

	// Check token settings
	controller: 'Gate',
	chkTokenAction: 'CheckToken',
	logoutAction: 'Logout',

	// Persistence settings
	configUrl: '/config',
	id: 0,
	name: '',
	link: '',
	rsa: '',
	token: '',
	ukey: '',

	// Subscribe array data
	subData: {
		initError: [],
		initTokenError: [],
		initTokenValid: [],

		// Login
		loginKeyError: [],
		loginPublicError: [],
		loginBeforeSend: [],
		loginAfterSend: [],
		loginError: [],
		loginSuccess: [],
		reset: [],

		// Gate
		gateBeforeSend: [],
		gateAfterSend: [],
		gateError: [],
		gateSuccess: []
	},
	subscribe: (index, name, action) => GATE.subData[index].push({name: name, action: action}),
	unsubscribe: (index, action) =>
		GATE.subData[index].map((a, b) => (a.name == action ? GATE.subData[index][b].pop() : null)),
	action: index => GATE.subData[index].map(a => a.action()),

	init: (configUrl, keyUrl, loginUrl, gateUrl) => {
		GATE.configUrl = configUrl || '/config'
		GATE.keyUrl = keyUrl || '/key'
		GATE.loginUrl = loginUrl || '/login'
		GATE.gateUrl = gateUrl || '/gate'

		// Carregando configuração do Cache Storage
		GATE.load((e, data) => {
			if (e !== false && 'undefined' == typeof data['id']) {
				GATE.ukey = Util.rpass() // Gerando a chave local para AES
				return GATE.action('initError')
			}

			GATE.id = data.id
			GATE.ukey = data.ukey
			GATE.token = data.token

			// Verifica se o TOKEN ainda é válido
			GATE.gate(GATE.controller, GATE.chkTokenAction, {}, e =>
				e ? GATE.action('initTokenError') : GATE.action('initTokenValid')
			)
		})
	},

	social: target => null, // social networks login (to do)
	login: (login, passwd) => GATE.getPublicKey(rsa => GATE.log(login, passwd)),
	log: (login, passwd) => {
		// Check ...
		if (GATE.rsa == '') return GATE.action('loginPublicError')
		if (GATE.ukey == '') return GATE.action('loginKeyError')

		var data = {
			app: GATE.app_id,
			version: GATE.app_version,

			login: login,
			passw: passwd,

			ukey: GATE.ukey,
			geo: GATE.geo
		}

		// Criptografando rsa
		data = RSA.encrypt(JSON.stringify(data), RSA.getPublicKey(GATE.rsa))

		// close the glass
		GATE.action('loginBeforeSend')

		// Enviando os dados ...
		GATE.post(GATE.loginUrl, data, (e, res) => {
			GATE.action('loginAfterSend') // open the glass

			if (e) return GATE.action('loginError')

			// Checando a sincronização com o servidor (criptografia ok)
			GATE.sync(res, (e, data) => {
				if (e) return GATE.action('loginError')
				return GATE.action('loginSuccess')
			})
		})
	},

	logout: () => GATE.gate(GATE.controller, GATE.logoutAction, {id: GATE.id}, () => GATE.reset()),

	// Clear local data (logout)
	reset: () => {
		GATE.rsa = ''
		GATE.id = 0
		GATE.ukey = rpass()
		GATE.token = false

		// Save (clear config file)
		GATE.save(() => {
			GATE.action('reset')
		})
	},

	// Obtém a chave pública do servidor
	getPublicKey: cb =>
		GATE.get(GATE.keyUrl, (e, key) => {
			var error = () => {
				GATE.rsa = ''
				return cb ? cb(true) : null
			}
			if (e) return error()

			var pk = key.replace(/\s|\n|\r|\n\r/g)
			if (pk.length < 50) return error()

			GATE.rsa = pk
			return cb ? cb(GATE.rsa) : null
		}),

	// Gateway to server api
	gate: (controller, action, param, cb) => {
		// Formatting ...
		var dt = {
			error: false,
			app: GATE.app_id,
			version: GATE.app_version,

			id: GATE.id,
			ukey: GATE.ukey,
			token: GATE.token,

			controller: controller,
			action: action,
			param: param
		}

		// Encrypting with AES ...
		var encData = AES.encrypt(JSON.stringify(dt), GATE.ukey)
		encData = GATE.token + encData

		// close the glass
		GATE.action('gateBeforeSend')

		GATE.post(GATE.gateUrl, encData, (e, res) => {
			GATE.action('gateAfterSend') // open the glass

			if (e) {
				GATE.action('gateError')
				return cb(true, res)
			}

			// Checking the synchronization with the server (encryption = ok)
			GATE.sync(res, cb)
		})
	},

	// Checking the synchronization ...
	sync: (res, cb) => {
		TMP = res
		try {
			var res = JSON.parse(TMP)
		} catch (e) {}
		// Old: .replace(/\\u002B/g, '+')
		// OBS: para o netcore que manda aspas indesejadas e codificação em UTF-8 :P
		//res = res.replace(/"/g, '').replace(/\\u([\d\w]{4})/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
		TMP1 = res
		console.log('GATE:', res)

		if ('undefined' != typeof res['error']) {
			GATE.reset()
			return cb(true, res.data)
		}

		var data = false

		// Decrypting ...
		try {
			var dec = AES.decrypt(res, GATE.ukey)
			console.log('GATE1:', dec)
			data = JSON.parse(dec)

			console.log('GATE2:', data)

			if (data.id) GATE.id = data.id
			if (data.name) GATE.name = data.name
			if (data.link) GATE.link = data.link
			if (data.ukey) GATE.ukey = data.ukey
			if (data.token) GATE.token = data.token

			// Save in Cache Storage
			GATE.save(e => cb(e !== false ? true : false, data))
		} catch (e) {
			console.log('GATE3:', e)
			GATE.reset()
			return cb(true, e)
		}
	},

	// Save configurations in fakefile
	save: cb => GATE.post(GATE.configUrl, JSON.stringify({id: GATE.id, token: GATE.token, ukey: GATE.ukey}), cb),

	// Load configurations from fakefile
	load: cb =>
		GATE.get(GATE.configUrl, (e, d) => {
			if (e !== false) cb(true, {})
			var data = {}
			try {
				data = JSON.parse(d)
			} catch (x) {}
			return cb(e, data)
		}),

	// Send a HTTP GET
	get: (url, cb) => {
		fetch(url, {
			method: 'GET',
			headers: {
				Accept: '*/*',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		})
			.then(response => response.text())
			.then(res => cb(false, res))
			.catch(error => cb(true, error))
	},

	// Send a HTTP POST
	post: (url, data, cb) => {
		fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				Pragma: 'no-cache',
				'Cache-Control': 'no-cache'
			},
			body: data
		})
			.then(response => response.text())
			.then(res => cb(false, res))
			.catch(error => cb(true, error))
	}
}
