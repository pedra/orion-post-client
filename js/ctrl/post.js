/**
 * POST Namespace
 */

const Post = {
	controller: 'Post.Article',
	thumb: 'http://localhost:3200/u/',
	index: {
		list: '#pst-list',
		username: '#pst-new-name',
		userlink: '#pst-new-link'
	},
	editor: {
		head: '#pst-edt-head',
		link: '#pst-edt-link',
		content: '#pst-edt-content'
	},

	init: () => {
		window.onresize = Post.resize
	},
	show: () => {
		_(Post.index.username).innerHTML = GATE.name
		_(Post.index.userlink).innerHTML = '@' + GATE.link
		SHOW.page('post')
		GATE.gate(Post.controller, 'Index', {}, (e, d) => {
			if (e || !d.data.data) return (_(Post.index.list).innerHTML = LANG.get('POST', 1))

			var formate = (v, t) => {
				v = v.toString().replace(/<[^>]*>/g, '')
				return v.substr(0, t) + (v.length > t ? '...' : '')
			}
			var h = ''
			d.data.data.map(a => {
				var content = formate(a.content, 222)
				content =
					content == ''
						? ''
						: `<div class="pst-list-content" onclick="Post.showPost(${a.id})">${content}</div>`
				var head = formate(a.head, 222)
				var avt = Post.thumb + a.person + '.jpg'

				var media = resolveLink(a.media)
				media =
					media == ''
						? ''
						: `<div class="pst-list-media"><iframe  onload="this.classList.add('on')" id="pst-edt-ytplayer" width="100%" height="100%" type="text/html" src="https://www.youtube.com/embed/${media}?autoplay=0&modestbranding=1&color=white" frameborder="0" allowfullscreen></iframe></div>`

				h += `<div class="pst-list" id="pst-list-${a.id}">
				<div class="pst-list-header">
					<div class="pst-list-header-avatar" onclick="Person.profile(${a.person})">
						<img src="${avt}">
					</div>
					<div class="pst-list-header-info" onclick="Person.profile(${a.person})">
						<h2>${a.name}</h2> 
						<div>
							<time datetime="${a.published}">${Util.data(new Date(a.published))}</time>
							<span>@${a.link}</span>
						</div>
					</div>
					<div class="pst-list-header-link" onclick="Post.showLink(${a.id})">
        				<i class="material-icons">link</i>
    				</div>
				</div>
				<div class="pst-list-head">${head}</div>
					${media}${content}					
					<div class="pst-list-status">
    					<div><i class="material-icons">visibility</i><span>123</span></div>
						<div><i class="material-icons">thumb_up</i><span>123</span></div>
						<div><i class="material-icons">thumb_down</i><span>13</span></div>
						<div>Expandir<i class="material-icons">file_download</i></div>
					</div>
					</div>
				</div>`
			})
			_(Post.index.list).innerHTML = h
			Post.resize()
		})
	},

	// Modifica o tamenho do player conforme o tamanho da tela
	resize: () => {
		var c = _('#pg-post .container')
		c = parseInt(c.offsetWidth / 1.99) + 'px'
		var m = _a('.pst-list-media')
		m.forEach(a => (a.style.height = c))
	},

	showEditor: () => SHOW.page('editor'),
	save: () => {
		var id = 0
		var head = _(Post.editor.head).innerHTML.trim()
		var media = _(Post.editor.link).value.trim()
		var link = [{link: media, type: 'youtube', title: 'link do Youtube'}]
		var content = _(Post.editor.content).innerHTML.trim()

		TMP1 = {id, head, link, content}
		console.log('POST', TMP1)

		// return false

		GATE.gate(Post.controller, 'Save', {id, head, link, content}, (e, d) => {
			console.log('Post: ', e, d)
		})
	}
}
