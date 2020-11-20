class CuiState {

	async onAction(act) {
		if (act == 'toggleCover') {
			cui.buttonPressed('select');
		} else if (act == 'theme') {
			if (!nostlan.premium.verify()) {
				cui.err(lang.premium.msg0);
				return;
			}
			cui.removeView('themeMenu_13');
			let themeMenu = 'h1.title0\n';
			for (let palette of (await themes.getColorPalettes())) {
				let p = palette.sys + ' ' + palette.name;
				if (!palette.name) palette.name = 'default';
				palette = systems[palette.sys].name + ' ' + palette.name;
				themeMenu += `.col.cui(name="${p}") ${palette}\n`;
			}
			$('#themeMenu_13').append(pug(themeMenu));
			cui.addView('themeMenu_13');
			cui.change('themeMenu_13');
		}
	}
}
module.exports = new CuiState();
