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
