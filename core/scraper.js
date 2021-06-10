/*
 * scraper.js : Nostlan : quinton-ashley
 *
 * Scrapes for box art, disc/cart, and other images.
 */
const rmDiacritics = require('diacritics').remove;

let scrapers = {
	b: 'bmb',
	c: 'tcp',
	d: 'dec',
	f: 'fly',
	g: 'gfs',
	m: 'mdo',
	q: 'gqa',
	t: 'tdb'
};

class Scraper {
	constructor() {
		// dl is a helper lib I made for downloading images
		this.dl = require(__root + '/scrape/dl.js');

		for (let scraper in scrapers) {
			scraper = scrapers[scraper];
			this[scraper] = require(__root + '/scrape/' + scraper + '.js');
		}
	}

	async getImg(game, name, hq) {
		let res = await this.imgExists(game, name);
		if (res || offline) return res;
		$('#loadDialog0').html(md(`${lang.loading.msg7_0}\n\n${name}  \n${lang.loading.msg7_1}\n\n${game.title} [${game.id}]`));
		let imgDir = this.getImgDir(game);
		let file, url;
		// check if game img is specified in the gamesDB
		if (game.img && game.img[name]) {
			log(name);
			url = game.img[name].split(' ');
			let ext, scraper;
			// url[0] is the url and url[1] is the file type
			if (url[1] && url[0].length != 1) {
				// catch and ignore old method of doing this from
				// a previous version of Bottlnose
				if (url[1][0] == '/' || url[1][0] == '\\') return;
				ext = url[1];
				url = url[0];
			} else if (url[0] == 'q') {
				url = await this.gqa.unwrapUrl(game, name);
				res = await this.dl(url, `${imgDir}/${name}`, {
					unknownExt: true
				});
				if (res) return res;
			} else if (url[1] == 'd') {
				scraper = 'dec';
			} else if (url[1]) {
				// url[0] is key for the scraper
				scraper = scrapers[url[0]];
				// the unique parts of the url for the site the img was scraped from
				let data = url.slice(1);
				// unwrap/unminify the url using the unique parts
				url = this[scraper].unwrapUrl(data);
			} else {
				// the url is just a regular old link
				url = url[0];
			}
			if (!ext) ext = url.slice(-3);
			file = `${imgDir}/${name}.${ext}`;
			if (scraper == 'gfs') {
				res = await this.gfs.dlImg(url, imgDir, name);
			} else if (scraper == 'dec') {
				res = await this.dec.dlImg(game, imgDir, name, sys);
			} else {
				res = await this.dl(url, file);
			}
			if (res) return res;
		}

		if (game.id.includes('_TEMPLATE')) return;

		res = await this.mdo.dlImg(game, imgDir, name);
		if (res) return res;

		if (hq) return;

		res = await this.tdb.dlImg(game, imgDir, name);
		return res;
	}

	async loadImages(games, recheckImgs) {
		let imgDir;
		let isTemplate;

		let gamesTotal = games.length + 1;
		for (let i = 0; i < games.length + 1; i++) {
			$('#loadDialog2').text(`${i+1}/${gamesTotal} games`);
			let res;
			let game;
			if (!isTemplate && i == games.length) {
				game = nostlan.themes[sysStyle].template;
				isTemplate = true;
				if (sys != sysStyle) i--;
			} else if (isTemplate) {
				game = nostlan.themes[sys].template;
			} else {
				game = games[i];
			}
			if (game.id.slice(1, 13) == 'UNIDENTIFIED') continue;
			if (game.title) {
				game.title = rmDiacritics(game.title);
			}
			imgDir = this.getImgDir(game);

			if (recheckImgs || !(await fs.exists(imgDir))) {
				try {
					await fs.ensureDir(imgDir);
				} catch (ror) {
					er(ror);
					games.splice(i, 1);
					i--;
					if (games.length == 0) return [];
					continue;
				}
				if (!isTemplate ||
					(!(await this.imgExists(game, 'coverFull')) &&
						!(await this.imgExists(game, 'cover')) && sys != 'gba')
				) {
					await this.getImg(game, 'box', 'HQ');
				}
				res = await this.getImg(game, 'coverFull');
				if (!res) {
					await this.getImg(game, 'coverSide');
					if (!(await this.imgExists(game, 'boxBack'))) {
						await this.getImg(game, 'coverBack');
					}
				}
				if (!res && !(await this.imgExists(game, 'box'))) {
					res = await this.getImg(game, 'cover');
					if (!res) res = await this.getImg(game, 'box');
					if (!res) {
						log('images not found for game: ' + game.title);
						// games.splice(i, 1);
						// i--;
						// await fs.remove(imgDir);
						continue;
					}
				}
				await this.getImg(game, syst.mediaType);

				if (sys == 'arcade') {
					await this.getImg(game, 'cabinet');
				} else if (prefs.ui.getExtraImgs || isTemplate) {
					await this.getExtraImgs(game, recheckImgs);
				}
			}

			if (isTemplate && !(await this.imgExists(game, 'box'))) {
				log(game);
				await this.getImg(game, 'box');
				await this.getImg(game, 'boxBack');
				await this.getImg(game, 'boxSide');
				if (!(await this.imgExists(game, 'box'))) {
					cui.err('ERROR: No default box image found in the directory ' +
						this.getImgDir(game), 404, 'sysMenu');
					return [];
				}
			}
		}

		games = games.sort((a, b) => a.title.localeCompare(b.title));
		return games;
	}

	async getExtraImgs(game, recheckImgs) {
		let res = await this.imgExists(game, 'boxOpen');
		// only check for images if boxOpen didn't exist
		// or recheckImgs is true
		if (!res || recheckImgs) {
			res = await this.getImg(game, 'boxOpen');
			await this.getImg(game, 'boxOpenMask');
			await this.getImg(game, 'manual');
			await this.getImg(game, 'memory');
			await this.getImg(game, 'memoryBack');
		}
		return res;
	}

	getImgDir(game) {
		return `${systemsDir}/${sys}/images/${game.id}`;
	}

	async imgExists(game, name) {
		let imgDir = this.getImgDir(game);
		let file = `${imgDir}/${name}.png`;
		if (!(await fs.exists(file))) {
			file = file.slice(0, -3) + 'jpg';
			if (!(await fs.exists(file))) {
				file = `${imgDir}/default.lay`;
				if (sys != 'arcade' || name != 'cabinet' || !(await fs.exists(file))) {
					return;
				}
			}
		}
		return file;
	}

	async genThumb(img) {
		let og = img;
		img = path.parse(img);
		let thumb = img.dir + '/' + img.name + 'Thumb.jpg';
		if (await fs.exists(thumb)) return thumb;
		$('#loadDialog0').text('generating thumbnail images');

		if (global.sharp) {
			await sharp(og).resize({
				height: 720
			}).jpeg({
				quality: 89
			}).toFile(thumb);
		} else {
			img = await jimp.read(og);
			await img.resize(jimp.AUTO, 720);
			await img.writeAsync(thumb);
		}

		return thumb;
	}
}

module.exports = new Scraper();
