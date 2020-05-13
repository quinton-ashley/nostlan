const dl = require('./dl.js');
let availableImgs = [
	"box",
	"cart",
	"cover",
	"coverFull",
	"disc"
];
let regions = {
	nintendo: {
		E: 'US',
		P: 'EN',
		J: 'JA'
	},
	ps3: {
		U: 'US',
		E: 'EN',
		J: 'JA'
	}
}

class Gamestdb {
	constructor() {}

	async dlImg(game, dir, name) {
		// TODO change to just the systems on gametdb
		if (!availableImgs.includes(name) || sys == 'arcade' || sys == 'ps2' || sys == 'gba') {
			return;
		}
		// get image from gametdb
		let res, url;
		let file = `${dir}/${name}`;
		let id = game.id;
		for (let i = 0; i < 3; i++) {
			if (sys != 'switch' && i == 1) {
				break;
			}
			if (i == 1) {
				id = id.substr(0, id.length - 1) + 'B';
			}
			if (i == 2) {
				id = id.substr(0, id.length - 1) + 'C';
			}
			let locale;
			if (sys != 'ps3') {
				locale = regions.nintendo[id[3]];
			} else {
				locale = regions.ps3[id[2]];
			}
			if (!locale) locale = 'US';
			let _sys = (sys != 'n3ds') ? sys : '3ds';
			url = `https://art.gametdb.com/${_sys}/${((name!='coverFull')?name:'coverfull')}HQ/${locale}/${id}`;
			res = await dl(url, file, {
				unknownExt: true
			});
			if (res) {
				return res;
			}
			url = url.replace(name + 'HQ', name + 'M');
			res = await dl(url, file, {
				unknownExt: true
			});
			if (res) {
				return res;
			}
			url = url.replace(name + 'M', name);
			res = await dl(url, file, {
				unknownExt: true
			});
			if (res) {
				return res;
			}
		}
	}
}

module.exports = new Gamestdb();
