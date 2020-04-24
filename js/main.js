/**
 * Main Controller
 *
 */

let TMP, TMP1, TMP2, TMP3, TMP4
window.onload = () => {
	// install Service Worker
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register(location.origin + '/sw.js', {
			scope: '/'
		})
	} else {
		alert(
			'Your browser does not support this application. Update your browser or install a more modern one like Chrome or Firefox.'
		)
	}

	LANG.load('pt_BR', () => {
		AUTH.init()
		Post.init()

		GATE.subscribe('initError', 'login', () => SHOW.page('login')) // Subscribe action to GATE
		GATE.subscribe('initTokenError', 'login', () => SHOW.page('login'))
		GATE.subscribe('initTokenValid', 'home', () => Post.show())

		GATE.subscribe('reset', 'report', () => SHOW.msg('gate', 0, 'info'))
		GATE.subscribe('reset', 'page', () => SHOW.page('login'))

		GATE.subscribe('gateBeforeSend', 'glass', () => SHOW.glass(true))
		GATE.subscribe('gateAfterSend', 'glass', () => SHOW.glass(false))
		GATE.subscribe('gateError', 'report', () => SHOW.msg('gate', 1))

		//GATE.init('/config', 'https://e-wallet.tk/key', 'https://e-wallet.tk/login','https://e-wallet.tk/gate')
		//GATE.init('/config', 'http://localhost:81/key', 'http://localhost:81/login', 'http://localhost:81/gate')
		GATE.init('/config', 'http://localhost:3200/key', 'http://localhost:3200/login', 'http://localhost:3200/gate')
	})

	SHOW.glass(false) // Abrindo a "janela"

	_('#pst-edt-link').onfocus = e => (e.target.value = '')
	_('#pst-edt-link').onchange = e => resetPlayer(e.target.value.trim())

	_('#pst-edt-head').onfocus = e => placeFocus(e)
	_('#pst-edt-head').onblur = e => placeBlur(e)
	placeContent(_('#pst-edt-head'))

	_('#pst-edt-content').onfocus = e => placeFocus(e)
	_('#pst-edt-content').onblur = e => placeBlur(e)
	placeContent(_('#pst-edt-content'))
}
const playerLabelFocus = e => (e.innerHTML == e.title ? (e.innerHTML = '') : null)
const playerLabelBlur = e => (e.innerHTML == '' ? (e.innerHTML = e.title) : null)

const placeContent = e => (e.innerHTML = e.title)
const placeBlur = e => (e.target.innerHTML == '' ? (e.target.innerHTML = e.target.title) : null)
const placeFocus = e => (e.target.innerHTML == e.target.title ? (e.target.innerHTML = '') : null)

const resolveLink = l => {
	var r = /https:\/\/youtu\.be\/(.*)|https:\/\/www\.youtube\.com\/watch\?v\=(.*)/
	if (l.replace(r, '') != '') return ''
	return l.replace(r, '$1$2')
}

const resetPlayer = l => {
	l = resolveLink(l)
	console.log('Link: ', l)
	var p = _('#pst-edt-player')
	if (l == '') {
		p.innerHTML = ''
		p.classList.remove('on')
		_('#pst-edt-link-insert').classList.add('on')
	} else {
		_('#pst-edt-link-insert').classList.remove('on')
		p.innerHTML = `<iframe id="pst-edt-ytplayer" width="100%" height="100%" type="text/html" src="https://www.youtube.com/embed/${l}?autoplay=0&modestbranding=1&color=white" frameborder="0" allowfullscreen></iframe>
			<div class="player-title"><div class="pst-edt-player-title" title="Legenda do vídeo (opcional)" contenteditable="true" onfocus="playerLabelFocus(this)" onblur="playerLabelBlur(this)">Legenda do vídeo (opcional)</div><i class="material-icons" onclick="resetPlayer('')">close</i></div>`
		p.classList.add('on')
	}
}
