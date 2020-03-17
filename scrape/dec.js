const dl = require('./dl.js');
let dec = {};

class AndyDecarli {
	constructor() {
		this.sysMap = {
			wiiu: 'Nintendo Wii U',
			'3ds': 'Nintendo 3DS',
			ds: 'Nintendo DS',
			ps3: 'Sony PlayStation 3',
			ps2: 'Sony PlayStation 2',
			psp: 'Sony PSP',
			xbox360: 'Xbox 360',
			gba: 'Game Boy Advance',
			wii: 'Nintendo Wii',
			gcn: 'Nintendo Game Cube',
			n64: 'Nintendo 64',
			snes: 'Super Nintendo',
			nes: 'Nintendo'
		};
	}

	wrapUrl(url) {
		return 'd';
	}

	unwrapUrl(data) {
		let _sys = this.sysMap[data[0]];
		let title = data[1];
		let url = `http://andydecarli.com/Video Games/Collection/${_sys}/Scans/Full Size/${_sys} ${title}`;
		url = url.replace(/ /g, '%20');
		return url;
	}

	async _dlImg(title, dir, _sys) {
		this.unwrapUrl([_sys, title]);
		log(url);
		let res = await dl(url + `%20Front%20Cover.jpg`, dir + '/box.jpg');
		if (res && prefs.ui.getBackCoverHQ) {
			await dl(url + `%20Back%20Cover.jpg`, dir + '/boxBack.jpg');
		}
		return res;
	}

	async dlImg(game, dir, name, _sys) {
		if (name != 'box' || _sys == 'arcade') {
			return;
		}
		let res;
		let title = game.title.replace(/[\:]/g, '');
		if (_sys != 'switch') {
			if (_sys != 'wii') {
				res = await this._dlImg(title, dir, _sys);
			} else if (game.id.length > 4) {
				res = await this._dlImg(title, dir, 'gcn');
				if (!res) {
					res = await this._dlImg(title, dir, 'wii');
				}
			} else {
				res = await this._dlImg(title, dir, 'n64');
				if (!res) {
					res = await this._dlImg(title, dir, 'snes');
				}
				if (!res) {
					res = await this._dlImg(title, dir, 'nes');
				}
			}
			if (res) {
				return res;
			}
		}
	}

	async load() {
		if (dec[sys]) {
			return;
		}
		if (!browser) {
			er('browser not loaded');
			return;
		}
		let tcpPath = __root + `/scrape/tcp/${sys}Tcp.json`;
		if (await fs.exists(tcpPath)) {
			dec[sys] = JSON.parse(await fs.readFile(tcpPath));
			return;
		}
		dec[sys] = {};

		let url = `https://andydecarli.com/Video Games/Collection Pages/Collection ${this.sysMap[sys]}.html`;
		url = url.replace(/ /g, '%20');

		let $elems;
		if (!$elems) $elems = await browser.goTo(url);
		if (!$elems) return;
		$elems = $elems.find('table tbody tr td table tbody').eq(2);
		if (!$elems.length) return;
		$elems = $elems.find('tr');

		for (let i = 0; i < $elems.length; i++) {
			let title = $elems.eq(i).find('td').eq(0).text();
			dec[sys][title] = 1;
		}
		log(dec[sys]);

		await fs.outputFile(tcpPath, JSON.stringify(dec[sys]));
	}

	async getImgUrls(game, name) {
		let img = {};
		if (dec[sys][game.title]) {
			img[name] = 'd';
		}
		return img;
	}
}

module.exports = new AndyDecarli();
