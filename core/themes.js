/*
 * themes.js : Nostlan : quinton-ashley
 *
 * Theming for all supported systems.
 */
class Themes {
	constructor() {
		this.guestLibs = {
			bootstrap_css: node_modules + '/bootstrap/dist/css/bootstrap.min.css',
			jquery_js: node_modules + '/jquery/dist/jquery.min.js',
			jquery_slim_js: node_modules + '/jquery/dist/jquery.slim.min.js',
			material_design_icons_css: node_modules + '/material-design-icons-iconfont/dist/material-design-icons.css',
			three_js: node_modules + '/three/build/three.min.js'
		};

		let imgTypes = [
			`box`, // the front of the box
			`boxBack`, // the back of the box
			`boxSide`, // the side of the box
			`boxOpen`, // the inside of the game's box
			`boxOpenMask`, // parts of the game's box, such as manual clips, that should appear above the game media, manual, and memory card
			`cart`, // the front of the game's (first) cartridge
			`cover`, // the front facing portion of the cover sleeve, no box
			`coverFull`, // the entire cover sleeve, no box
			`coverBack`, // the side facing portion of the cover sleeve, no box
			`coverSide`, // the side facing portion of the cover sleeve, no box
			`disc`, // the front of the game's (first) disc
			`manual`, // the front of the game's manual
			`memory`, // the front of a memory card
			`memoryBack`, // the back of a memory card
			`promo` // a promotional insert included in the game box
		];
		// template game art
		let _systems = Object.keys(systems);
		for (let _sys of _systems) {
			let template = {
				id: '_TEMPLATE_' + _sys,
				title: _sys + ' template',
				img: {},
				sys: _sys
			};
			for (let imgType of imgTypes) {
				template.img[imgType] = 'q';
			}
			this[_sys] = {};
			this[_sys].template = template;
			this[_sys].default = {
				img: {
					box: 'q',
					boxBack: 'q',
					boxSide: 'q'
				}
			};
		}
		// the default game art
		this.ds.default.id = 'ASME';
		this.ds.default.title = 'Super Mario 64 DS';
		this.gba.default.id = '84EE4776';
		this.gba.default.title = 'Pokemon: Fire Red Version';
		this.gcn.default.id = 'GALE01';
		this.gcn.default.title = 'Super Smash Bros. Melee';
		this.n3ds.default.id = 'AREE';
		this.n3ds.default.title = 'Super Mario 3D Land';
		this.ps2.default.id = 'SLUS20370';
		this.ps2.default.title = 'Kingdom Hearts';
		this.ps3.default.id = 'BCUS98154';
		this.ps3.default.title = 'inFamous';
		this.switch.default.id = 'AAACA';
		this.switch.default.title = 'Super Mario Odyssey';
		this.wii.default.id = 'SB4E01';
		this.wii.default.title = 'Super Mario Galaxy 2';
		this.wiiu.default.id = 'ARDE01';
		this.wiiu.default.title = 'Super Mario 3D World';
		this.xbox360.default.id = '4D5307E6';
		this.xbox360.default.title = 'Halo 3';

		this.arcade.default = undefined;
		this.snes.default = undefined;
		this.nes.default = undefined;

		this.wii.getWiki = (game) => {
			let title = game.title.replace(/ /g, '_');
			return `https://wiki.dolphin-emu.org/index.php?title=${title}`;
		};
		this.gcn.getWiki = this.wii.getWiki;
		this.switch.getWiki = (game) => {
			let title = game.title.toLowerCase().replace(/ /g, '-');
			title = title.replace(/:/g, '');
			return `https://yuzu-emu.org/game/${title}/`;
		};
		this.n3ds.getWiki = (game) => {
			let title = game.title.toLowerCase().replace(/ /g, '-');
			title = title.replace(/:/g, '');
			return `https://citra-emu.org/game/${title}/`;
		};
		this.ps3.getWiki = (game) => {
			let title = game.title.toLowerCase().replace(/ /g, '_');
			title = encodeURI(tile);
			return `https://wiki.rpcs3.net/index.php?title=${title}`;
		};

	}

	async loadFrame(name) {
		let themeDir = `${prefs.nlaDir}/themes/${sysStyle}`;
		if (!(await fs.exists(`${themeDir}/${name}.html`))) {
			themeDir = `${__root}/themes/${sysStyle}`;
		}
		let fileHtml = `${themeDir}/${name}.html`;
		let filePug = `${themeDir}/${name}.pug`;
		if (!(await fs.exists(fileHtml))) {
			log('generating html from pug file');
			let filePugContent = await fs.readFile(filePug, 'utf8');
			await fs.outputFile(fileHtml, pug(filePugContent, this.guestLibs));
		}
		$('body').prepend(`<webview id="${name}" enableremotemodule="false" src="${fileHtml}"></webview>`);
	}

	async getStyles(name) {
		let styles = [];
		let _systems = [sys];
		if (sys == 'wii') _systems.push('gcn');
		for (let dir of [__root, prefs.nlaDir]) {
			for (let _sys of _systems) {
				let file = `${dir}/themes/${_sys}/${name}.css`;
				if (dir != __root && !(await fs.exists(file))) {
					try {
						await fs.ensureFile(file);
					} catch (ror) {
						er(ror);
						continue;
					}
				}
				styles.push(file);
			}
		}
		return styles;
	}

	async applyStyle(name) {
		let styles = await this.getStyles(name);

		for (let file of styles) {
			$('#themeStyles').prepend(`<link rel="stylesheet" type="text/css" href="${file}">`);
		}
	}

	async loadGameWiki(game) {
		if (!this[game.sys || sys].getWiki) return;
		let wiki = this[game.sys || sys].getWiki(game);
		if (!wiki) return;

		$('#gameWiki').html(`<webview enableremotemodule="false" src="${wiki}"></webview>`);

		let styles = await this.getStyles('wiki');
		let webview = $('#gameWiki webview').eq(0)[0];

		// insert custom styles
		webview.addEventListener('dom-ready', async () => {
			// dark mode style
			webview.insertCSS(await fs.readFile(__root + '/views/css/genericDark.css', 'utf8'));

			for (let file of styles) {
				webview.insertCSS(await fs.readFile(file, 'utf8'));
			}
		});
	}

	async getColorPalettes() {
		let styles = await this.getStyles('color');
		let palettes = [];
		const regex = /^\.([\w-]+)\.*([\w-]*)/gm;

		for (let file of styles) {
			let rules = await fs.readFile(file, 'utf8');

			let palette;
			while (palette = regex.exec(rules)) {
				palettes.push({
					sys: palette[1],
					name: palette[2]
				});
			}
		}

		return palettes;
	}

}

module.exports = new Themes();
