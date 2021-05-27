class CuiState extends cui.State {
	constructor() {
		super();
		this.imgTypes = ['cover', 'coverBack', 'coverSide', 'coverFull', 'disc', 'box', 'boxBack', 'boxSide', 'boxOpen', 'boxOpenMask', 'coverInner', 'manual', 'memory', 'memoryBack', 'promo'];
		this.imgNames = ['front cover', 'back cover', 'side cover', 'full cover', 'disc', 'front box', 'back box', 'side box', 'open box', 'open box mask', 'inner cover', 'manual', 'memory', 'back memory', 'promo'];
	}

	async onAction(act) {
		if (this.imgTypes.includes(act)) {
			log(act);
			this.imgType = act;
			cui.change('imgSearchMenu');
		}
	}

	async onChange() {
		if (cui.uiPrev == 'imgSearchMenu') return;

		$('#' + this.id).empty();

		this.imgTypes[4] = syst.mediaType;
		this.imgNames[4] = syst.mediaType;

		let menu = '';
		for (let i in this.imgTypes) {
			if (i % 3 == 0) menu += `.row.row-x\n`;
			let type = this.imgTypes[i];
			let name = this.imgNames[i];
			menu += `\t.cui.col.opt${i}(name='${type}') ${name}\n`;
		}

		$('#' + this.id).append(pug(menu));

		cui.addView('imgSelectMenu');
		cui.makeCursor($('#' + this.id + ' .cui.opt0'));
	}
}
module.exports = new CuiState();
