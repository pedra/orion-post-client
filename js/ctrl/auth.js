/**
 * Authentication Controller
 */

const AUTH = {
	iForm: '#log-form',
	iName: '#log-name',
	iEmail: '#log-email',
	iLogin: '#log-email',
	iPassw: '#log-passw',

	// Inicialização do formulário de autenticação (login)
	init: () => {
		_(AUTH.iForm).onsubmit = e => {
			e.preventDefault()
			return AUTH.login()
		}

		//Zerando o formulário
		setTimeout(() => {
			_(AUTH.iLogin).value = ''
			_(AUTH.iPassw).value = ''
		}, 500)

		// Subscribe action to GATE
		GATE.subscribe('loginPublicError', 'report', () => SHOW.msg('auth', 1))
		GATE.subscribe('loginKeyError', 'report', () => SHOW.msg('auth', 3))
		GATE.subscribe('loginBeforeSend', 'glass', () => SHOW.glass(true))
		GATE.subscribe('loginAfterSend', 'glass', () => SHOW.glass(false))
		GATE.subscribe('loginError', 'report', () => SHOW.msg('auth', 4))
		GATE.subscribe('loginSuccess', 'report', () => SHOW.msg('auth', 5, 'info'))
		GATE.subscribe('loginSuccess', 'page', () => Post.show())
	},

	show: () => SHOW.page('login'),

	login: () => {
		var login, passw
		try {
			login = _(AUTH.iLogin).value.trim()
			passw = _(AUTH.iPassw).value.trim()

			if (login == '' || passw == '') throw 0
		} catch (e) {
			return SHOW.msg('auth', 0)
		}
		return GATE.login(login, passw)
	},
	registry: () => {},
	resetPassw: () => {},
	sendEmail: () => {}
}
