// users can type to search, which has an auto timeout
let searchTerm = '';
let searchTimeout = 0;
setInterval(function() {
	if (searchTimeout > 1000) {
		searchTimeout -= 1000;
	} else {
		searchTimeout = 0;
	}
}, 1000);

class CuiState {

	onAction(act, $cur) {
		let isBtn = cui.isButton(act);
		if (act == 'b' && !/menu/i.test(ui)) {
			cui.change('sysMenu_5');
		}
		if ($cursor.hasClass('cui-disabled')) return false;
		if (act == 'y') {
			cui.change('emuMenu_5');
		} else if (act == 'a' || !isBtn) {
			let gameSys = $cursor.attr('class');
			if (gameSys) gameSys = gameSys.split(/\s+/)[0];
			fitCoverToScreen($cursor);
			cui.scrollToCursor(500, 0);
			cui.change('boxSelect_1', gameSys);
		}
	}

	searchForGame(char) {
		if (searchTimeout == 0) {
			searchTerm = '';
		}
		searchTimeout = 2000;
		searchTerm += char;
		log('search for: ' + searchTerm);
		for (let game of games) {
			let titleSlice = game.title.slice(0, searchTerm.length);
			let matched = (searchTerm == titleSlice.toLowerCase());
			if (game.keywords) {
				for (let keyword of game.keywords) {
					if (searchTerm == keyword.toLowerCase()) matched = true;
				}
			}
			if (matched) {
				let $cursor = $('#' + game.id).eq(0);
				if (!$cursor.length) continue;
				log('cursor to game: ' + game.title);
				cui.makeCursor($cursor);
				cui.scrollToCursor();
				break;
			}
		}
	}

	onChange() {
		$('#libMain')[0].style.transform = 'scale(1) translate(0,0)';
		$('#libMain').removeClass('no-outline');
	}

	afterChange() {
		if (cui.uiPrev == 'loading_1' && prefs.session[sys] && prefs.session[sys].gameID) {
			let $cursor = $('#' + prefs.session[sys].gameID).eq(0);
			if (!$cursor.length) $cursor = $('#' + games[0].id).eq(0);
			cui.makeCursor($cursor);
			cui.scrollToCursor(250, 0);
		} else if (cui.uiPrev == 'boxSelect_1') {
			changeImageResolution(cui.getCursor());
		}
	}
}
module.exports = new CuiState();
