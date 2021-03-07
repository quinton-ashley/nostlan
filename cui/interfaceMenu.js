class CuiState extends cui.State {

	async onAction(act) {
		if (act == 'toggleCover') {
			cui.buttonPressed('select');
		} else if (act == 'theme') {
			if (!nostlan.premium.verify()) {
				cui.err(lang.donateMenu.msg0);
				return;
			}
			cui.removeView('themeMenu');
			let themeMenu = 'h1.title0\n';
			for (let palette of (await nostlan.themes.getColorPalettes())) {
				let p = palette.sys + ' ' + palette.name;
				if (!palette.name) palette.name = 'default';
				palette = systems[palette.sys].name + ' ' + palette.name;
				themeMenu += `.col.cui(name="${p}") ${palette}\n`;
			}
			$('#themeMenu_13').append(pug(themeMenu));
			cui.addView('themeMenu');
			cui.change('themeMenu');
		} else if (act == 'altReelsScrolling') {
			prefs.ui.altReelsScrolling = !prefs.ui.altReelsScrolling;
			cui.removeView('libMain');
			cui.change('loading');
			await cui.loading.intro();
			await cui.libMain.viewerLoad();
			await cui.loading.removeIntro();
			cui.change('libMain');
			cui.scrollToCursor(0);
		}
	}
}
module.exports = new CuiState();
