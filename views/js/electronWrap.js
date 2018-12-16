const ElectronWrap = function() {
	// electron support
	const log = console.log;
	const err = console.error;
	let remote = {};
	let dialog = {};
	try {
		remote = require('electron').remote;
		dialog = remote.dialog;
	} catch (e) {}

	this.selectDir = function(msg) {
		let dir = [''];
		try {
			dir = dialog.showOpenDialog({
				properties: ['openDirectory'],
				title: 'choose folder: ' + msg,
				message: msg
			});
			return dir[0].replace(/\\/g, '/');
		} catch (ror) {
			err(ror);
		}
		return;
	}

	this.selectFile = function(msg) {
		let file = '';
		try {
			file = dialog.showOpenDialog({
				properties: ['openFile'],
				title: 'choose file: ' + msg,
				message: msg
			});
			return file[0].replace(/\\/g, '/');
		} catch (ror) {
			err(ror);
		}
		return;
	}
}
module.exports = new ElectronWrap();
