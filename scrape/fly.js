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
			img[name] = $images.eq(0).attr('data-highres');
			if (!img[name]) img[name] = $images.eq(0).attr('src');
			if (!img[name]) continue;
			if (arg.dl) {
				await dl(img[name], `${__rootDir}/dev/img/${game.id}/${name}.${img[name].substr(-3)}`);
			}
			if ($images.length > 1) {
				name += 'Back';
				img[name] = $images.eq(1).attr('data-highres');
				if (!img[name]) img[name] = $images.eq(1).attr('src');
				if (img[name] && arg.dl) {
					await dl(img[name], `${__rootDir}/dev/img/${game.id}/${name}.${img[name].substr(-3)}`);
				}
				if (!img[name]) delete img[name];
			}
			for (let i = 1; i < $images.length; i++) {
				img[name + i] = $images.eq(i + 1).attr('data-highres');
				if (!img[name + i]) img[name + i] = $images.eq(i + 1).attr('src');
				if (!img[name + i]) delete img[name + i];
			}
			log(img);
			return img;
		}
		return;
	}
}

module.exports = new FlyerFeverScraper();
