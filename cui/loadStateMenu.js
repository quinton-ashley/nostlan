class CuiState {

	onChange() {
		let $slots = $('#' + state + ' .cui');
		let states = launcher.cfg.saveStates;
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
