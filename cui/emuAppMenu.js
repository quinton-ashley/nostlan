class CuiState {

	onChange() {
		$('#emuAppMenu_6 .opt0').text(
			lang.emuAppMenu_6.opt0 + ' ' + prefs[emu].name
		);
		$('#emuAppMenu_6 .opt1').text(
			lang.emuAppMenu_6.opt1 + ' ' + prefs[emu].name
		);
	}
	afterChange() {
		$('body > :not(#dialogs)').removeClass('dim');
		cui.clearDialogs();
	}
}
module.exports = new CuiState();
