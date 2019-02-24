const dl = require('./dl.js');

class Gamefaqs {
	constructor() {

	}

	async dlImg(url, dir, name) {
		let ext = url.substr(-4).toLowerCase();
		log(url);
		if (name != 'coverSide') {
			res = await dl(url, dir + '/cover' + ext);
		}
		if (res || name == 'coverSide') {
			log(url);
			await dl(url.replace('front', 'side'), dir + '/coverSide' + ext);
		}
		if (res && prefs.ui.getBackCoverHQ) {
			log(url);
			await dl(url.replace('front', 'back'), dir + '/coverBack' + ext);
		}
		return res;
	}
}

module.exports = new Gamefaqs();
