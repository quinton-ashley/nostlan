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
			$('#themeMenu').append(pug(themeMenu));
			cui.addView('themeMenu');
			cui.change('themeMenu');
		}
	}
}
module.exports = new CuiState();
