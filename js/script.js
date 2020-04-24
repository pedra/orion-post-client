/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS =
	CryptoJS ||
	(function(u, p) {
		var d = {},
			l = (d.lib = {}),
			s = function() {},
			t = (l.Base = {
				extend: function(a) {
					s.prototype = this
					var c = new s()
					a && c.mixIn(a)
					c.hasOwnProperty('init') ||
						(c.init = function() {
							c.$super.init.apply(this, arguments)
						})
					c.init.prototype = c
					c.$super = this
					return c
				},
				create: function() {
					var a = this.extend()
					a.init.apply(a, arguments)
					return a
				},
				init: function() {},
				mixIn: function(a) {
					for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c])
					a.hasOwnProperty('toString') && (this.toString = a.toString)
				},
				clone: function() {
					return this.init.prototype.extend(this)
				}
			}),
			r = (l.WordArray = t.extend({
				init: function(a, c) {
					a = this.words = a || []
					this.sigBytes = c != p ? c : 4 * a.length
				},
				toString: function(a) {
					return (a || v).stringify(this)
				},
				concat: function(a) {
					var c = this.words,
						e = a.words,
						j = this.sigBytes
					a = a.sigBytes
					this.clamp()
					if (j % 4)
						for (var k = 0; k < a; k++)
							c[(j + k) >>> 2] |= ((e[k >>> 2] >>> (24 - 8 * (k % 4))) & 255) << (24 - 8 * ((j + k) % 4))
					else if (65535 < e.length) for (k = 0; k < a; k += 4) c[(j + k) >>> 2] = e[k >>> 2]
					else c.push.apply(c, e)
					this.sigBytes += a
					return this
				},
				clamp: function() {
					var a = this.words,
						c = this.sigBytes
					a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4))
					a.length = u.ceil(c / 4)
				},
				clone: function() {
					var a = t.clone.call(this)
					a.words = this.words.slice(0)
					return a
				},
				random: function(a) {
					for (var c = [], e = 0; e < a; e += 4) c.push((4294967296 * u.random()) | 0)
					return new r.init(c, a)
				}
			})),
			w = (d.enc = {}),
			v = (w.Hex = {
				stringify: function(a) {
					var c = a.words
					a = a.sigBytes
					for (var e = [], j = 0; j < a; j++) {
						var k = (c[j >>> 2] >>> (24 - 8 * (j % 4))) & 255
						e.push((k >>> 4).toString(16))
						e.push((k & 15).toString(16))
					}
					return e.join('')
				},
				parse: function(a) {
					for (var c = a.length, e = [], j = 0; j < c; j += 2)
						e[j >>> 3] |= parseInt(a.substr(j, 2), 16) << (24 - 4 * (j % 8))
					return new r.init(e, c / 2)
				}
			}),
			b = (w.Latin1 = {
				stringify: function(a) {
					var c = a.words
					a = a.sigBytes
					for (var e = [], j = 0; j < a; j++)
						e.push(String.fromCharCode((c[j >>> 2] >>> (24 - 8 * (j % 4))) & 255))
					return e.join('')
				},
				parse: function(a) {
					for (var c = a.length, e = [], j = 0; j < c; j++)
						e[j >>> 2] |= (a.charCodeAt(j) & 255) << (24 - 8 * (j % 4))
					return new r.init(e, c)
				}
			}),
			x = (w.Utf8 = {
				stringify: function(a) {
					try {
						return decodeURIComponent(escape(b.stringify(a)))
					} catch (c) {
						throw Error('Malformed UTF-8 data')
					}
				},
				parse: function(a) {
					return b.parse(unescape(encodeURIComponent(a)))
				}
			}),
			q = (l.BufferedBlockAlgorithm = t.extend({
				reset: function() {
					this._data = new r.init()
					this._nDataBytes = 0
				},
				_append: function(a) {
					'string' == typeof a && (a = x.parse(a))
					this._data.concat(a)
					this._nDataBytes += a.sigBytes
				},
				_process: function(a) {
					var c = this._data,
						e = c.words,
						j = c.sigBytes,
						k = this.blockSize,
						b = j / (4 * k),
						b = a ? u.ceil(b) : u.max((b | 0) - this._minBufferSize, 0)
					a = b * k
					j = u.min(4 * a, j)
					if (a) {
						for (var q = 0; q < a; q += k) this._doProcessBlock(e, q)
						q = e.splice(0, a)
						c.sigBytes -= j
					}
					return new r.init(q, j)
				},
				clone: function() {
					var a = t.clone.call(this)
					a._data = this._data.clone()
					return a
				},
				_minBufferSize: 0
			}))
		l.Hasher = q.extend({
			cfg: t.extend(),
			init: function(a) {
				this.cfg = this.cfg.extend(a)
				this.reset()
			},
			reset: function() {
				q.reset.call(this)
				this._doReset()
			},
			update: function(a) {
				this._append(a)
				this._process()
				return this
			},
			finalize: function(a) {
				a && this._append(a)
				return this._doFinalize()
			},
			blockSize: 16,
			_createHelper: function(a) {
				return function(b, e) {
					return new a.init(e).finalize(b)
				}
			},
			_createHmacHelper: function(a) {
				return function(b, e) {
					return new n.HMAC.init(a, e).finalize(b)
				}
			}
		})
		var n = (d.algo = {})
		return d
	})(Math)
;(function() {
	var u = CryptoJS,
		p = u.lib.WordArray
	u.enc.Base64 = {
		stringify: function(d) {
			var l = d.words,
				p = d.sigBytes,
				t = this._map
			d.clamp()
			d = []
			for (var r = 0; r < p; r += 3)
				for (
					var w =
							(((l[r >>> 2] >>> (24 - 8 * (r % 4))) & 255) << 16) |
							(((l[(r + 1) >>> 2] >>> (24 - 8 * ((r + 1) % 4))) & 255) << 8) |
							((l[(r + 2) >>> 2] >>> (24 - 8 * ((r + 2) % 4))) & 255),
						v = 0;
					4 > v && r + 0.75 * v < p;
					v++
				)
					d.push(t.charAt((w >>> (6 * (3 - v))) & 63))
			if ((l = t.charAt(64))) for (; d.length % 4; ) d.push(l)
			return d.join('')
		},
		parse: function(d) {
			var l = d.length,
				s = this._map,
				t = s.charAt(64)
			t && ((t = d.indexOf(t)), -1 != t && (l = t))
			for (var t = [], r = 0, w = 0; w < l; w++)
				if (w % 4) {
					var v = s.indexOf(d.charAt(w - 1)) << (2 * (w % 4)),
						b = s.indexOf(d.charAt(w)) >>> (6 - 2 * (w % 4))
					t[r >>> 2] |= (v | b) << (24 - 8 * (r % 4))
					r++
				}
			return p.create(t, r)
		},
		_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	}
})()
;(function(u) {
	function p(b, n, a, c, e, j, k) {
		b = b + ((n & a) | (~n & c)) + e + k
		return ((b << j) | (b >>> (32 - j))) + n
	}
	function d(b, n, a, c, e, j, k) {
		b = b + ((n & c) | (a & ~c)) + e + k
		return ((b << j) | (b >>> (32 - j))) + n
	}
	function l(b, n, a, c, e, j, k) {
		b = b + (n ^ a ^ c) + e + k
		return ((b << j) | (b >>> (32 - j))) + n
	}
	function s(b, n, a, c, e, j, k) {
		b = b + (a ^ (n | ~c)) + e + k
		return ((b << j) | (b >>> (32 - j))) + n
	}
	for (var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b = [], x = 0; 64 > x; x++)
		b[x] = (4294967296 * u.abs(u.sin(x + 1))) | 0
	r = r.MD5 = v.extend({
		_doReset: function() {
			this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878])
		},
		_doProcessBlock: function(q, n) {
			for (var a = 0; 16 > a; a++) {
				var c = n + a,
					e = q[c]
				q[c] = (((e << 8) | (e >>> 24)) & 16711935) | (((e << 24) | (e >>> 8)) & 4278255360)
			}
			var a = this._hash.words,
				c = q[n + 0],
				e = q[n + 1],
				j = q[n + 2],
				k = q[n + 3],
				z = q[n + 4],
				r = q[n + 5],
				t = q[n + 6],
				w = q[n + 7],
				v = q[n + 8],
				A = q[n + 9],
				B = q[n + 10],
				C = q[n + 11],
				u = q[n + 12],
				D = q[n + 13],
				E = q[n + 14],
				x = q[n + 15],
				f = a[0],
				m = a[1],
				g = a[2],
				h = a[3],
				f = p(f, m, g, h, c, 7, b[0]),
				h = p(h, f, m, g, e, 12, b[1]),
				g = p(g, h, f, m, j, 17, b[2]),
				m = p(m, g, h, f, k, 22, b[3]),
				f = p(f, m, g, h, z, 7, b[4]),
				h = p(h, f, m, g, r, 12, b[5]),
				g = p(g, h, f, m, t, 17, b[6]),
				m = p(m, g, h, f, w, 22, b[7]),
				f = p(f, m, g, h, v, 7, b[8]),
				h = p(h, f, m, g, A, 12, b[9]),
				g = p(g, h, f, m, B, 17, b[10]),
				m = p(m, g, h, f, C, 22, b[11]),
				f = p(f, m, g, h, u, 7, b[12]),
				h = p(h, f, m, g, D, 12, b[13]),
				g = p(g, h, f, m, E, 17, b[14]),
				m = p(m, g, h, f, x, 22, b[15]),
				f = d(f, m, g, h, e, 5, b[16]),
				h = d(h, f, m, g, t, 9, b[17]),
				g = d(g, h, f, m, C, 14, b[18]),
				m = d(m, g, h, f, c, 20, b[19]),
				f = d(f, m, g, h, r, 5, b[20]),
				h = d(h, f, m, g, B, 9, b[21]),
				g = d(g, h, f, m, x, 14, b[22]),
				m = d(m, g, h, f, z, 20, b[23]),
				f = d(f, m, g, h, A, 5, b[24]),
				h = d(h, f, m, g, E, 9, b[25]),
				g = d(g, h, f, m, k, 14, b[26]),
				m = d(m, g, h, f, v, 20, b[27]),
				f = d(f, m, g, h, D, 5, b[28]),
				h = d(h, f, m, g, j, 9, b[29]),
				g = d(g, h, f, m, w, 14, b[30]),
				m = d(m, g, h, f, u, 20, b[31]),
				f = l(f, m, g, h, r, 4, b[32]),
				h = l(h, f, m, g, v, 11, b[33]),
				g = l(g, h, f, m, C, 16, b[34]),
				m = l(m, g, h, f, E, 23, b[35]),
				f = l(f, m, g, h, e, 4, b[36]),
				h = l(h, f, m, g, z, 11, b[37]),
				g = l(g, h, f, m, w, 16, b[38]),
				m = l(m, g, h, f, B, 23, b[39]),
				f = l(f, m, g, h, D, 4, b[40]),
				h = l(h, f, m, g, c, 11, b[41]),
				g = l(g, h, f, m, k, 16, b[42]),
				m = l(m, g, h, f, t, 23, b[43]),
				f = l(f, m, g, h, A, 4, b[44]),
				h = l(h, f, m, g, u, 11, b[45]),
				g = l(g, h, f, m, x, 16, b[46]),
				m = l(m, g, h, f, j, 23, b[47]),
				f = s(f, m, g, h, c, 6, b[48]),
				h = s(h, f, m, g, w, 10, b[49]),
				g = s(g, h, f, m, E, 15, b[50]),
				m = s(m, g, h, f, r, 21, b[51]),
				f = s(f, m, g, h, u, 6, b[52]),
				h = s(h, f, m, g, k, 10, b[53]),
				g = s(g, h, f, m, B, 15, b[54]),
				m = s(m, g, h, f, e, 21, b[55]),
				f = s(f, m, g, h, v, 6, b[56]),
				h = s(h, f, m, g, x, 10, b[57]),
				g = s(g, h, f, m, t, 15, b[58]),
				m = s(m, g, h, f, D, 21, b[59]),
				f = s(f, m, g, h, z, 6, b[60]),
				h = s(h, f, m, g, C, 10, b[61]),
				g = s(g, h, f, m, j, 15, b[62]),
				m = s(m, g, h, f, A, 21, b[63])
			a[0] = (a[0] + f) | 0
			a[1] = (a[1] + m) | 0
			a[2] = (a[2] + g) | 0
			a[3] = (a[3] + h) | 0
		},
		_doFinalize: function() {
			var b = this._data,
				n = b.words,
				a = 8 * this._nDataBytes,
				c = 8 * b.sigBytes
			n[c >>> 5] |= 128 << (24 - (c % 32))
			var e = u.floor(a / 4294967296)
			n[(((c + 64) >>> 9) << 4) + 15] =
				(((e << 8) | (e >>> 24)) & 16711935) | (((e << 24) | (e >>> 8)) & 4278255360)
			n[(((c + 64) >>> 9) << 4) + 14] =
				(((a << 8) | (a >>> 24)) & 16711935) | (((a << 24) | (a >>> 8)) & 4278255360)
			b.sigBytes = 4 * (n.length + 1)
			this._process()
			b = this._hash
			n = b.words
			for (a = 0; 4 > a; a++)
				(c = n[a]), (n[a] = (((c << 8) | (c >>> 24)) & 16711935) | (((c << 24) | (c >>> 8)) & 4278255360))
			return b
		},
		clone: function() {
			var b = v.clone.call(this)
			b._hash = this._hash.clone()
			return b
		}
	})
	t.MD5 = v._createHelper(r)
	t.HmacMD5 = v._createHmacHelper(r)
})(Math)
;(function() {
	var u = CryptoJS,
		p = u.lib,
		d = p.Base,
		l = p.WordArray,
		p = u.algo,
		s = (p.EvpKDF = d.extend({
			cfg: d.extend({keySize: 4, hasher: p.MD5, iterations: 1}),
			init: function(d) {
				this.cfg = this.cfg.extend(d)
			},
			compute: function(d, r) {
				for (
					var p = this.cfg,
						s = p.hasher.create(),
						b = l.create(),
						u = b.words,
						q = p.keySize,
						p = p.iterations;
					u.length < q;

				) {
					n && s.update(n)
					var n = s.update(d).finalize(r)
					s.reset()
					for (var a = 1; a < p; a++) (n = s.finalize(n)), s.reset()
					b.concat(n)
				}
				b.sigBytes = 4 * q
				return b
			}
		}))
	u.EvpKDF = function(d, l, p) {
		return s.create(p).compute(d, l)
	}
})()
CryptoJS.lib.Cipher ||
	(function(u) {
		var p = CryptoJS,
			d = p.lib,
			l = d.Base,
			s = d.WordArray,
			t = d.BufferedBlockAlgorithm,
			r = p.enc.Base64,
			w = p.algo.EvpKDF,
			v = (d.Cipher = t.extend({
				cfg: l.extend(),
				createEncryptor: function(e, a) {
					return this.create(this._ENC_XFORM_MODE, e, a)
				},
				createDecryptor: function(e, a) {
					return this.create(this._DEC_XFORM_MODE, e, a)
				},
				init: function(e, a, b) {
					this.cfg = this.cfg.extend(b)
					this._xformMode = e
					this._key = a
					this.reset()
				},
				reset: function() {
					t.reset.call(this)
					this._doReset()
				},
				process: function(e) {
					this._append(e)
					return this._process()
				},
				finalize: function(e) {
					e && this._append(e)
					return this._doFinalize()
				},
				keySize: 4,
				ivSize: 4,
				_ENC_XFORM_MODE: 1,
				_DEC_XFORM_MODE: 2,
				_createHelper: function(e) {
					return {
						encrypt: function(b, k, d) {
							return ('string' == typeof k ? c : a).encrypt(e, b, k, d)
						},
						decrypt: function(b, k, d) {
							return ('string' == typeof k ? c : a).decrypt(e, b, k, d)
						}
					}
				}
			}))
		d.StreamCipher = v.extend({
			_doFinalize: function() {
				return this._process(!0)
			},
			blockSize: 1
		})
		var b = (p.mode = {}),
			x = function(e, a, b) {
				var c = this._iv
				c ? (this._iv = u) : (c = this._prevBlock)
				for (var d = 0; d < b; d++) e[a + d] ^= c[d]
			},
			q = (d.BlockCipherMode = l.extend({
				createEncryptor: function(e, a) {
					return this.Encryptor.create(e, a)
				},
				createDecryptor: function(e, a) {
					return this.Decryptor.create(e, a)
				},
				init: function(e, a) {
					this._cipher = e
					this._iv = a
				}
			})).extend()
		q.Encryptor = q.extend({
			processBlock: function(e, a) {
				var b = this._cipher,
					c = b.blockSize
				x.call(this, e, a, c)
				b.encryptBlock(e, a)
				this._prevBlock = e.slice(a, a + c)
			}
		})
		q.Decryptor = q.extend({
			processBlock: function(e, a) {
				var b = this._cipher,
					c = b.blockSize,
					d = e.slice(a, a + c)
				b.decryptBlock(e, a)
				x.call(this, e, a, c)
				this._prevBlock = d
			}
		})
		b = b.CBC = q
		q = (p.pad = {}).Pkcs7 = {
			pad: function(a, b) {
				for (
					var c = 4 * b, c = c - (a.sigBytes % c), d = (c << 24) | (c << 16) | (c << 8) | c, l = [], n = 0;
					n < c;
					n += 4
				)
					l.push(d)
				c = s.create(l, c)
				a.concat(c)
			},
			unpad: function(a) {
				a.sigBytes -= a.words[(a.sigBytes - 1) >>> 2] & 255
			}
		}
		d.BlockCipher = v.extend({
			cfg: v.cfg.extend({mode: b, padding: q}),
			reset: function() {
				v.reset.call(this)
				var a = this.cfg,
					b = a.iv,
					a = a.mode
				if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor
				else (c = a.createDecryptor), (this._minBufferSize = 1)
				this._mode = c.call(a, this, b && b.words)
			},
			_doProcessBlock: function(a, b) {
				this._mode.processBlock(a, b)
			},
			_doFinalize: function() {
				var a = this.cfg.padding
				if (this._xformMode == this._ENC_XFORM_MODE) {
					a.pad(this._data, this.blockSize)
					var b = this._process(!0)
				} else (b = this._process(!0)), a.unpad(b)
				return b
			},
			blockSize: 4
		})
		var n = (d.CipherParams = l.extend({
				init: function(a) {
					this.mixIn(a)
				},
				toString: function(a) {
					return (a || this.formatter).stringify(this)
				}
			})),
			b = ((p.format = {}).OpenSSL = {
				stringify: function(a) {
					var b = a.ciphertext
					a = a.salt
					return (a
						? s
								.create([1398893684, 1701076831])
								.concat(a)
								.concat(b)
						: b
					).toString(r)
				},
				parse: function(a) {
					a = r.parse(a)
					var b = a.words
					if (1398893684 == b[0] && 1701076831 == b[1]) {
						var c = s.create(b.slice(2, 4))
						b.splice(0, 4)
						a.sigBytes -= 16
					}
					return n.create({ciphertext: a, salt: c})
				}
			}),
			a = (d.SerializableCipher = l.extend({
				cfg: l.extend({format: b}),
				encrypt: function(a, b, c, d) {
					d = this.cfg.extend(d)
					var l = a.createEncryptor(c, d)
					b = l.finalize(b)
					l = l.cfg
					return n.create({
						ciphertext: b,
						key: c,
						iv: l.iv,
						algorithm: a,
						mode: l.mode,
						padding: l.padding,
						blockSize: a.blockSize,
						formatter: d.format
					})
				},
				decrypt: function(a, b, c, d) {
					d = this.cfg.extend(d)
					b = this._parse(b, d.format)
					return a.createDecryptor(c, d).finalize(b.ciphertext)
				},
				_parse: function(a, b) {
					return 'string' == typeof a ? b.parse(a, this) : a
				}
			})),
			p = ((p.kdf = {}).OpenSSL = {
				execute: function(a, b, c, d) {
					d || (d = s.random(8))
					a = w.create({keySize: b + c}).compute(a, d)
					c = s.create(a.words.slice(b), 4 * c)
					a.sigBytes = 4 * b
					return n.create({key: a, iv: c, salt: d})
				}
			}),
			c = (d.PasswordBasedCipher = a.extend({
				cfg: a.cfg.extend({kdf: p}),
				encrypt: function(b, c, d, l) {
					l = this.cfg.extend(l)
					d = l.kdf.execute(d, b.keySize, b.ivSize)
					l.iv = d.iv
					b = a.encrypt.call(this, b, c, d.key, l)
					b.mixIn(d)
					return b
				},
				decrypt: function(b, c, d, l) {
					l = this.cfg.extend(l)
					c = this._parse(c, l.format)
					d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt)
					l.iv = d.iv
					return a.decrypt.call(this, b, c, d.key, l)
				}
			}))
	})()
;(function() {
	for (
		var u = CryptoJS,
			p = u.lib.BlockCipher,
			d = u.algo,
			l = [],
			s = [],
			t = [],
			r = [],
			w = [],
			v = [],
			b = [],
			x = [],
			q = [],
			n = [],
			a = [],
			c = 0;
		256 > c;
		c++
	)
		a[c] = 128 > c ? c << 1 : (c << 1) ^ 283
	for (var e = 0, j = 0, c = 0; 256 > c; c++) {
		var k = j ^ (j << 1) ^ (j << 2) ^ (j << 3) ^ (j << 4),
			k = (k >>> 8) ^ (k & 255) ^ 99
		l[e] = k
		s[k] = e
		var z = a[e],
			F = a[z],
			G = a[F],
			y = (257 * a[k]) ^ (16843008 * k)
		t[e] = (y << 24) | (y >>> 8)
		r[e] = (y << 16) | (y >>> 16)
		w[e] = (y << 8) | (y >>> 24)
		v[e] = y
		y = (16843009 * G) ^ (65537 * F) ^ (257 * z) ^ (16843008 * e)
		b[k] = (y << 24) | (y >>> 8)
		x[k] = (y << 16) | (y >>> 16)
		q[k] = (y << 8) | (y >>> 24)
		n[k] = y
		e ? ((e = z ^ a[a[a[G ^ z]]]), (j ^= a[a[j]])) : (e = j = 1)
	}
	var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
		d = (d.AES = p.extend({
			_doReset: function() {
				for (
					var a = this._key,
						c = a.words,
						d = a.sigBytes / 4,
						a = 4 * ((this._nRounds = d + 6) + 1),
						e = (this._keySchedule = []),
						j = 0;
					j < a;
					j++
				)
					if (j < d) e[j] = c[j]
					else {
						var k = e[j - 1]
						j % d
							? 6 < d &&
							  4 == j % d &&
							  (k =
									(l[k >>> 24] << 24) |
									(l[(k >>> 16) & 255] << 16) |
									(l[(k >>> 8) & 255] << 8) |
									l[k & 255])
							: ((k = (k << 8) | (k >>> 24)),
							  (k =
									(l[k >>> 24] << 24) |
									(l[(k >>> 16) & 255] << 16) |
									(l[(k >>> 8) & 255] << 8) |
									l[k & 255]),
							  (k ^= H[(j / d) | 0] << 24))
						e[j] = e[j - d] ^ k
					}
				c = this._invKeySchedule = []
				for (d = 0; d < a; d++)
					(j = a - d),
						(k = d % 4 ? e[j] : e[j - 4]),
						(c[d] =
							4 > d || 4 >= j
								? k
								: b[l[k >>> 24]] ^ x[l[(k >>> 16) & 255]] ^ q[l[(k >>> 8) & 255]] ^ n[l[k & 255]])
			},
			encryptBlock: function(a, b) {
				this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l)
			},
			decryptBlock: function(a, c) {
				var d = a[c + 1]
				a[c + 1] = a[c + 3]
				a[c + 3] = d
				this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s)
				d = a[c + 1]
				a[c + 1] = a[c + 3]
				a[c + 3] = d
			},
			_doCryptBlock: function(a, b, c, d, e, j, l, f) {
				for (
					var m = this._nRounds,
						g = a[b] ^ c[0],
						h = a[b + 1] ^ c[1],
						k = a[b + 2] ^ c[2],
						n = a[b + 3] ^ c[3],
						p = 4,
						r = 1;
					r < m;
					r++
				)
					var q = d[g >>> 24] ^ e[(h >>> 16) & 255] ^ j[(k >>> 8) & 255] ^ l[n & 255] ^ c[p++],
						s = d[h >>> 24] ^ e[(k >>> 16) & 255] ^ j[(n >>> 8) & 255] ^ l[g & 255] ^ c[p++],
						t = d[k >>> 24] ^ e[(n >>> 16) & 255] ^ j[(g >>> 8) & 255] ^ l[h & 255] ^ c[p++],
						n = d[n >>> 24] ^ e[(g >>> 16) & 255] ^ j[(h >>> 8) & 255] ^ l[k & 255] ^ c[p++],
						g = q,
						h = s,
						k = t
				q =
					((f[g >>> 24] << 24) | (f[(h >>> 16) & 255] << 16) | (f[(k >>> 8) & 255] << 8) | f[n & 255]) ^
					c[p++]
				s =
					((f[h >>> 24] << 24) | (f[(k >>> 16) & 255] << 16) | (f[(n >>> 8) & 255] << 8) | f[g & 255]) ^
					c[p++]
				t =
					((f[k >>> 24] << 24) | (f[(n >>> 16) & 255] << 16) | (f[(g >>> 8) & 255] << 8) | f[h & 255]) ^
					c[p++]
				n =
					((f[n >>> 24] << 24) | (f[(g >>> 16) & 255] << 16) | (f[(h >>> 8) & 255] << 8) | f[k & 255]) ^
					c[p++]
				a[b] = q
				a[b + 1] = s
				a[b + 2] = t
				a[b + 3] = n
			},
			keySize: 8
		}))
	u.AES = p._createHelper(d)
})()

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS =
	CryptoJS ||
	(function(g, j) {
		var e = {},
			d = (e.lib = {}),
			m = function() {},
			n = (d.Base = {
				extend: function(a) {
					m.prototype = this
					var c = new m()
					a && c.mixIn(a)
					c.hasOwnProperty('init') ||
						(c.init = function() {
							c.$super.init.apply(this, arguments)
						})
					c.init.prototype = c
					c.$super = this
					return c
				},
				create: function() {
					var a = this.extend()
					a.init.apply(a, arguments)
					return a
				},
				init: function() {},
				mixIn: function(a) {
					for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c])
					a.hasOwnProperty('toString') && (this.toString = a.toString)
				},
				clone: function() {
					return this.init.prototype.extend(this)
				}
			}),
			q = (d.WordArray = n.extend({
				init: function(a, c) {
					a = this.words = a || []
					this.sigBytes = c != j ? c : 4 * a.length
				},
				toString: function(a) {
					return (a || l).stringify(this)
				},
				concat: function(a) {
					var c = this.words,
						p = a.words,
						f = this.sigBytes
					a = a.sigBytes
					this.clamp()
					if (f % 4)
						for (var b = 0; b < a; b++)
							c[(f + b) >>> 2] |= ((p[b >>> 2] >>> (24 - 8 * (b % 4))) & 255) << (24 - 8 * ((f + b) % 4))
					else if (65535 < p.length) for (b = 0; b < a; b += 4) c[(f + b) >>> 2] = p[b >>> 2]
					else c.push.apply(c, p)
					this.sigBytes += a
					return this
				},
				clamp: function() {
					var a = this.words,
						c = this.sigBytes
					a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4))
					a.length = g.ceil(c / 4)
				},
				clone: function() {
					var a = n.clone.call(this)
					a.words = this.words.slice(0)
					return a
				},
				random: function(a) {
					for (var c = [], b = 0; b < a; b += 4) c.push((4294967296 * g.random()) | 0)
					return new q.init(c, a)
				}
			})),
			b = (e.enc = {}),
			l = (b.Hex = {
				stringify: function(a) {
					var c = a.words
					a = a.sigBytes
					for (var b = [], f = 0; f < a; f++) {
						var d = (c[f >>> 2] >>> (24 - 8 * (f % 4))) & 255
						b.push((d >>> 4).toString(16))
						b.push((d & 15).toString(16))
					}
					return b.join('')
				},
				parse: function(a) {
					for (var c = a.length, b = [], f = 0; f < c; f += 2)
						b[f >>> 3] |= parseInt(a.substr(f, 2), 16) << (24 - 4 * (f % 8))
					return new q.init(b, c / 2)
				}
			}),
			k = (b.Latin1 = {
				stringify: function(a) {
					var c = a.words
					a = a.sigBytes
					for (var b = [], f = 0; f < a; f++)
						b.push(String.fromCharCode((c[f >>> 2] >>> (24 - 8 * (f % 4))) & 255))
					return b.join('')
				},
				parse: function(a) {
					for (var c = a.length, b = [], f = 0; f < c; f++)
						b[f >>> 2] |= (a.charCodeAt(f) & 255) << (24 - 8 * (f % 4))
					return new q.init(b, c)
				}
			}),
			h = (b.Utf8 = {
				stringify: function(a) {
					try {
						return decodeURIComponent(escape(k.stringify(a)))
					} catch (b) {
						throw Error('Malformed UTF-8 data')
					}
				},
				parse: function(a) {
					return k.parse(unescape(encodeURIComponent(a)))
				}
			}),
			u = (d.BufferedBlockAlgorithm = n.extend({
				reset: function() {
					this._data = new q.init()
					this._nDataBytes = 0
				},
				_append: function(a) {
					'string' == typeof a && (a = h.parse(a))
					this._data.concat(a)
					this._nDataBytes += a.sigBytes
				},
				_process: function(a) {
					var b = this._data,
						d = b.words,
						f = b.sigBytes,
						l = this.blockSize,
						e = f / (4 * l),
						e = a ? g.ceil(e) : g.max((e | 0) - this._minBufferSize, 0)
					a = e * l
					f = g.min(4 * a, f)
					if (a) {
						for (var h = 0; h < a; h += l) this._doProcessBlock(d, h)
						h = d.splice(0, a)
						b.sigBytes -= f
					}
					return new q.init(h, f)
				},
				clone: function() {
					var a = n.clone.call(this)
					a._data = this._data.clone()
					return a
				},
				_minBufferSize: 0
			}))
		d.Hasher = u.extend({
			cfg: n.extend(),
			init: function(a) {
				this.cfg = this.cfg.extend(a)
				this.reset()
			},
			reset: function() {
				u.reset.call(this)
				this._doReset()
			},
			update: function(a) {
				this._append(a)
				this._process()
				return this
			},
			finalize: function(a) {
				a && this._append(a)
				return this._doFinalize()
			},
			blockSize: 16,
			_createHelper: function(a) {
				return function(b, d) {
					return new a.init(d).finalize(b)
				}
			},
			_createHmacHelper: function(a) {
				return function(b, d) {
					return new w.HMAC.init(a, d).finalize(b)
				}
			}
		})
		var w = (e.algo = {})
		return e
	})(Math)
;(function() {
	var g = CryptoJS,
		j = g.lib,
		e = j.WordArray,
		d = j.Hasher,
		m = [],
		j = (g.algo.SHA1 = d.extend({
			_doReset: function() {
				this._hash = new e.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
			},
			_doProcessBlock: function(d, e) {
				for (var b = this._hash.words, l = b[0], k = b[1], h = b[2], g = b[3], j = b[4], a = 0; 80 > a; a++) {
					if (16 > a) m[a] = d[e + a] | 0
					else {
						var c = m[a - 3] ^ m[a - 8] ^ m[a - 14] ^ m[a - 16]
						m[a] = (c << 1) | (c >>> 31)
					}
					c = ((l << 5) | (l >>> 27)) + j + m[a]
					c =
						20 > a
							? c + (((k & h) | (~k & g)) + 1518500249)
							: 40 > a
							? c + ((k ^ h ^ g) + 1859775393)
							: 60 > a
							? c + (((k & h) | (k & g) | (h & g)) - 1894007588)
							: c + ((k ^ h ^ g) - 899497514)
					j = g
					g = h
					h = (k << 30) | (k >>> 2)
					k = l
					l = c
				}
				b[0] = (b[0] + l) | 0
				b[1] = (b[1] + k) | 0
				b[2] = (b[2] + h) | 0
				b[3] = (b[3] + g) | 0
				b[4] = (b[4] + j) | 0
			},
			_doFinalize: function() {
				var d = this._data,
					e = d.words,
					b = 8 * this._nDataBytes,
					l = 8 * d.sigBytes
				e[l >>> 5] |= 128 << (24 - (l % 32))
				e[(((l + 64) >>> 9) << 4) + 14] = Math.floor(b / 4294967296)
				e[(((l + 64) >>> 9) << 4) + 15] = b
				d.sigBytes = 4 * e.length
				this._process()
				return this._hash
			},
			clone: function() {
				var e = d.clone.call(this)
				e._hash = this._hash.clone()
				return e
			}
		}))
	g.SHA1 = d._createHelper(j)
	g.HmacSHA1 = d._createHmacHelper(j)
})()
;(function() {
	var g = CryptoJS,
		j = g.enc.Utf8
	g.algo.HMAC = g.lib.Base.extend({
		init: function(e, d) {
			e = this._hasher = new e.init()
			'string' == typeof d && (d = j.parse(d))
			var g = e.blockSize,
				n = 4 * g
			d.sigBytes > n && (d = e.finalize(d))
			d.clamp()
			for (
				var q = (this._oKey = d.clone()), b = (this._iKey = d.clone()), l = q.words, k = b.words, h = 0;
				h < g;
				h++
			)
				(l[h] ^= 1549556828), (k[h] ^= 909522486)
			q.sigBytes = b.sigBytes = n
			this.reset()
		},
		reset: function() {
			var e = this._hasher
			e.reset()
			e.update(this._iKey)
		},
		update: function(e) {
			this._hasher.update(e)
			return this
		},
		finalize: function(e) {
			var d = this._hasher
			e = d.finalize(e)
			d.reset()
			return d.finalize(this._oKey.clone().concat(e))
		}
	})
})()
;(function() {
	var g = CryptoJS,
		j = g.lib,
		e = j.Base,
		d = j.WordArray,
		j = g.algo,
		m = j.HMAC,
		n = (j.PBKDF2 = e.extend({
			cfg: e.extend({keySize: 4, hasher: j.SHA1, iterations: 1}),
			init: function(d) {
				this.cfg = this.cfg.extend(d)
			},
			compute: function(e, b) {
				for (
					var g = this.cfg,
						k = m.create(g.hasher, e),
						h = d.create(),
						j = d.create([1]),
						n = h.words,
						a = j.words,
						c = g.keySize,
						g = g.iterations;
					n.length < c;

				) {
					var p = k.update(b).finalize(j)
					k.reset()
					for (var f = p.words, v = f.length, s = p, t = 1; t < g; t++) {
						s = k.finalize(s)
						k.reset()
						for (var x = s.words, r = 0; r < v; r++) f[r] ^= x[r]
					}
					h.concat(p)
					a[0]++
				}
				h.sigBytes = 4 * c
				return h
			}
		}))
	g.PBKDF2 = function(d, b, e) {
		return n.create(e).compute(d, b)
	}
})()

var AES = {
	keySize: 256,
	ivSize: 128,
	saltSize: 256,
	iterations: 100,

	/**
	 * AES - Encrypt
	 * @param  String msg  A string a ser criptografada (JSON stringify)
	 * @param  String pass Senha
	 * @return String      String Base64 contendo os dados encriptografados
	 */
	encrypt: (msg, pass) => {
		var salt = CryptoJS.lib.WordArray.random(AES.saltSize / 8)

		var key = CryptoJS.PBKDF2(pass, salt, {
			keySize: AES.keySize / 32,
			iterations: AES.iterations
		})

		var iv = CryptoJS.lib.WordArray.random(AES.ivSize / 8)

		var encrypted = CryptoJS.AES.encrypt(msg, key, {
			iv: iv,
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC
		})

		var encryptedHex = AES.base64ToHex(encrypted.toString())
		var base64result = AES.hexToBase64(salt + iv + encryptedHex)

		return base64result
	},

	/**
	 * AES - Decrypt
	 * @param  String msg  Uma string Base64 com os dados criptografados
	 * @param  String pass Senha
	 * @return String      String resultante
	 */
	decrypt: (msg, pass) => {
		var hexResult = AES.base64ToHex(msg)

		var salt = CryptoJS.enc.Hex.parse(hexResult.substr(0, 64))
		var iv = CryptoJS.enc.Hex.parse(hexResult.substr(64, 32))
		var encrypted = AES.hexToBase64(hexResult.substring(96))

		var key = CryptoJS.PBKDF2(pass, salt, {
			keySize: AES.keySize / 32,
			iterations: AES.iterations
		})

		var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
			iv: iv,
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC
		})

		return decrypted.toString(CryptoJS.enc.Utf8)
	},

	hexToBase64: str => {
		var a = str
			.replace(/\r|\n/g, '')
			.replace(/([\da-fA-F]{2}) ?/g, '0x$1 ')
			.replace(/ +$/, '')
			.split(' ')
		var o = ''

		for (var i = 0; i <= a.length; i += 20000) {
			var aa = a.slice(i, i + 20000)
			o = o + String.fromCharCode.apply(null, aa)
		}

		return btoa(o)
	},

	base64ToHex: str => {
		for (var i = 0, bin = atob(str.replace(/[\r\n]+$/, '')), hex = []; i < bin.length; ++i) {
			var tmp = bin.charCodeAt(i).toString(16)

			if (tmp.length === 1) tmp = '0' + tmp
			hex[hex.length] = tmp
		}

		return hex.join('')
	}
}

// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.
// Basic JavaScript BN library - subset useful for RSA encryption.

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary & 0xffffff) == 0xefcafe);

// (public) Constructor

function BigInteger(a, b, c) {
    if (a != null) if ("number" == typeof a) this.fromNumber(a, b, c);
    else if (b == null && "string" != typeof a) this.fromString(a, 256);
    else this.fromString(a, b);
}

// return new, unset BigInteger

function nbi() {
    return new BigInteger(null);
}

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.
// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)

function am1(i, x, w, j, c, n) {
    while (--n >= 0) {
        var v = x * this[i++] + w[j] + c;
        c = Math.floor(v / 0x4000000);
        w[j++] = v & 0x3ffffff;
    }
    return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)

function am2(i, x, w, j, c, n) {
    var xl = x & 0x7fff,
        xh = x >> 15;
    while (--n >= 0) {
        var l = this[i] & 0x7fff;
        var h = this[i++] >> 15;
        var m = xh * l + h * xl;
        l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
        c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
        w[j++] = l & 0x3fffffff;
    }
    return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.

function am3(i, x, w, j, c, n) {
    var xl = x & 0x3fff,
        xh = x >> 14;
    while (--n >= 0) {
        var l = this[i] & 0x3fff;
        var h = this[i++] >> 14;
        var m = xh * l + h * xl;
        l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
        c = (l >> 28) + (m >> 14) + xh * h;
        w[j++] = l & 0xfffffff;
    }
    return c;
}
if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
}
else if (j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1 << dbits) - 1);
BigInteger.prototype.DV = (1 << dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP);
BigInteger.prototype.F1 = BI_FP - dbits;
BigInteger.prototype.F2 = 2 * dbits - BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr, vv;
rr = "0".charCodeAt(0);
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) {
    return BI_RM.charAt(n);
}

function intAt(s, i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c == null) ? -1 : c;
}

// (protected) copy this to r

function bnpCopyTo(r) {
    for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV

function bnpFromInt(x) {
    this.t = 1;
    this.s = (x < 0) ? -1 : 0;
    if (x > 0) this[0] = x;
    else if (x < -1) this[0] = x + DV;
    else this.t = 0;
}

// return bigint initialized to value

function nbv(i) {
    var r = nbi();
    r.fromInt(i);
    return r;
}

// (protected) set from string and radix

function bnpFromString(s, b) {
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 256) k = 8; // byte array
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else {
        this.fromRadix(s, b);
        return;
    }
    this.t = 0;
    this.s = 0;
    var i = s.length,
        mi = false,
        sh = 0;
    while (--i >= 0) {
        var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
        if (x < 0) {
            if (s.charAt(i) == "-") mi = true;
            continue;
        }
        mi = false;
        if (sh == 0) this[this.t++] = x;
        else if (sh + k > this.DB) {
            this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
            this[this.t++] = (x >> (this.DB - sh));
        }
        else this[this.t - 1] |= x << sh;
        sh += k;
        if (sh >= this.DB) sh -= this.DB;
    }
    if (k == 8 && (s[0] & 0x80) != 0) {
        this.s = -1;
        if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
    }
    this.clamp();
    if (mi) BigInteger.ZERO.subTo(this, this);
}

// (protected) clamp off excess high words

function bnpClamp() {
    var c = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] == c)--this.t;
}

// (public) return string representation in given radix

function bnToString(b) {
    if (this.s < 0) return "-" + this.negate().toString(b);
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 64) k = 6;
    else if (b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1 << k) - 1,
        d, m = false,
        r = "",
        i = this.t;
    var p = this.DB - (i * this.DB) % k;
    if (i-- > 0) {
        if (p < this.DB && (d = this[i] >> p) > 0) {
            m = true;
            r = int2char(d);
        }
        while (i >= 0) {
            if (p < k) {
                d = (this[i] & ((1 << p) - 1)) << (k - p);
                d |= this[--i] >> (p += this.DB - k);
            }
            else {
                d = (this[i] >> (p -= k)) & km;
                if (p <= 0) {
                    p += this.DB;
                    --i;
                }
            }
            if (d > 0) m = true;
            if (m) r += int2char(d);
        }
    }
    return m ? r : "0";
}

// (public) -this

function bnNegate() {
    var r = nbi();
    BigInteger.ZERO.subTo(this, r);
    return r;
}

// (public) |this|

function bnAbs() {
    return (this.s < 0) ? this.negate() : this;
}

// (public) return + if this > a, - if this < a, 0 if equal

function bnCompareTo(a) {
    var r = this.s - a.s;
    if (r != 0) return r;
    var i = this.t;
    r = i - a.t;
    if (r != 0) return r;
    while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
    return 0;
}

// returns bit length of the integer x

function nbits(x) {
    var r = 1,
        t;
    if ((t = x >>> 16) != 0) {
        x = t;
        r += 16;
    }
    if ((t = x >> 8) != 0) {
        x = t;
        r += 8;
    }
    if ((t = x >> 4) != 0) {
        x = t;
        r += 4;
    }
    if ((t = x >> 2) != 0) {
        x = t;
        r += 2;
    }
    if ((t = x >> 1) != 0) {
        x = t;
        r += 1;
    }
    return r;
}

// (public) return the number of bits in "this"

function bnBitLength() {
    if (this.t <= 0) return 0;
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
}

// (protected) r = this << n*DB

function bnpDLShiftTo(n, r) {
    var i;
    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
    for (i = n - 1; i >= 0; --i) r[i] = 0;
    r.t = this.t + n;
    r.s = this.s;
}

// (protected) r = this >> n*DB

function bnpDRShiftTo(n, r) {
    for (var i = n; i < this.t; ++i) r[i - n] = this[i];
    r.t = Math.max(this.t - n, 0);
    r.s = this.s;
}

// (protected) r = this << n

function bnpLShiftTo(n, r) {
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << cbs) - 1;
    var ds = Math.floor(n / this.DB),
        c = (this.s << bs) & this.DM,
        i;
    for (i = this.t - 1; i >= 0; --i) {
        r[i + ds + 1] = (this[i] >> cbs) | c;
        c = (this[i] & bm) << bs;
    }
    for (i = ds - 1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t + ds + 1;
    r.s = this.s;
    r.clamp();
}

// (protected) r = this >> n

function bnpRShiftTo(n, r) {
    r.s = this.s;
    var ds = Math.floor(n / this.DB);
    if (ds >= this.t) {
        r.t = 0;
        return;
    }
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << bs) - 1;
    r[0] = this[ds] >> bs;
    for (var i = ds + 1; i < this.t; ++i) {
        r[i - ds - 1] |= (this[i] & bm) << cbs;
        r[i - ds] = this[i] >> bs;
    }
    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
    r.t = this.t - ds;
    r.clamp();
}

// (protected) r = this - a

function bnpSubTo(a, r) {
    var i = 0,
        c = 0,
        m = Math.min(a.t, this.t);
    while (i < m) {
        c += this[i] - a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
    }
    if (a.t < this.t) {
        c -= a.s;
        while (i < this.t) {
            c += this[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        c += this.s;
    }
    else {
        c += this.s;
        while (i < a.t) {
            c -= a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        c -= a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c < -1) r[i++] = this.DV + c;
    else if (c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.

function bnpMultiplyTo(a, r) {
    var x = this.abs(),
        y = a.abs();
    var i = x.t;
    r.t = i + y.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
    r.s = 0;
    r.clamp();
    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
}

// (protected) r = this^2, r != this (HAC 14.16)

function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2 * x.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < x.t - 1; ++i) {
        var c = x.am(i, x[i], r, 2 * i, 0, 1);
        if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
            r[i + x.t] -= x.DV;
            r[i + x.t + 1] = 1;
        }
    }
    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
    r.s = 0;
    r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.

function bnpDivRemTo(m, q, r) {
    var pm = m.abs();
    if (pm.t <= 0) return;
    var pt = this.abs();
    if (pt.t < pm.t) {
        if (q != null) q.fromInt(0);
        if (r != null) this.copyTo(r);
        return;
    }
    if (r == null) r = nbi();
    var y = nbi(),
        ts = this.s,
        ms = m.s;
    var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
    if (nsh > 0) {
        pm.lShiftTo(nsh, y);
        pt.lShiftTo(nsh, r);
    }
    else {
        pm.copyTo(y);
        pt.copyTo(r);
    }
    var ys = y.t;
    var y0 = y[ys - 1];
    if (y0 == 0) return;
    var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
    var d1 = this.FV / yt,
        d2 = (1 << this.F1) / yt,
        e = 1 << this.F2;
    var i = r.t,
        j = i - ys,
        t = (q == null) ? nbi() : q;
    y.dlShiftTo(j, t);
    if (r.compareTo(t) >= 0) {
        r[r.t++] = 1;
        r.subTo(t, r);
    }
    BigInteger.ONE.dlShiftTo(ys, t);
    t.subTo(y, y); // "negative" y so we can replace sub with am later
    while (y.t < ys) y[y.t++] = 0;
    while (--j >= 0) {
        // Estimate quotient digit
        var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
        if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
            y.dlShiftTo(j, t);
            r.subTo(t, r);
            while (r[i] < --qd) r.subTo(t, r);
        }
    }
    if (q != null) {
        r.drShiftTo(ys, q);
        if (ts != ms) BigInteger.ZERO.subTo(q, q);
    }
    r.t = ys;
    r.clamp();
    if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
    if (ts < 0) BigInteger.ZERO.subTo(r, r);
}

// (public) this mod a

function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a, null, r);
    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
    return r;
}

// Modular reduction using "classic" algorithm

function Classic(m) {
    this.m = m;
}

function cConvert(x) {
    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
}

function cRevert(x) {
    return x;
}

function cReduce(x) {
    x.divRemTo(this.m, null, x);
}

function cMulTo(x, y, r) {
    x.multiplyTo(y, r);
    this.reduce(r);
}

function cSqrTo(x, r) {
    x.squareTo(r);
    this.reduce(r);
}

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.

function bnpInvDigit() {
    if (this.t < 1) return 0;
    var x = this[0];
    if ((x & 1) == 0) return 0;
    var y = x & 3; // y == 1/x mod 2^2
    y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
    y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y > 0) ? this.DV - y : -y;
}

// Montgomery reduction

function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp & 0x7fff;
    this.mph = this.mp >> 15;
    this.um = (1 << (m.DB - 15)) - 1;
    this.mt2 = 2 * m.t;
}

// xR mod m

function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t, r);
    r.divRemTo(this.m, null, r);
    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
    return r;
}

// x/R mod m

function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
}

// x = x/R mod m (HAC 14.32)

function montReduce(x) {
    while (x.t <= this.mt2) // pad x so am has enough room later
    x[x.t++] = 0;
    for (var i = 0; i < this.m.t; ++i) {
        // faster way of calculating u0 = x[i]*mp mod DV
        var j = x[i] & 0x7fff;
        var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
        // use am to combine the multiply-shift-add into one call
        j = i + this.m.t;
        x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
        // propagate carry
        while (x[j] >= x.DV) {
            x[j] -= x.DV;
            x[++j]++;
        }
    }
    x.clamp();
    x.drShiftTo(this.m.t, x);
    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
}

// r = "x^2/R mod m"; x != r

function montSqrTo(x, r) {
    x.squareTo(r);
    this.reduce(r);
}

// r = "xy/R mod m"; x,y != r

function montMulTo(x, y, r) {
    x.multiplyTo(y, r);
    this.reduce(r);
}

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even

function bnpIsEven() {
    return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
}

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)

function bnpExp(e, z) {
    if (e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(),
        r2 = nbi(),
        g = z.convert(this),
        i = nbits(e) - 1;
    g.copyTo(r);
    while (--i >= 0) {
        z.sqrTo(r, r2);
        if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
        else {
            var t = r;
            r = r2;
            r2 = t;
        }
    }
    return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32

function bnModPowInt(e, m) {
    var z;
    if (e < 256 || m.isEven()) z = new Classic(m);
    else z = new Montgomery(m);
    return this.exp(e, z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);


function bnClone() {
    var r = nbi();
    this.copyTo(r);
    return r;
}

// (public) return value as integer

function bnIntValue() {
    if (this.s < 0) {
        if (this.t == 1) return this[0] - this.DV;
        else if (this.t == 0) return -1;
    }
    else if (this.t == 1) return this[0];
    else if (this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
}

// (public) return value as byte

function bnByteValue() {
    return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
}

// (public) return value as short (assumes DB>=16)

function bnShortValue() {
    return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
}

// (protected) return x s.t. r^x < DV

function bnpChunkSize(r) {
    return Math.floor(Math.LN2 * this.DB / Math.log(r));
}

// (public) 0 if this == 0, 1 if this > 0

function bnSigNum() {
    if (this.s < 0) return -1;
    else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
}

// (protected) convert to radix string

function bnpToRadix(b) {
    if (b == null) b = 10;
    if (this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b, cs);
    var d = nbv(a),
        y = nbi(),
        z = nbi(),
        r = "";
    this.divRemTo(d, y, z);
    while (y.signum() > 0) {
        r = (a + z.intValue()).toString(b).substr(1) + r;
        y.divRemTo(d, y, z);
    }
    return z.intValue().toString(b) + r;
}

// (protected) convert from radix string

function bnpFromRadix(s, b) {
    this.fromInt(0);
    if (b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b, cs),
        mi = false,
        j = 0,
        w = 0;
    for (var i = 0; i < s.length; ++i) {
        var x = intAt(s, i);
        if (x < 0) {
            if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
            continue;
        }
        w = b * w + x;
        if (++j >= cs) {
            this.dMultiply(d);
            this.dAddOffset(w, 0);
            j = 0;
            w = 0;
        }
    }
    if (j > 0) {
        this.dMultiply(Math.pow(b, j));
        this.dAddOffset(w, 0);
    }
    if (mi) BigInteger.ZERO.subTo(this, this);
}

// (protected) alternate constructor

function bnpFromNumber(a, b, c) {
    if ("number" == typeof b) {
        // new BigInteger(int,int,RNG)
        if (a < 2) this.fromInt(1);
        else {
            this.fromNumber(a, c);
            if (!this.testBit(a - 1)) // force MSB set
            this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
            if (this.isEven()) this.dAddOffset(1, 0); // force odd
            while (!this.isProbablePrime(b)) {
                this.dAddOffset(2, 0);
                if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
            }
        }
    }
    else {
        // new BigInteger(int,RNG)
        var x = new Array(),
            t = a & 7;
        x.length = (a >> 3) + 1;
        b.nextBytes(x);
        if (t > 0) x[0] &= ((1 << t) - 1);
        else x[0] = 0;
        this.fromString(x, 256);
    }
}

// (public) convert to bigendian byte array

function bnToByteArray() {
    var i = this.t,
        r = new Array();
    r[0] = this.s;
    var p = this.DB - (i * this.DB) % 8,
        d, k = 0;
    if (i-- > 0) {
        if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p) r[k++] = d | (this.s << (this.DB - p));
        while (i >= 0) {
            if (p < 8) {
                d = (this[i] & ((1 << p) - 1)) << (8 - p);
                d |= this[--i] >> (p += this.DB - 8);
            }
            else {
                d = (this[i] >> (p -= 8)) & 0xff;
                if (p <= 0) {
                    p += this.DB;
                    --i;
                }
            }
            if ((d & 0x80) != 0) d |= -256;
            if (k == 0 && (this.s & 0x80) != (d & 0x80))++k;
            if (k > 0 || d != this.s) r[k++] = d;
        }
    }
    return r;
}

function bnEquals(a) {
    return (this.compareTo(a) == 0);
}

function bnMin(a) {
    return (this.compareTo(a) < 0) ? this : a;
}

function bnMax(a) {
    return (this.compareTo(a) > 0) ? this : a;
}

// (protected) r = this op a (bitwise)

function bnpBitwiseTo(a, op, r) {
    var i, f, m = Math.min(a.t, this.t);
    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
    if (a.t < this.t) {
        f = a.s & this.DM;
        for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
        r.t = this.t;
    }
    else {
        f = this.s & this.DM;
        for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
        r.t = a.t;
    }
    r.s = op(this.s, a.s);
    r.clamp();
}

// (public) this & a

function op_and(x, y) {
    return x & y;
}

function bnAnd(a) {
    var r = nbi();
    this.bitwiseTo(a, op_and, r);
    return r;
}

// (public) this | a

function op_or(x, y) {
    return x | y;
}

function bnOr(a) {
    var r = nbi();
    this.bitwiseTo(a, op_or, r);
    return r;
}

// (public) this ^ a

function op_xor(x, y) {
    return x ^ y;
}

function bnXor(a) {
    var r = nbi();
    this.bitwiseTo(a, op_xor, r);
    return r;
}

// (public) this & ~a

function op_andnot(x, y) {
    return x & ~y;
}

function bnAndNot(a) {
    var r = nbi();
    this.bitwiseTo(a, op_andnot, r);
    return r;
}

// (public) ~this

function bnNot() {
    var r = nbi();
    for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
    r.t = this.t;
    r.s = ~this.s;
    return r;
}

// (public) this << n

function bnShiftLeft(n) {
    var r = nbi();
    if (n < 0) this.rShiftTo(-n, r);
    else this.lShiftTo(n, r);
    return r;
}

// (public) this >> n

function bnShiftRight(n) {
    var r = nbi();
    if (n < 0) this.lShiftTo(-n, r);
    else this.rShiftTo(n, r);
    return r;
}

// return index of lowest 1-bit in x, x < 2^31

function lbit(x) {
    if (x == 0) return -1;
    var r = 0;
    if ((x & 0xffff) == 0) {
        x >>= 16;
        r += 16;
    }
    if ((x & 0xff) == 0) {
        x >>= 8;
        r += 8;
    }
    if ((x & 0xf) == 0) {
        x >>= 4;
        r += 4;
    }
    if ((x & 3) == 0) {
        x >>= 2;
        r += 2;
    }
    if ((x & 1) == 0)++r;
    return r;
}

// (public) returns index of lowest 1-bit (or -1 if none)

function bnGetLowestSetBit() {
    for (var i = 0; i < this.t; ++i)
    if (this[i] != 0) return i * this.DB + lbit(this[i]);
    if (this.s < 0) return this.t * this.DB;
    return -1;
}

// return number of 1 bits in x

function cbit(x) {
    var r = 0;
    while (x != 0) {
        x &= x - 1;
        ++r;
    }
    return r;
}

// (public) return number of set bits

function bnBitCount() {
    var r = 0,
        x = this.s & this.DM;
    for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
    return r;
}

// (public) true iff nth bit is set

function bnTestBit(n) {
    var j = Math.floor(n / this.DB);
    if (j >= this.t) return (this.s != 0);
    return ((this[j] & (1 << (n % this.DB))) != 0);
}

// (protected) this op (1<<n)

function bnpChangeBit(n, op) {
    var r = BigInteger.ONE.shiftLeft(n);
    this.bitwiseTo(r, op, r);
    return r;
}

// (public) this | (1<<n)

function bnSetBit(n) {
    return this.changeBit(n, op_or);
}

// (public) this & ~(1<<n)

function bnClearBit(n) {
    return this.changeBit(n, op_andnot);
}

// (public) this ^ (1<<n)

function bnFlipBit(n) {
    return this.changeBit(n, op_xor);
}

// (protected) r = this + a

function bnpAddTo(a, r) {
    var i = 0,
        c = 0,
        m = Math.min(a.t, this.t);
    while (i < m) {
        c += this[i] + a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
    }
    if (a.t < this.t) {
        c += a.s;
        while (i < this.t) {
            c += this[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        c += this.s;
    }
    else {
        c += this.s;
        while (i < a.t) {
            c += a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        c += a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c > 0) r[i++] = c;
    else if (c < -1) r[i++] = this.DV + c;
    r.t = i;
    r.clamp();
}

// (public) this + a

function bnAdd(a) {
    var r = nbi();
    this.addTo(a, r);
    return r;
}

// (public) this - a

function bnSubtract(a) {
    var r = nbi();
    this.subTo(a, r);
    return r;
}

// (public) this * a

function bnMultiply(a) {
    var r = nbi();
    this.multiplyTo(a, r);
    return r;
}

// (public) this^2

function bnSquare() {
    var r = nbi();
    this.squareTo(r);
    return r;
}

// (public) this / a

function bnDivide(a) {
    var r = nbi();
    this.divRemTo(a, r, null);
    return r;
}

// (public) this % a

function bnRemainder(a) {
    var r = nbi();
    this.divRemTo(a, null, r);
    return r;
}

// (public) [this/a,this%a]

function bnDivideAndRemainder(a) {
    var q = nbi(),
        r = nbi();
    this.divRemTo(a, q, r);
    return new Array(q, r);
}

// (protected) this *= n, this >= 0, 1 < n < DV

function bnpDMultiply(n) {
    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
    ++this.t;
    this.clamp();
}

// (protected) this += n << w words, this >= 0

function bnpDAddOffset(n, w) {
    if (n == 0) return;
    while (this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while (this[w] >= this.DV) {
        this[w] -= this.DV;
        if (++w >= this.t) this[this.t++] = 0;
        ++this[w];
    }
}

// A "null" reducer

function NullExp() {}

function nNop(x) {
    return x;
}

function nMulTo(x, y, r) {
    x.multiplyTo(y, r);
}

function nSqrTo(x, r) {
    x.squareTo(r);
}

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

// (public) this^e

function bnPow(e) {
    return this.exp(e, new NullExp());
}

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.

function bnpMultiplyLowerTo(a, n, r) {
    var i = Math.min(this.t + a.t, n);
    r.s = 0; // assumes a,this >= 0
    r.t = i;
    while (i > 0) r[--i] = 0;
    var j;
    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
    r.clamp();
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.

function bnpMultiplyUpperTo(a, n, r) {
    --n;
    var i = r.t = this.t + a.t - n;
    r.s = 0; // assumes a,this >= 0
    while (--i >= 0) r[i] = 0;
    for (i = Math.max(n - this.t, 0); i < a.t; ++i)
    r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
    r.clamp();
    r.drShiftTo(1, r);
}

// Barrett modular reduction

function Barrett(m) {
    // setup Barrett
    this.r2 = nbi();
    this.q3 = nbi();
    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
    this.mu = this.r2.divide(m);
    this.m = m;
}

function barrettConvert(x) {
    if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
    else if (x.compareTo(this.m) < 0) return x;
    else {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
    }
}

function barrettRevert(x) {
    return x;
}

// x = x mod m (HAC 14.42)

function barrettReduce(x) {
    x.drShiftTo(this.m.t - 1, this.r2);
    if (x.t > this.m.t + 1) {
        x.t = this.m.t + 1;
        x.clamp();
    }
    this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
    this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
    while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
    x.subTo(this.r2, x);
    while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
}

// r = x^2 mod m; x != r

function barrettSqrTo(x, r) {
    x.squareTo(r);
    this.reduce(r);
}

// r = x*y mod m; x,y != r

function barrettMulTo(x, y, r) {
    x.multiplyTo(y, r);
    this.reduce(r);
}

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

// (public) this^e % m (HAC 14.85)

function bnModPow(e, m) {
    var i = e.bitLength(),
        k, r = nbv(1),
        z;
    if (i <= 0) return r;
    else if (i < 18) k = 1;
    else if (i < 48) k = 3;
    else if (i < 144) k = 4;
    else if (i < 768) k = 5;
    else k = 6;
    if (i < 8) z = new Classic(m);
    else if (m.isEven()) z = new Barrett(m);
    else z = new Montgomery(m);

    // precomputation
    var g = new Array(),
        n = 3,
        k1 = k - 1,
        km = (1 << k) - 1;
    g[1] = z.convert(this);
    if (k > 1) {
        var g2 = nbi();
        z.sqrTo(g[1], g2);
        while (n <= km) {
            g[n] = nbi();
            z.mulTo(g2, g[n - 2], g[n]);
            n += 2;
        }
    }

    var j = e.t - 1,
        w, is1 = true,
        r2 = nbi(),
        t;
    i = nbits(e[j]) - 1;
    while (j >= 0) {
        if (i >= k1) w = (e[j] >> (i - k1)) & km;
        else {
            w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
            if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
        }

        n = k;
        while ((w & 1) == 0) {
            w >>= 1;
            --n;
        }
        if ((i -= n) < 0) {
            i += this.DB;
            --j;
        }
        if (is1) { // ret == 1, don't bother squaring or multiplying it
            g[w].copyTo(r);
            is1 = false;
        }
        else {
            while (n > 1) {
                z.sqrTo(r, r2);
                z.sqrTo(r2, r);
                n -= 2;
            }
            if (n > 0) z.sqrTo(r, r2);
            else {
                t = r;
                r = r2;
                r2 = t;
            }
            z.mulTo(r2, g[w], r);
        }

        while (j >= 0 && (e[j] & (1 << i)) == 0) {
            z.sqrTo(r, r2);
            t = r;
            r = r2;
            r2 = t;
            if (--i < 0) {
                i = this.DB - 1;
                --j;
            }
        }
    }
    return z.revert(r);
}

// (public) gcd(this,a) (HAC 14.54)

function bnGCD(a) {
    var x = (this.s < 0) ? this.negate() : this.clone();
    var y = (a.s < 0) ? a.negate() : a.clone();
    if (x.compareTo(y) < 0) {
        var t = x;
        x = y;
        y = t;
    }
    var i = x.getLowestSetBit(),
        g = y.getLowestSetBit();
    if (g < 0) return x;
    if (i < g) g = i;
    if (g > 0) {
        x.rShiftTo(g, x);
        y.rShiftTo(g, y);
    }
    while (x.signum() > 0) {
        if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
        if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
        if (x.compareTo(y) >= 0) {
            x.subTo(y, x);
            x.rShiftTo(1, x);
        }
        else {
            y.subTo(x, y);
            y.rShiftTo(1, y);
        }
    }
    if (g > 0) y.lShiftTo(g, y);
    return y;
}

// (protected) this % n, n < 2^26

function bnpModInt(n) {
    if (n <= 0) return 0;
    var d = this.DV % n,
        r = (this.s < 0) ? n - 1 : 0;
    if (this.t > 0) if (d == 0) r = this[0] % n;
    else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
    return r;
}

// (public) 1/this % m (HAC 14.61)

function bnModInverse(m) {
    var ac = m.isEven();
    if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
    var u = m.clone(),
        v = this.clone();
    var a = nbv(1),
        b = nbv(0),
        c = nbv(0),
        d = nbv(1);
    while (u.signum() != 0) {
        while (u.isEven()) {
            u.rShiftTo(1, u);
            if (ac) {
                if (!a.isEven() || !b.isEven()) {
                    a.addTo(this, a);
                    b.subTo(m, b);
                }
                a.rShiftTo(1, a);
            }
            else if (!b.isEven()) b.subTo(m, b);
            b.rShiftTo(1, b);
        }
        while (v.isEven()) {
            v.rShiftTo(1, v);
            if (ac) {
                if (!c.isEven() || !d.isEven()) {
                    c.addTo(this, c);
                    d.subTo(m, d);
                }
                c.rShiftTo(1, c);
            }
            else if (!d.isEven()) d.subTo(m, d);
            d.rShiftTo(1, d);
        }
        if (u.compareTo(v) >= 0) {
            u.subTo(v, u);
            if (ac) a.subTo(c, a);
            b.subTo(d, b);
        }
        else {
            v.subTo(u, v);
            if (ac) c.subTo(a, c);
            d.subTo(b, d);
        }
    }
    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
    if (d.compareTo(m) >= 0) return d.subtract(m);
    if (d.signum() < 0) d.addTo(m, d);
    else return d;
    if (d.signum() < 0) return d.add(m);
    else return d;
}

var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

// (public) test primality with certainty >= 1-.5^t

function bnIsProbablePrime(t) {
    var i, x = this.abs();
    if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
        for (i = 0; i < lowprimes.length; ++i)
        if (x[0] == lowprimes[i]) return true;
        return false;
    }
    if (x.isEven()) return false;
    i = 1;
    while (i < lowprimes.length) {
        var m = lowprimes[i],
            j = i + 1;
        while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
        m = x.modInt(m);
        while (i < j) if (m % lowprimes[i++] == 0) return false;
    }
    return x.millerRabin(t);
}

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)

function bnpMillerRabin(t) {
    var n1 = this.subtract(BigInteger.ONE);
    var k = n1.getLowestSetBit();
    if (k <= 0) return false;
    var r = n1.shiftRight(k);
    t = (t + 1) >> 1;
    if (t > lowprimes.length) t = lowprimes.length;
    var a = nbi();
    for (var i = 0; i < t; ++i) {
        //Pick bases at random, instead of starting at 2
        a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
        var y = a.modPow(r, this);
        if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
            var j = 1;
            while (j++ < k && y.compareTo(n1) != 0) {
                y = y.modPowInt(2, this);
                if (y.compareTo(BigInteger.ONE) == 0) return false;
            }
            if (y.compareTo(n1) != 0) return false;
        }
    }
    return true;
}

// protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

// public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

// JSBN-specific extension
BigInteger.prototype.square = bnSquare;




















var RSAPublicKey = function($modulus, $encryptionExponent) {
    this.modulus = new BigInteger(Hex.encode($modulus), 16);
    this.encryptionExponent = new BigInteger(Hex.encode($encryptionExponent), 16);
}

var UTF8 = {
    encode: function($input) {
        $input = $input.replace(/\r\n/g,"\n");
        var $output = "";
        for (var $n = 0; $n < $input.length; $n++) {
            var $c = $input.charCodeAt($n);
            if ($c < 128) {
                $output += String.fromCharCode($c);
            } else if (($c > 127) && ($c < 2048)) {
                $output += String.fromCharCode(($c >> 6) | 192);
                $output += String.fromCharCode(($c & 63) | 128);
            } else {
                $output += String.fromCharCode(($c >> 12) | 224);
                $output += String.fromCharCode((($c >> 6) & 63) | 128);
                $output += String.fromCharCode(($c & 63) | 128);
            }
        }
        return $output;
    },
    decode: function($input) {
        var $output = "";
        var $i = 0;
        var $c = $c1 = $c2 = 0;
        while ( $i < $input.length ) {
            $c = $input.charCodeAt($i);
            if ($c < 128) {
                $output += String.fromCharCode($c);
                $i++;
            } else if(($c > 191) && ($c < 224)) {
                $c2 = $input.charCodeAt($i+1);
                $output += String.fromCharCode((($c & 31) << 6) | ($c2 & 63));
                $i += 2;
            } else {
                $c2 = $input.charCodeAt($i+1);
                $c3 = $input.charCodeAt($i+2);
                $output += String.fromCharCode((($c & 15) << 12) | (($c2 & 63) << 6) | ($c3 & 63));
                $i += 3;
            }
        }
        return $output;
    }
};

var Base64 = {
    base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function($input) {
        if (!$input) {
            return false;
        }
        //$input = UTF8.encode($input);
        var $output = "";
        var $chr1, $chr2, $chr3;
        var $enc1, $enc2, $enc3, $enc4;
        var $i = 0;
        do {
            $chr1 = $input.charCodeAt($i++);
            $chr2 = $input.charCodeAt($i++);
            $chr3 = $input.charCodeAt($i++);
            $enc1 = $chr1 >> 2;
            $enc2 = (($chr1 & 3) << 4) | ($chr2 >> 4);
            $enc3 = (($chr2 & 15) << 2) | ($chr3 >> 6);
            $enc4 = $chr3 & 63;
            if (isNaN($chr2)) $enc3 = $enc4 = 64;
            else if (isNaN($chr3)) $enc4 = 64;
            $output += this.base64.charAt($enc1) + this.base64.charAt($enc2) + this.base64.charAt($enc3) + this.base64.charAt($enc4);
        } while ($i < $input.length);
        return $output;
    },
    decode: function($input) {
        if(!$input) return false;
        $input = $input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        var $output = "";
        var $enc1, $enc2, $enc3, $enc4;
        var $i = 0;
        do {
            $enc1 = this.base64.indexOf($input.charAt($i++));
            $enc2 = this.base64.indexOf($input.charAt($i++));
            $enc3 = this.base64.indexOf($input.charAt($i++));
            $enc4 = this.base64.indexOf($input.charAt($i++));
            $output += String.fromCharCode(($enc1 << 2) | ($enc2 >> 4));
            if ($enc3 != 64) $output += String.fromCharCode((($enc2 & 15) << 4) | ($enc3 >> 2));
            if ($enc4 != 64) $output += String.fromCharCode((($enc3 & 3) << 6) | $enc4);
        } while ($i < $input.length);
        return $output; //UTF8.decode($output);
    }
};

var Hex = {
    hex: "0123456789abcdef",
    encode: function($input) {
        if(!$input) return false;
        var $output = "";
        var $k;
        var $i = 0;
        do {
            $k = $input.charCodeAt($i++);
            $output += this.hex.charAt(($k >> 4) &0xf) + this.hex.charAt($k & 0xf);
        } while ($i < $input.length);
        return $output;
    },
    decode: function($input) {
        if(!$input) return false;
        $input = $input.replace(/[^0-9abcdef]/g, "");
        var $output = "";
        var $i = 0;
        do {
            $output += String.fromCharCode(((this.hex.indexOf($input.charAt($i++)) << 4) & 0xf0) | (this.hex.indexOf($input.charAt($i++)) & 0xf));
        } while ($i < $input.length);
        return $output;
    }
};

var ASN1Data = function($data) {
    this.error = false;
    this.parse = function($data) {
        if (!$data) {
            this.error = true;
            return null;
        }
        var $result = [];
        while($data.length > 0) {
            // get the tag
            var $tag = $data.charCodeAt(0);
            $data = $data.substr(1);
            // get length
            var $length = 0;
            // ignore any null tag
            if (($tag & 31) == 0x5) $data = $data.substr(1);
            else {
                if ($data.charCodeAt(0) & 128) {
                    var $lengthSize = $data.charCodeAt(0) & 127;
                    $data = $data.substr(1);
                    if($lengthSize > 0) $length = $data.charCodeAt(0);
                    if($lengthSize > 1)    $length = (($length << 8) | $data.charCodeAt(1));
                    if($lengthSize > 2) {
                        this.error = true;
                        return null;
                    }
                    $data = $data.substr($lengthSize);
                } else {
                    $length = $data.charCodeAt(0);
                    $data = $data.substr(1);
                }
            }
            // get value
            var $value = "";
            if($length) {
                if ($length > $data.length){
                    this.error = true;
                    return null;
                }
                $value = $data.substr(0, $length);
                $data = $data.substr($length);
            }
            if ($tag & 32)
                $result.push(this.parse($value)); // sequence
            else
                $result.push(this.value(($tag & 128) ? 4 : ($tag & 31), $value));
        }
        return $result;
    };
    this.value = function($tag, $data) {
        if ($tag == 1)
            return $data ? true : false;
        else if ($tag == 2) //integer
            return $data;
        else if ($tag == 3) //bit string
            return this.parse($data.substr(1));
        else if ($tag == 5) //null
            return null;
        else if ($tag == 6){ //ID
            var $res = [];
            var $d0 = $data.charCodeAt(0);
            $res.push(Math.floor($d0 / 40));
            $res.push($d0 - $res[0]*40);
            var $stack = [];
            var $powNum = 0;
            var $i;
            for($i=1;$i<$data.length;$i++){
                var $token = $data.charCodeAt($i);
                $stack.push($token & 127);
                if ( $token & 128 )
                    $powNum++;
                else {
                    var $j;
                    var $sum = 0;
                    for($j=0;$j<$stack.length;$j++)
                        $sum += $stack[$j] * Math.pow(128, $powNum--);
                    $res.push($sum);
                    $powNum = 0;
                    $stack = [];
                }
            }
            return $res.join(".");
        }
        return null;
    }
    this.data = this.parse($data);
};

var RSA = {
    getPublicKey: function($pem) {
        if($pem.length<50) return false;
        //if($pem.substr(0,26)!="-----BEGIN PUBLIC KEY-----") return false;
        //$pem = $pem.substr(26);
        //if($pem.substr($pem.length-24)!="-----END PUBLIC KEY-----") return false;
        //$pem = $pem.substr(0,$pem.length-24);
        $pem = new ASN1Data(Base64.decode($pem));
        if($pem.error) return false;
        $pem = $pem.data;
        if($pem[0][0][0]=="1.2.840.113549.1.1.1")
            return new RSAPublicKey($pem[0][1][0][0], $pem[0][1][0][1]);
        return false;
    },
    encrypt: function($data, $pubkey) {
        if (!$pubkey) return false;
        var bytes = ($pubkey.modulus.bitLength()+7)>>3;
        $data = this.pkcs1pad2($data,bytes);
        if(!$data) return false;
        $data = $data.modPowInt($pubkey.encryptionExponent, $pubkey.modulus);
        if(!$data) return false;
        $data = $data.toString(16);
        while ($data.length < bytes*2)
            $data = '0' + $data;
        return Base64.encode(Hex.decode($data));
    },
    pkcs1pad2: function($data, $keysize) {
        if($keysize < $data.length + 11)
            return null;
        var $buffer = [];
        var $i = $data.length - 1;
        while($i >= 0 && $keysize > 0)
            $buffer[--$keysize] = $data.charCodeAt($i--);
        $buffer[--$keysize] = 0;
        while($keysize > 2)
            $buffer[--$keysize] = Math.floor(Math.random()*254) + 1;
        $buffer[--$keysize] = 2;
        $buffer[--$keysize] = 0;
        return new BigInteger($buffer);
    }
}

/*
 *  Global functions
 */

const _ = e => document.querySelector(e) || false
const _a = e => document.querySelectorAll(e) || false
const _f = f => ('function' == typeof f ? f : () => null)

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
			.replace(/([^\w]|\s|\*|_|)(\-([^/s]|.*?)\-)([^\w]|\s|\*|_|)/g, '$1<s>$3</s>$4')
}

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

/**
 * Home Namespace
 */

const Home = {

    init: () => {},
    show: () => SHOW.page('home'),

}

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
