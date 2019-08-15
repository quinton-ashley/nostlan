const dl = require(__rootDir + '/core/dl/dl.js');
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

	async getImgUrls(sys, game, name) {
		if (!browser) {
			er('browser not loaded');
			return;
		}
		let $page, url, res, ext;
		url = await this.getGameUrl(sys, game);
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
		img[name] = url;
		// await dl(url, __rootDir + '/scrape/img/' + game.id + url.substr(-4));
		return img;
	}

	async getGameUrl(sys, game) {
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
		let results = fuse.search(game.title.substr(0, 64));
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

	async load(sys) {
		if (gfs[sys]) {
			return;
		}
		let gfsPath = __rootDir + `/scrape/gfs/${sys}Gfs.json`;
		if (await fs.exists(gfsPath)) {
			gfs[sys] = JSON.parse(await fs.readFile(gfsPath));
			return;
		}

		gfs[sys] = {};
		let system = sys;
		if (sys == 'wiiu') {
			system = 'wii-u';
		} else if (sys == 'gcn') {
			system = 'gamecube';
		}
		let urlBase = `https://sitemap.gamefaqs.com/game/${system}/`;
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
}

module.exports = new GameFaqsScraper();

// unwrapGFUrl(sys, game) {
// 	let system = game.sys || sys;
// 	if (system == 'wiiu') {
// 		system = 'wii-u';
// 	} else if (system == 'gcn') {
// 		system = 'gamecube';
// 	}
// 	let url = 'https://gamefaqs.gamespot.com';
// 	url += `/${sys}/${game.gf}-${game.title.replace(/ /g, '-')}`;
// 	return url;
// }

// if (name == 'cover' || name == 'coverSide') {
// 	res = await this.dlFromGamefaqs(title, dir, name, game);
// 	if (res) {
// 		return res;
// 	}
// }
