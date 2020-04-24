const Util = {
	counter: 0,
	pool: '8u7zoicjgyaFrfb5VQG0OwNJTWAqknZItsER6S42pmxKL9CUlYHDdhB1M3veXP',

	/* Usage: 
		<input id="input">
		_('#input').oninput = Util.debounce( e => console.log(e, e.target.value), 500 )
	*/
	debounce: (fn, wait = 1000, time = null) => (...args) =>
		clearTimeout(time, (time = setTimeout(() => fn(...args), wait))),

	// Generate a token base 36 from datetime || unkey: decode base 36 string to integer
	tokey: n => ('number' == typeof n ? n : new Date().getTime()).toString(36),
	unkey: t => ('string' == typeof t ? parseInt(t, 36) : false),

	// Convert Real(currency) to float || ftor: float to Real
	rtof: v => parseFloat((v.trim() == '' ? (v = '0') : v).replace(/\.| /g, '').replace(/,/g, '.')),
	ftor: v => parseFloat(v).toLocaleString('pt-br', {minimumFractionDigits: 2}),

	// Generate a password
	rpass: chars => {
		var l = Util.pool.length - 1,
			r = '',
			c = parseInt(chars)
		c = isNaN(c) || c > 40 || c < 0 ? 20 : c
		for (var i = 0; i < c; i++) r += Util.pool[Math.floor(Math.random() * l) + 1]
		return r
	},

	// String to Html format text
	stoh: t =>
		t
			.replace(/([^\w]|\s|_|\-|)(\*([^/s]|.*?)\*)([^\w]|\s|_|\-|)/g, '$1<b>$3</b>$4')
			.replace(/([^\w]|\s|\*|\-|)(\_([^/s]|.*?)\_)([^\w]|\s|\*|\-|)/g, '$1<i>$3</i>$4')
			.replace(/([^\w]|\s|\*|_|)(\-([^/s]|.*?)\-)([^\w]|\s|\*|_|)/g, '$1<s>$3</s>$4'),

	// Formatação simples de datatime -> 20/05 10:33
	data: d =>
		d.getDate() + '/' + _dez(parseInt(d.getMonth()) + 1) + ' ' + _dez(d.getHours()) + ':' + _dez(d.getMinutes())
}
