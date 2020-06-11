const dl = require('./dl.js');
const Fuse = require('fuse.js');
let regions = {
	ps2: {
		A: 'AS', // Asia
		// C: 'China', // China
		E: 'EU', // Europe
		// H: 'Hong Kong', // Hong Kong
		J: 'JP', // Japan
		P: 'JP', // Japan (PS1/PS2)
		// K: 'Korea', // Korea
		U: 'US' // USA
	}
};
regions.ps3 = regions.ps2;
regions.ps4 = regions.ps2;
let gfs = {};

class GameFaqsScraper {
	constructor() {}

	wrapUrl(url) {
		// the site that gamefaqs stores images on might change in the
		// future, it used to be gamefaqs.akamaized.net but this was changed
		// at some point before March 2020 to gamefaqs1.cbsistatic.com
		let regex = /https\:\/\/gamefaqs1.cbsistatic.com\/box\/(\d)\/(\d)\/(\d)\/(\d+)_front.jpg/;
		return url.replace(regex, 'g $1$2$3$4');
	}

	unwrapUrl(data) {
		let d = data[0];
		let url = 'https://gamefaqs1.cbsistatic.com/box';
		return `${url}/${d[0]}/${d[1]}/${d[2]}/${d.slice(3)}_front.jpg`;
	}

	async getImgUrls(game, name) {
		if (!browser) {
			er('browser not loaded');
			return;
		}
		let $page, url, res, ext;
		url = await this.getGameUrl(game);
		if (!url) {
			log('game not found on gamefaqs');
			return;
		}
		log(url);
		$page = await browser.goTo(url + '/images');
		if (!$page) {
			return;
		}
		let region = game.id[2];
		if (regions[sys]) {
			region = regions[sys][region] || 'US';
		} else {
			region = 'US';
		}
		// search for the image from the region
		url = $page.find(`#content .region:contains("${region}")`).eq(0).prev().attr('href');
		// default to the first image
		if (!url) {
			url = $page.find(`#content .region`).eq(0).prev().attr('href');
		}
		if (!url) {
			return;
		}
		log(url);
		url = 'https://gamefaqs.gamespot.com' + url;
		$page = await browser.goTo(url);
		if (!$page) {
			return;
		}
		$page = $page.find('#content .img img');
		url = $page.eq(0).attr('src');
		if (!url) {
			return;
		}
		log(url);
		let img = {};
		img[name] = this.wrapUrl(url);
		// await dl(url, __root + '/scrape/img/' + game.id + url.slice(-4));
		return img;
	}

	async getGameUrl(game) {
		if (!browser) {
			er('browser not loaded');
			return;
		}
		let idx = game.title[0].toLowerCase();
		if (idx == idx.toUpperCase()) idx = '00';

		let fusePrms = {
			shouldSort: true,
			tokenize: true,
			matchAllTokens: true,
			includeScore: true,
			threshold: 0.1,
			location: 0,
			distance: 5,
			maxPatternLength: 64,
			minMatchCharLength: 1,
			keys: [
				"title"
			]
		};
		let fuse = new Fuse(gfs[sys][idx], fusePrms);
		let results = fuse.search(game.title.slice(0, 64));
		log(results);
		let url;
		if (results && results.length) url = results[0].item.url;

		if (!url && sys == 'wii') {
			if (game.id.length > 4) {
				url = await this.getGameUrl('gcn', game);
			} else {
				url = await this.getGameUrl('n64', game);
				if (!url) {
					url = await this.getGameUrl('snes', game);
				}
				if (!url) {
					url = await this.getGameUrl('nes', game);
				}
			}
		}
		return url;
	}

	async load() {
		if (gfs[sys]) {
			return;
		}
		let gfsPath = __root + `/scrape/gfs/${sys}Gfs.json`;
		if (await fs.exists(gfsPath)) {
			gfs[sys] = JSON.parse(await fs.readFile(gfsPath));
			return;
		}

		gfs[sys] = {};
		let _sys = sys;
		if (sys == 'wiiu') {
			_sys = 'wii-u';
		} else if (sys == 'gcn') {
			_sys = 'gamecube';
		}
		let urlBase = `https://sitemap.gamefaqs.com/game/${_sys}/`;
		let url;
		for (let idx of "0abcdefghijklmnopqrstuvwxyz") {
			if (idx == '0') {
				idx = '00';
			}
			log('indexing ' + idx + ' for system ' + sys);
			url = urlBase + idx + '/';
			let $elems = await browser.goTo(url);
			if (!$elems) {
				er('No games starting with ' + idx + ' found for this system.');
				continue;
			}
			$elems = $elems.find('a');
			let links = [];
			for (let i = 0; i < $elems.length; i++) {
				links.push({
					title: $elems.eq(i).text(),
					url: $elems.eq(i).attr('href')
				});
			}
			gfs[sys][idx] = links;
			log(url);
		}
		await fs.outputFile(gfsPath, JSON.stringify(gfs[sys]));
	}

	async dlImg(url, dir, name) {
		let ext = url.slice(-4).toLowerCase();
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

module.exports = new GameFaqsScraper();
