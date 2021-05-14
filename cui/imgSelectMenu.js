class CuiState extends cui.State {

	async onAction(act) {
		log(act);
		let game = cui.editSelect.game;
		if (!game.img) game.img = {};
		game.img[act] = cui.editSelect.imgUrl;
		$('#dialogs').show();
		let img = await nostlan.scraper.getImg(game, act);
		await nostlan.scraper.genThumb(img);
		nostlan.browser.close();
		cui.hideDialogs();
		cui.doAction('doubleBack');
	}

	async onChange() {
		$('#' + this.id).append(pug(
			`.row.row-x\n` +
			`\t.cui.col.opt0(name='cover') front cover\n` +
			`\t.cui.col.opt1(name='coverBack') back cover\n` +
			`\t.cui.col.opt2(name='coverSide') side cover\n` +
			`.row.row-x\n` +
			`\t.cui.col.opt3(name='coverFull') full cover\n` +
			`\t.cui.col.opt4(name='${syst.mediaType}') ${syst.mediaType}\n` +
			`\t.cui.col.opt5(name='box') front box\n` +
			`.row.row-x\n` +
			`\t.cui.col.opt6(name='boxBack') back box\n` +
			`\t.cui.col.opt7(name='boxSide') side box\n` +
			`\t.cui.col.opt8(name='boxOpen') open box\n` +
			`.row.row-x\n` +
			`\t.cui.col.opt9(name='boxOpenMask ') open box mask\n` +
			`\t.cui.col.opt10(name='coverInner') inner cover\n` +
			`\t.cui.col.opt11(name='manual') manual\n` +
			`.row.row-x\n` +
			`\t.cui.col.opt12(name='memory') memory\n` +
			`\t.cui.col.opt13(name='memoryBack') back memory\n` +
			`\t.cui.col.opt14(name='promo') promo\n`
		));

		cui.addView(this.ui);
	}
}
module.exports = new CuiState();
