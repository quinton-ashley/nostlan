class CuiState extends cui.State {

	async onAction(act) {
		log(act);
		if (act == 'selectImg') {
			cui.change('imgSelectMenu');
		} else if (act == 'b') {
			nostlan.browser.close();
			cui.doAction('back');
		}
	}

	async onChange() {
		if (cui.uiPrev != 'editSelect') return;
		let game = cui.editSelect.game;

		let searchTerm = game.title + ' cover';

		let query = searchTerm.replace(/[^0-9a-zA-Z ]+/g, '').replace(' ', '+');

		let url = 'https://duckduckgo.com/?t=ffab&q=' + query +
			'&iax=images&ia=images&iaf=size%3AWallpaper';

		try {
			await nostlan.browser.init('#' + this.id, url);
		} catch (ror) {
			er(ror);
		}
	}
}
module.exports = new CuiState();
