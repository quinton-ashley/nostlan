const dl = require('./dl.js');

class AndyDecarli {
	constructor() {
		this.sysMapForAndy = {
			wiiu: 'Nintendo Wii U',
			'3ds': 'Nintendo 3DS',
			ds: 'Nintendo DS',
			ps3: 'Sony PlayStation 3',
			ps2: 'Sony PlayStation 2',
			xbox360: 'Xbox 360',
			gba: 'Game Boy Advance',
			wii: 'Nintendo Wii',
			gcn: 'Nintendo Game Cube',
			n64: 'Nintendo 64',
			snes: 'Super Nintendo',
			nes: 'Nintendo'
		};
	}

	async _dlImg(title, dir, _sys) {
		_sys = this.sysMapForAndy[_sys];
		let url = `http://andydecarli.com/Video Games/Collection/${_sys}/Scans/Full Size/${_sys} ${title}`;
		url = url.replace(/ /g, '%20');
		log(url);
		let res = await dl(url + `%20Front%20Cover.jpg`, dir + '/box.jpg');
		if (res && prefs.ui.getBackCoverHQ) {
			await dl(url + `%20Back%20Cover.jpg`, dir + '/boxBack.jpg');
		}
		return res;
	}

	async dlImg(game, dir, name, _sys) {
		if (name != 'box' || _sys == 'mame') {
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
}

module.exports = new AndyDecarli();
