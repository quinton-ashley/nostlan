module.exports = async function(opt) {
	global.log = console.log;
	global.er = console.error;
	global.__rootDir = opt.__rootDir;
	global.pkg = require(__rootDir + '/package.json');

	global.delay = require('delay');
	global.fs = require('fs-extra');
	global.os = require('os');
	global.opn = require('opn');
	global.path = require('path');
	global.process = require('process');
	global.spawn = require('await-spawn');

	global.klaw = function(dir, options) {
		return new Promise((resolve, reject) => {
			let items = [];
			let i = 0;
			require('klaw')(dir, options)
				.on('data', item => {
					if (i > 0) {
						items.push(item.path);
					}
					i++;
				})
				.on('end', () => resolve(items))
				.on('error', (err, item) => reject(err, item));
		});
	};

	global.osType = os.type();
	global.linux = (osType == 'Linux');
	global.mac = (osType == 'Darwin');
	global.win = (osType == 'Windows_NT');
	if (win) {
		osType = 'win';
	} else if (mac) {
		osType = 'mac';
	} else if (linux) {
		osType = 'linux';
	}

	String.prototype.insert = function(insert, index) {
		return this.substr(0, index) + insert + this.substr(index);
	}

	if (!opt.electron) {
		return;
	}

	global.remote = require('electron').remote;
	global.app = remote.app;
	global.dialog = remote.dialog;

	dialog.select = function(lopt) {
		lopt = lopt || {};
		let files = [];
		if (lopt.types || lopt.type) {
			let types = lopt.types || lopt.type;
			let properties = [];
			if (typeof types == 'string') {
				types = [types];
			} else if (!types) {
				types = [];
			}
			if (types.includes('file')) {
				properties.push('openFile');
			}
			if (types.includes('dir')) {
				properties.push('openDirectory');
			}
			if (types.includes('multi') || types.includes('files')) {
				properties.push('multiSelections');
			}
			lopt.properties = properties;
		} else {
			lopt.properties = ['openFile', 'openDirectory', 'multiSelections'];
		}
		lopt.title = lopt.msg;
		lopt.message = lopt.msg;
		try {
			files = dialog.showOpenDialog(lopt);
		} catch (ror) {
			er(ror);
		}
		if (win) {
			for (let i in files) {
				files[i] = files[i].replace(/\\/g, '/');
			}
		}
		return (files && files.length == 1) ? files[0] : files;
	};

	dialog.selectFile = function(msg, lopt) {
		lopt = lopt || {};
		lopt.type = 'file';
		lopt.msg = 'Select File: ' + msg;
		return dialog.select(lopt);
	};

	dialog.selectFiles = function(msg, lopt) {
		lopt = lopt || {};
		lopt.type = 'files';
		lopt.msg = 'Select Files: ' + msg;
		return dialog.select(lopt);
	};
	dialog.selectMulti = dialog.selectFiles;

	dialog.selectDir = function(msg, lopt) {
		lopt = lopt || {};
		lopt.type = 'dir';
		lopt.msg = 'Select Folder: ' + msg;
		return dialog.select(lopt);
	};
	dialog.selectFolder = dialog.selectDir;

	window.$ = window.jQuery = require('jquery');
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');

	const markdown = require('markdown-it')();
	global.md = (str) => {
		return markdown.render(str);
	};
	const pDog = require('pug');
	global.pug = (str, locals, insert) => {
		str = pDog.compile(str)(locals);
		if (insert) {
			str = str.insert(insert, str.lastIndexOf('<'));
		}
		return str;
	};

	global.Mousetrap = require('mousetrap');
	global.cui = require('contro-ui');
	// global.cui = require('./contro-ui.js');

	Mousetrap.bind(['command+option+i', 'command+shift+i', 'ctrl+shift+i', 'ctrl+alt+i'], function() {
		remote.getCurrentWindow().toggleDevTools();
		return false;
	});
	Mousetrap.bind(['command+r', 'ctrl+r'], function() {
		remote.getCurrentWindow().reload();
		return false;
	});
	Mousetrap.bind('space', function() {
		return false;
	});
	let directions = ['up', 'down', 'left', 'right'];
	for (let direction of directions) {
		cui.bind(direction, direction);
	}
	cui.bind(['command+w', 'ctrl+w', 'command+q', 'ctrl+q'], 'quit');
};
