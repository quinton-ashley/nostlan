module.exports = async function(arg) {
	global.arg = arg;
	global.log = console.log;
	global.er = console.error;
	global.__rootDir = arg.__rootDir;
	global.pkg = require(__rootDir + '/package.json');

	global.delay = require('delay');
	global.fs = require('fs-extra');
	global.os = require('os');
	global.opn = require('open');
	global.path = require('path');
	global.process = require('process');
	global.spawn = require('await-spawn');

	global.klaw = function(dir, opt) {
		return new Promise((resolve, reject) => {
			let items = [];
			let i = 0;
			require('klaw')(dir, opt)
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

	path.nx = (file) => {
		return file.replace(/\\/g, '/');
	};

	if (!arg.electron) {
		return;
	}

	global.electron = require('electron').remote;
	global.app = electron.app;
	global.dialog = electron.dialog;

	dialog.select = function(opt) {
		opt = opt || {};
		let files = [];
		if (opt.types || opt.type) {
			let types = opt.types || opt.type;
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
			opt.properties = properties;
		} else {
			opt.properties = ['openFile', 'openDirectory', 'multiSelections'];
		}
		opt.title = opt.msg;
		opt.message = opt.msg;
		try {
			files = dialog.showOpenDialog(opt);
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

	dialog.selectFile = function(msg, opt) {
		opt = opt || {};
		opt.type = 'file';
		opt.msg = 'Select File: ' + msg;
		return dialog.select(opt);
	};

	dialog.selectFiles = function(msg, opt) {
		opt = opt || {};
		opt.type = 'files';
		opt.msg = 'Select Files: ' + msg;
		return dialog.select(opt);
	};
	dialog.selectMulti = dialog.selectFiles;

	dialog.selectDir = function(msg, opt) {
		opt = opt || {};
		opt.type = 'dir';
		opt.msg = 'Select Folder: ' + msg;
		return dialog.select(opt);
	};
	dialog.selectFolder = dialog.selectDir;

	window.$ = window.jQuery = require('jquery');
	window.Tether = require('tether');
	window.Popper = require('popper.js');
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

	try {
		global.Mousetrap = require('mousetrap');

		let toggleDev;
		if (mac) toggleDev = ['command+option+i', 'command+shift+i'];
		if (win) toggleDev = ['ctrl+alt+i', 'ctrl+shift+i'];

		Mousetrap.bind(toggleDev, function() {
			electron.getCurrentWindow().toggleDevTools();
			return false;
		});
		Mousetrap.bind(['command+r', 'ctrl+r'], function() {
			electron.getCurrentWindow().reload();
			return false;
		});
		Mousetrap.bind('space', function() {
			return false;
		});

		global.cui = require('contro-ui');
		// global.cui = require('./contro-ui.js');

		let directions = ['up', 'down', 'left', 'right'];
		for (let direction of directions) {
			cui.bind(direction, direction);
		}
		cui.bind(['command+w', 'ctrl+w', 'command+q', 'ctrl+q'], 'quit');
	} catch (ror) {}
};
