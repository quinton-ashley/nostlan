const dl = require('./dl.js');
let availableImgs = [
	"box",
	"cart",
	"cover",
	"coverFull",
	"disc"
];

class Gamestdb {
	constructor() {}

	async dlImg(game, dir, name) {
		if (!availableImgs.includes(name) || sys == 'mame' || sys == 'ps2' || sys == 'gba') {
			return;
		}
		if (sys == 'gcn') sys = 'wii';
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
			let locale = 'US';
			if (sys == 'ps3') {
				if (id[2] == 'E') {
					locale = 'EN';
				}
			}
			url = `https://art.gametdb.com/${sys}/${((name!='coverFull')?name:'coverfull')}HQ/${locale}/${id}`;
			log(url);
			res = await dl(url, file, true);
			if (res) {
				return res;
			}
			url = url.replace(name + 'HQ', name + 'M');
			res = await dl(url, file, true);
			if (res) {
				return res;
			}
			url = url.replace(name + 'M', name);
			res = await dl(url, file, true);
			if (res) {
				return res;
			}
		}
	}
}

module.exports = new Gamestdb();
