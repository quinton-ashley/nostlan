class CuiState {

	async onAction(act) {
		if (act == 'find') {
			log('user selecting gameLibDir');
			// `select ${syst.name} games folder`
			let gameLibDir = await dialog.selectDir(
				lang.emptyGameLibMenu.msg0 + ' ' +
				syst.name + ' ' +
				lang.emptyGameLibMenu.msg0);
			log('user selected: ' + gameLibDir);
			if (!gameLibDir ||
				!(await fs.exists(gameLibDir))) {
				// 'Game library does not exist'
				cui.err(syst.name + ' ' +
					lang.sysMenu.msg0 + ': ' +
					gameLibDir, 404);
				return;
			}
			await cui.libMain.load(gameLibDir);
		} else if (act == 'install') {
			let app = await nostlan.launcher.getEmuApp();
			if (app) {
				cui.err(lang.emptyGameLibMenu.err0 + ' ' + app);
				return;
			}
			app = await cui.emuAppMenu.installEmuApp();
			if (!app) return;
			// 'Success!' 'Installed'
			cui.alert(lang.emuAppMenu.msg11 + ' ' +
				prefs[emu].name, lang.alertMenu.title0,
				'sysMenu');
		}
	}

	async onChange() {
		$('#emptyGameLibMenu .opt1').text(
			lang.emptyGameLibMenu.opt1 + ' ' +
			prefs[emu].name
		);
		let note = '';
		if (syst.gameExts) {
			// 'Game files must have the file extension'
			note += lang.emptyGameLibMenu.msg1 + ': ';
		}
		for (let i in syst.gameExts) {
			note += '.' + syst.gameExts[i];
			if (i != syst.gameExts.length - 1) {
				note += ', ';
			}
			if (i == syst.gameExts.length - 2) {
				// 'or '
				note += lang.emptyGameLibMenu.msg1 + ' ';
			}
		}
		// "If you don't have any
		note += '\n' + lang.emptyGameLibMenu.msg1 + ' ';
		// games yet you might want to install the
		note += syst.name + ' ' + lang.emptyGameLibMenu.msg1;
		note += ' ' + prefs[emu].name + ' ';
		// emulator app first."
		note += lang.emptyGameLibMenu.msg1;
		$('#emptyGameLibMenu .msg1').text(note);
	}
}
module.exports = new CuiState();
