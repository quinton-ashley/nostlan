const dl = require(__rootDir + '/core/dl/dl.js');

class FlyerFeverScraper {
	constructor() {}

	async getImgUrls(sys, game, name) {
		if (!browser) {
			er('browser not loaded');
			return;
		}
		let searchTerm = browser.urlEncode(game.title.replace(/ *\([^\)]*\) */g, ''));
		log(searchTerm);
		let url = 'https://www.flyerfever.com/search/' + searchTerm;
		let $page = await browser.goTo(url);
		if (!$page) return;
		for (let i = 0; i < $page.find('.posts article aside.metadata').length; i++) {
			url = $page.find('.posts article aside.metadata').eq(i).attr('data-permalink');
			if (!url) continue;
			log(url);
			let $page1 = await browser.goTo(url);
			if (!$page1) continue;
			let $images = $page1.find('.post .row .pxu-photo img');
			if (!$images.length) continue;
			let img = {};

			let _name = name + 'Back';
			for (let j = 0; j < $images.length; j++) {
				if (j == 1) name += 'Back';
				if (j > 1) name = _name + (j - 1);
				img[name] = $images.eq(j).attr('data-highres');
				if (!img[name]) img[name] = $images.eq(j).attr('src');
				if (j == 0 && !img[name]) break;
				if (!img[name]) {
					delete img[name];
				} else if (arg.dl) {
					await dl(img[name], `${__rootDir}/dev/img/${game.id}/${name}.${img[name].substr(-3)}`);
				}
			}
			if (!img[name]) continue;
			log(img);
			return img;
		}
		return;
	}
}

module.exports = new FlyerFeverScraper();
