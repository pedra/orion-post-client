/*
    # SHOW

    ## Build

    Add this HTML in your index.html

    <div class="w5_toast" id="w5_toast"></div>
    <div class="w5_glass" id="w5_glass"><ul><li><div></div><span>Aguarde ...</span></li></ul></div>

    And show.css stylesheet file in this directory


    ## Usage

    SHOW.msg("text to toast", "info", 2000)

    * text  => an text string to report
    * type  => arguments: alert (default), info and warn
    * tempo => timeout to visible in miliseconds (default calc a text lenth value)

    SHOW.glass(text | true | false)

    Arguments options:

    * text  => close the "glass" and print the "text" string
    * true  => close the "glass"
    * false => open "glass" window

*/

const SHOW = {
	msg: (node, id, type, tempo) => {
		var text = LANG.get(node, id)
		tempo = tempo || 2000 + text.length * 40
		type = (type || 'alert').toLowerCase()

		//Criando o toast, eu mesmo...
		var id = Util.tokey() + Util.rpass(2)
		var toast = document.createElement('DIV')
		toast.className = type
		toast.id = id
		toast.innerHTML = text
		toast.onclick = function (e) {
			var x = e.target.nodeName == 'I' ? e.target.parentElement : e.target
			x.classList.remove('active')
			setTimeout(function () {
				x.remove()
			}, 400)
		}
		_('.w5_toast').appendChild(toast)

		setTimeout(function () {
			_('#' + id).classList.add('active')
			setTimeout(function () {
				var e = _('#' + id)
				if (e) {
					e.classList.remove('active')
					setTimeout(function () {
						e.remove()
					}, 400)
				}
			}, tempo)
		}, 500)
	},

	glass: text => {
		_('#w5_glass span').innerHTML = 'string' == typeof text ? text : ''
		_('#w5_glass span').style.display = 'string' == typeof text ? 'flex' : 'none'
		_('#w5_glass').style.display = text === false ? 'none' : 'flex'
	},

	page: page => {
		_a('.page:not(#pg-' + page + ')').forEach(a => a.classList.remove('on'))
		_('#pg-' + page).classList.add('on')
	}
}
