const dl = require('./dl.js');

class MrDo {
	constructor() {}

	async dlImg(sys, game, dir, name) {
		if (name != 'box' || sys != 'mame') {
			return;
		}
		let url = `http://www.mameworld.info/mrdo/artwork/${game.id}.zip`;
		let res = await dl(url, dir);
		// TODO rename files

		return res;
	}
}

module.exports = new MrDo();
