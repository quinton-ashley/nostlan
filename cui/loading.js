class CuiState extends cui.State {

	async intro() {
		$('#dialogs').show();
		await nostlan.themes.loadFrame('intro');
		$('#themeStyles link').remove();
		await nostlan.themes.applyStyle('colors');
		await nostlan.themes.applyStyle('theme');
	}

	async removeIntro(time) {
		time = time || prefs.load.delay;
		if (prefs.args.testIntro) time = 1000000;
		log('removing intro: ' + time);
		await delay(time);
		$('#intro').remove();
		cui.hideDialogs();
	}

	async loadSharedAssets(specificAssets) {
		$('#dialogs').show();
		cui.clearDialogs();
		// 'loading additional images'
		$('#loadDialog0').text(lang.loading.msg1);
		let gh = 'https://github.com/quinton-ashley/nostlan-img/raw/master/shared';
		if (!prefs.nlaDir) return;
		let dir = prefs.nlaDir + '/images';

		let assetPacks = ['discSleeve', 'labels', 'plastic', 'stickers', 'wraps'];

		for (let pack of assetPacks) {
			if (specificAssets && !specificAssets.includes(pack)) continue;
			$('#loadDialog2').text(pack);
			let url = gh + `/${pack}.zip`;
			let file = dir + `/${pack}.zip`;
			if (!(await fs.exists(dir + '/' + pack))) {
				await fs.ensureDir(dir);
				file = await nostlan.scraper.dl(url, file, {
					timeout: 10000
				});
				if (!file) break;
				await fs.extract(file, dir);
			}
		}
		$('#loadDialog1').text('');
		$('#loadDialog2').text('');
		// 'loading complete!'
		$('#loadDialog0').text(lang.loading.msg2);
	}
}
module.exports = new CuiState();
