class CuiState extends cui.State {

	async onAction(act) {
		if (act == 'install') {
			let res = await this.installEmuApp();
			if (!res) return;
			// 'Success!' 'Installed'
			cui.alert(lang.emuAppMenu.msg11 + ' ' +
				emus[emu].name, lang.alertMenu.title0,
				'doubleBack');
		} else if (act == 'find') {
			// 'Select emulator app'
			let emuApp = await dialog.selectFile(
				lang.playing.msg0);
			if (mac) {
				emuApp = await nostlan.launcher.getMacExec(emuApp);
			}
			if (!(await fs.exists(emuApp))) {
				// 'Emulator app not found at'
				cui.err(lang.playing.err1 + ': ' + emuApp);
				return;
			}
			prefs[emu].app = emuApp;
			cui.doAction('back');
		}
	}

	async installEmuApp() {
		$('body > :not(#dialogs)').addClass('dim');
		cui.clearDialogs();
		$('#dialogs').show();
		let wdw = electron.getCurrentWindow();
		wdw.focus();
		wdw.setFullScreen(false);
		let res = await nostlan.installer.install();
		wdw.focus();
		wdw.setFullScreen(prefs.ui.launchFullScreen);
		cui.clearDialogs();
		$('body > :not(#dialogs)').removeClass('dim');
		if (res) {
			await cui.setupMenu.createTemplate();
		}
		return res;
	}

	async onChange() {
		$('#emuAppMenu_6 .opt0').text(
			lang.emuAppMenu.opt0 + ' ' + emus[emu].name
		);
		$('#emuAppMenu_6 .opt1').text(
			lang.emuAppMenu.opt1 + ' ' + emus[emu].name
		);
	}

	async afterChange() {
		$('body > :not(#dialogs)').removeClass('dim');
		cui.clearDialogs();
	}
}
module.exports = new CuiState();
