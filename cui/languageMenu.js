class CuiState extends cui.State {
	async onAction(act) {
		if (cui.isButton(act)) return;
		cf.ui.lang = act;
		await nostlan.start();
	}

	async onChange() {
		let iso_639_1 = require('iso-639').iso_639_1;
		let langFolders = await klaw(__root + '/lang');
		let title = 'Language Menu';
		if (global.lang) title = lang.languageMenu.title0;
		let elems = `h1 ${title}\n.cui(name='en') English\n`;
		for (let x of langFolders) {
			x = path.parse(x).base;
			if (x == 'en' || !iso_639_1[x]) continue;
			elems += `.cui(name='${x}') `;
			if (x == 'he') {
				elems += 'Hebrew\n';
			} else {
				elems += iso_639_1[x].name + '\n';
			}
		}
		log(elems);
		this.$elem.empty();
		this.$elem.append(pug(elems));
		cui.addView('languageMenu');
	}
}
module.exports = new CuiState();
