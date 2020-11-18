class CuiState {

	onAction(act) {
		if (act == 'x') act = 'manual';
		if (act == 'y') act = 'memory';
		if (act == 'a') act = 'media';
		if (!(/(memory|manual|media)/gi).test(act)) return;
		act = act[0].toUpperCase() + act.slice(1);
		act = 'game' + act;
		$('#boxOpenMenu_2').addClass('zoom-' + act);
		cui.change(act + 'Select_3');
	}

	onChange() {
		$('#boxOpenMenu_2').removeClass('zoom-gameManual');
		$('#boxOpenMenu_2').removeClass('zoom-gameMedia');
		$('#boxOpenMenu_2').removeClass('zoom-gameMemory');
	}
	afterChange() {
		cui.makeCursor($('#gameMedia'));
	}
}
module.exports = new CuiState();
