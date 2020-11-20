class CuiState {

	onAction(act) {
		act = act.split(' ');
		$('body').removeClass();
		cui.change('interfaceMenu_12', act[0]);
		$('body').addClass(act[1]);
		prefs[sys].colorPalette = act[1];
	}
}
module.exports = new CuiState();
