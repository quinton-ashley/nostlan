class CuiState {

	onAction(act) {
		if (!/slot\d/.test(act)) return;
		let slot = act.slice(4);
		log('saving state to slot ' + slot);
		nostlan.launcher.saveState(slot);
		nostlan.launcher.unpause();
	}

	onChange() {
		let $slots = $('#' + state + ' .cui');
		let states = nostlan.launcher.cfg.saveStates;
		for (let i = 0; i < $slots.length; i++) {
			let txt = i + ' ';
			if (states && states[i]) {
				txt += states[i].date;
			} else {
				txt += 'empty slot';
			}
			$slots.eq(i).text(txt);
		}
	}
}
module.exports = new CuiState();
