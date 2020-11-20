class CuiState {

	async onAction(act) {
		prefs.ui.lang = act;
		await start();
	}

	async create() {
		let iso_639_1 = require('iso-639').iso_639_1;
		let langFolders = await klaw(__root + '/lang');
		let title = 'Language Menu';
		if (global.lang) title = lang.languageMenu.title0;
		let elems = `h1 ${title}\n`;
		for (let x of langFolders) {
			x = path.parse(x).base;
			if (!iso_639_1[x]) continue;
			elems += `.cui(name='${x}') `;
			elems += iso_639_1[x].name + '\n';
		}
		log(elems);
		$('#languageMenu').empty();
		$('#languageMenu').append(pug(elems));
	}
}
module.exports = new CuiState();
