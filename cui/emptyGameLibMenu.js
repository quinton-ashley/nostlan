class CuiState {

	onChange() {
		$('#emptyGameLibMenu_6 .opt1').text(
			lang.emptyGameLibMenu_6.opt1 + ' ' +
			prefs[emu].name
		);
		let note = '';
		if (syst.gameExts) {
			// 'Game files must have the file extension'
			note += lang.emptyGameLibMenu_6.msg1_0 + ': ';
		}
		for (let i in syst.gameExts) {
			note += '.' + syst.gameExts[i];
			if (i != syst.gameExts.length - 1) {
				note += ', ';
			}
			if (i == syst.gameExts.length - 2) {
				// 'or '
				note += lang.emptyGameLibMenu_6.msg1_1 + ' ';
			}
		}
		// "If you don't have any
		note += '\n' + lang.emptyGameLibMenu_6.msg1_2 + ' ';
		// games yet you might want to install the
		note += syst.name + ' ' + lang.emptyGameLibMenu_6.msg1_3;
		note += ' ' + prefs[emu].name + ' ';
		// emulator app first."
		note += lang.emptyGameLibMenu_6.msg1_4;
		$('#emptyGameLibMenu_6 .msg1').text(note);
	}
}
module.exports = new CuiState();
