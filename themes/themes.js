class Themes {
	constructor() {
		this.guestLibs = {
			bootstrap_css: node_modules + '/bootstrap/dist/css/bootstrap.min.css',
			jquery_js: node_modules + '/jquery/dist/jquery.min.js',
			jquery_slim_js: node_modules + '/jquery/dist/jquery.slim.min.js',
			material_design_icons_css: node_modules + '/material-design-icons-iconfont/dist/material-design-icons.css',
			three_js: node_modules + '/three/build/three.min.js'
		};
		this.initialized = false;
	}

	async init() {
		let themesPath = __rootDir + '/themes/themes.json';
		let themes = JSON.parse(await fs.readFile(themesPath));
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
		for (let system in themes) {
			this[system] = themes[system];
			let template = {
				id: '_TEMPLATE_' + system,
				title: system + ' template',
				img: this[system].template,
				sys: system
			};
			for (let imgType of imgTypes) {
				if (!template.img[imgType]) {
					template.img[imgType] = 'q';
				}
			}
			this[system].template = template;
		}
		this.initialized = true;
	}

	async loadFrame(name, sys, sysStyle) {
		if (!this.initialized) await this.init();
		let themeDir = `${prefs.nlaDir}/themes/${sysStyle}`;
		if (!(await fs.exists(`${themeDir}/${name}.html`))) {
			themeDir = `${__rootDir}/themes/${sysStyle}`;
		}
		let fileHtml = `${themeDir}/${name}.html`;
		let filePug = `${themeDir}/${name}.pug`;
		if (!(await fs.exists(fileHtml))) {
			log('generating html from pug file');
			let filePugContent = await fs.readFile(filePug, 'utf8');
			await fs.outputFile(fileHtml, pug(filePugContent, guestLibs));
		}
		$('body').prepend(`<webview id="${name}" enableremotemodule="false" src="${fileHtml}"></webview>`);
	}

	async applyStyle(name, sys, sysStyle) {
		if (!this.initialized) await this.init();
		let dirs = [__rootDir, `${prefs.nlaDir}/themes/${sysStyle}`];
		for (let i in dirs) {
			if (i != 0 && !(await fs.exists(dirs[i]))) return;
			let file = `${dirs[i]}/themes/${sys}/${name}.css`;
			$('body').prepend(`<link rel="stylesheet" type="text/css" href="${file}">`);
			if (sys == 'wii') {
				file = `${dirs[i]}/themes/gcn/${name}.css`;
				$('body').prepend(`<link rel="stylesheet" type="text/css" href="${file}">`);
			}
		}
	}
}

module.exports = new Themes();
