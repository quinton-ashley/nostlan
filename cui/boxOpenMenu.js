class CuiState extends cui.State {

	async onAction(act) {
		if (act == 'x') act = 'manual';
		if (act == 'y') act = 'memory';
		if (act == 'a') act = 'media';
		if (!(/(memory|manual|media)/gi).test(act)) return;
		act = act[0].toUpperCase() + act.slice(1);
		act = 'game' + act;
		this.$elem.addClass('zoom-' + act);
		cui.change(act + 'Select_3');
	}

	async onChange() {
		this.$elem.removeClass('zoom-gameManual');
		this.$elem.removeClass('zoom-gameMedia');
		this.$elem.removeClass('zoom-gameMemory');
	}

	async afterChange() {
		cui.makeCursor($('#gameMedia'));
	}
}
module.exports = new CuiState();
