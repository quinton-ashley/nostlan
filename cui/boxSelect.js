class CuiState {

	onAction(act, $cursor) {
		if ($cursor.hasClass('cui-disabled')) return false;

		if ((act == 'a' || !isBtn) && $cursor[0].id != cui.getCursor('libMain')[0].id) {
			fitCoverToScreen($cursor);
			cui.makeCursor($cursor, 'libMain');
			cui.scrollToCursor();
		} else if ((act == 'a' || !isBtn) && $cursor.attr('class') &&
			(await scraper.getExtraImgs(themes[$cursor.attr('class').split(/\s+/)[0] || sysStyle].template))) {
			// TODO finish open box menus for all systems
			let game = getCurGame();
			if (!game) return;
			let template = themes[game.sys || sys].template;

			$('#gameManual').prop('src', '');
			$('#gameMedia').prop('src', '');
			$('#gameMemory').prop('src', '');
			$('#gameBoxOpenMask').prop('src', '');
			$('#gameWiki').html('');

			$('#gameBoxOpen').prop('src', await scraper.imgExists(template, 'boxOpen'));
			$('#gameBoxOpenMask').prop('src',
				await scraper.imgExists(template, 'boxOpenMask'));
			$('#gameMemory').prop('src', await scraper.imgExists(template, 'memory'));
			$('#gameManual').prop('src', await scraper.imgExists(template, 'manual'));
			$('#gameWiki').html();
			themes.loadGameWiki(getCurGame());

			let mediaImg = await scraper.imgExists(game, syst.mediaType);
			if (!mediaImg) {
				mediaImg = await scraper.getImg(template, syst.mediaType);
			}
			if (!mediaImg && syst.mediaType == 'disc') {
				mediaImg = prefs.nlaDir + '/images/discSleeve/disc.png';
			}
			$('#gameMedia').prop('src', mediaImg);
			cui.change('boxOpenMenu_2');
			$('#libMain').hide();
		} else if (act == 'y') { // flip
			let ogHeight = $cursor.height();
			await flipGameBox($cursor);
			if (Math.abs(ogHeight - $cursor.height()) > 10) {
				cui.resize();
				cui.scrollToCursor(0, 0);
			}
		}
	}

	onChange() {
		$('#libMain').show();
	}
}
module.exports = new CuiState();
