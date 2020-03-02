const dl = require('./dl.js');
const Fuse = require('fuse.js');
let regions = {
	ps2: {
		// A: 'AS', // Asia
		// // C: 'China', // China
		// E: 'EU', // Europe
		// // H: 'Hong Kong', // Hong Kong
		// J: 'JP', // Japan
		// P: 'JP', // Japan (PS1/PS2)
		// // K: 'Korea', // Korea
		U: 'us' // USA
	}
};
regions.ps3 = regions.ps2;
regions.ps4 = regions.ps2;
let tcp = {};

class TheCoverProjectScraper {
	constructor() {}

	wrapUrl(url) {
		return url.replace(/http:\/\/www\.thecoverproject\.net\/download_cover\.php\?src=cdn&cover_id=(\d+)\.jpg/, 'c $1');
	}

	unwrapUrl(data) {
		return `http://www.thecoverproject.net/download_cover.php?src=cdn&cover_id=${data[0]}.jpg`;
	}

	async getImgUrls(game, name) {
		if (!browser) {
			er('browser not loaded');
			return;
		}
		let $page, url, res, ext;
		url = await this.getGameUrl(game);
		if (!url) {
			log('game not found on The Cover Project');
			return;
		}
		log(url);
		if (!$page) $page = await browser.goTo(url);
		if (!$page) $page = await browser.goTo(url);
		if (!$page) $page = await browser.goTo(url);
		if (!$page) return;
		let region;
		if (sys == 'ps2') region = game.id[2];
		if (regions[sys]) {
			region = regions[sys][region] || 'us';
		} else {
			region = 'us';
		}
		// search for the image from the region
		let $links = $page.find('#covers a');
		for (let i = 0; i < $links.length; i++) {
			let country = $links.eq(i).find('img').eq(0).attr('src').split('/');
			country = country[country.length - 1];
			if (country == region + '.png') {
				if (i != 0) $page = null;
				if (!$page) {
					$page = await browser.goTo($links.eq(i).attr('href'));
				}
				if (!$page) {
					$page = await browser.goTo($links.eq(i).attr('href'));
				}
				if (!$page) {
					$page = await browser.goTo($links.eq(i).attr('href'));
				}
				if (!$page) return;
				break;
			}
		}
		url = $page.find('.pageBody h2 a').eq(0).attr('href');
		if (!url) return;
		let img = {};
		url = 'http://www.thecoverproject.net' + url + '.jpg';
		log(url);
		if (arg.dl) {
			await dl(url,
				`${__root}/dev/img/${game.id}/${name}.jpg`);
		}
		img[name] = this.wrapUrl(url);
		return img;
	}

	async getGameUrl(game) {
		if (!browser) {
			er('browser not loaded');
			return;
		}
		let idx = game.title[0].toLowerCase();
		if (idx == idx.toUpperCase()) idx = '9';

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
		let fuse = new Fuse(tcp[sys][idx], fusePrms);
		let results = fuse.search(game.title.substr(0, 64));
		log(results);
		let url;
		if (results && results.length) {
			url = 'http://www.thecoverproject.net/view.php?game_id=';
			url += results[0].item.url;
		}
		if (!url && sys == 'wii') {
			if (game.id.length > 4) {
				url = await this.getGameUrl('gcn', game);
				if (url) game.sys = 'gcn';
			} else {
				url = await this.getGameUrl('n64', game);
				if (url) game.sys = 'n64';
				if (!url) {
					url = await this.getGameUrl('snes', game);
					if (url) game.sys = 'snes';
				}
				if (!url) {
					url = await this.getGameUrl('nes', game);
					if (url) game.sys = 'nes';
				}
			}
		}
		return url;
	}

	async load() {
		if (tcp[sys]) {
			return;
		}
		let tcpPath = __root + `/scrape/tcp/${sys}Tcp.json`;
		if (await fs.exists(tcpPath)) {
			tcp[sys] = JSON.parse(await fs.readFile(tcpPath));
			return;
		}
		tcp[sys] = {};

		let catID;
		if (sys == 'ps2') catID = 6;
		if (sys == 'gba') catID = 13;
		if (sys == 'snes') catID = 8;
		if (!catID) {
			er('no category id for sys: ' + sys);
			return;
		}
		let urlBase = `http://www.thecoverproject.net/view.php?cat_id=${catID}&view=`;
		let url;
		for (let idx of "9abcdefghijklmnopqrstuvwxyz") {
			log('indexing ' + idx + ' for system ' + sys);
			let links = [];
			url = urlBase + idx;
			let _url = url;
			for (let page = 1; true; page++) {
				if (page != 1) url = _url + '&page=' + page;
				log(url);
				let $elems;
				if (!$elems) $elems = await browser.goTo(url);
				if (!$elems) $elems = await browser.goTo(url);
				if (!$elems) $elems = await browser.goTo(url);
				if (!$elems) return;
				$elems = $elems.find('.pageBody a');
				if (!$elems.length) break;
				for (let i = 0; i < $elems.length; i++) {
					let id = $elems.eq(i).attr('href').split('=');
					id = id[id.length - 1];
					links.push({
						title: $elems.eq(i).text(),
						url: id
					});
				}
				log($elems.length + ' games on page');
			}
			tcp[sys][idx] = links;
			log(links);
		}
		await fs.outputFile(tcpPath, JSON.stringify(tcp[sys]));
	}
}

module.exports = new TheCoverProjectScraper();


// image found!
// E:\dev\apps\bottlenose\scrape\scrape.js:65 found: 292/898 32.52%
// E:\dev\apps\bottlenose\scrape\scrape.js:66 completed: 898/1130 79.47%
// E:\dev\apps\bottlenose\scrape\scrape.js:44 Sonic Advance 3
