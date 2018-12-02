const ElectronWrap = function() {
	// electron support
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
				title: 'choose folder',
				message: msg
			});
		} catch (ror) {
			err(ror);
		}
		return dir[0].replace(/\\/g, '/');
	}

	this.selectFile = function(msg) {
		let file = '';
		try {
			file = dialog.showOpenDialog({
				properties: ['openFile'],
				title: 'choose file',
				message: msg
			});
		} catch (ror) {
			err(ror);
		}
		return file[0].replace(/\\/g, '/');
	}
}
module.exports = new ElectronWrap();
