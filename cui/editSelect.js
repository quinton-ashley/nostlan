class CuiState extends cui.State {
	constructor() {
		super();
		this.$elems = [];
		this.imgDir = '';
	}

	async onAction(act) {
		log(act);

		if (act == 'x') {
			opn(this.imgDir);
		} else if (act == 'y') {
			cui.change('imgSelectMenu');
		}
	}

	async onChange() {
		let game = cui.libMain.getCurGame();

		let $ta = $(`#${game.id} textarea`);
		if (!$ta.length) {
			cui.libMain.addLabels($('#' + game.id), game);
		} else {
			$(`#${game.id} .label-input`).show();
		}
		$(`#${game.id} textarea`).attr('readonly', false);

		this.imgDir = await nostlan.scraper.getImgDir(game);
		this.game = game;
	}
}
module.exports = new CuiState();
