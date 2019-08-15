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
		url = $page.find('.posts article aside.metadata').eq(0).attr('data-permalink');
		if (!url) return;
		log(url);
		$page = await browser.goTo(url);
		if (!$page) return;
		let $images = $page.find('.post img');
		if (!$images.length) return;
		let img = {};
		img[name] = $images.eq(0).attr('data-highres');
		if ($images.length > 1) {
			img[name + 'Back'] = $images.eq(1).attr('data-highres');
		}
		if (!img[name]) return;
		log(img);
		// await dl(url, __rootDir + '/scrape/img/' + game.id + url.substr(-4));
		return img;
	}
}

module.exports = new FlyerFeverScraper();
