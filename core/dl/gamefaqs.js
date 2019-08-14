const dl = require('./dl.js');

class Gamefaqs {
	constructor() {}

	async dlImg(url, dir, name) {
		let ext = url.substr(-4).toLowerCase();
		let imgPath = dir + '/' + name + ext;
		log(url);
		let res;
		if (!name.includes('Side')) {
			res = await dl(url, imgPath);
		}
		if (res || name.includes('Side')) {
			log(url.replace('front', 'side'));
			if (!name.includes('Side')) {
				imgPath = dir + '/' + name + 'Side' + ext;
			} else {
				imgPath = dir + '/' + name + ext;
			}
			await dl(url.replace('front', 'side'), imgPath);
		}
		if (res && prefs.ui.getBackCoverHQ) {
			log(url.replace('front', 'back'));
			if (!name.includes('Side')) {
				imgPath = dir + '/' + name + 'Back' + ext;
			} else {
				imgPath = dir + '/' + name.replace('Side', 'Back') + ext;
			}
			await dl(url.replace('front', 'back'), imgPath);
		}
		return res;
	}
}

module.exports = new Gamefaqs();
