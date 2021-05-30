class CuiState extends cui.State {

	async load(disableWiki) {
		let game = cui.libMain.getCurGame();
		if (!game) return;
		let template = nostlan.themes[game.sys || sys].template;

		$('#gameManual').prop('src', '');
		$('#gameMedia').prop('src', '');
		$('#gameMemory').prop('src', '');
		$('#gameBoxOpenMask').prop('src', '');
		$('#gameWiki').html('');

		$('#gameBoxOpen').prop('src', await nostlan.scraper.imgExists(template, 'boxOpen'));
		$('#gameBoxOpenMask').prop('src',
			await nostlan.scraper.imgExists(template, 'boxOpenMask'));
		$('#gameMemory').prop('src', await nostlan.scraper.imgExists(template, 'memory'));
		$('#gameManual').prop('src', await nostlan.scraper.imgExists(template, 'manual'));
		if (!disableWiki) {
			$('#gameWiki').html();
			nostlan.themes.loadGameWiki(cui.libMain.getCurGame());
		}

		let mediaImg = await nostlan.scraper.imgExists(game, syst.mediaType);
		if (!mediaImg) {
			mediaImg = await nostlan.scraper.getImg(template, syst.mediaType);
		}
		mediaImg += '?' + Date.now();
		if (!mediaImg && syst.mediaType == 'disc') {
			mediaImg = prefs.nlaDir + '/images/discSleeve/disc.png';
		}
		$('#gameMedia').prop('src', mediaImg);
	}

	async onAction(act) {
		if (act == 'x') act = 'manual';
		if (act == 'y') act = 'memory';
		if (act == 'a') act = 'media';
		if (!(/(memory|manual|media)/gi).test(act)) return;
		act = act[0].toUpperCase() + act.slice(1);
		act = 'game' + act;
		this.$elem.addClass('zoom-' + act);
		cui.change(act + 'Select_3');
	}

	async onChange() {
		this.$elem.removeClass('zoom-gameManual');
		this.$elem.removeClass('zoom-gameMedia');
		this.$elem.removeClass('zoom-gameMemory');
	}

	async afterChange() {
		cui.makeCursor($('#gameMedia'));
	}
}
module.exports = new CuiState();
