class CuiState extends cui.State {

	async onAction(act) {
		log(act);

		if (act == 'b') {
			nostlan.browser.close();
			cui.doAction('back');
		}
	}

	async onChange() {
		this.game = cui.libMain.getCurGame();
		this.imgDir = await nostlan.scraper.getImgDir(this.game);

		this.searchTerm = this.game.title + ' cover';

		let query = this.searchTerm.replace(/[^0-9a-zA-Z]/, '').replace(' ', '+');

		let url = 'https://duckduckgo.com/?t=ffab&q=' + query +
			'&iax=images&ia=images&iaf=size%3AWallpaper';

		let $page = await nostlan.browser.goTo(url);

		// log($page.find('.tile--img'));

	}
}
module.exports = new CuiState();
