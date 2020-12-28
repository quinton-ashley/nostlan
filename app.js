#!/usr/bin/env node

/*
 * app.js : Nostlan : quinton-ashley
 *
 * Parses command line args. Starts the app.
 */
(async function() {
	const log = console.log;
	let arg = require('minimist')(process.argv);
	arg.__root = __dirname.replace(/\\/g, '/');
	arg.node_modules = arg.__root + '/node_modules';

	const {
		app,
		BrowserWindow
	} = require('electron');
	app.allowRendererProcessReuse = false;

	// command line options
	if (arg.h || arg.help) {
		log('-h|--help : print command line options');
		log('-v|--version : get the version of the app');
	} else if (arg.v || arg.version) {
		log('v' + require(arg.__root + '/package.json').version);
	} else {
		arg.electron = true;
	}

	if (!arg.electron) {
		app.quit();
		return;
	}

	const fs = require('fs');
	const path = require('path');
	const url = require('url');
	const setupPug = require('electron-pug');

	// Keep a global reference of the window object, if you don't, the window will
	// be closed automatically when the JavaScript object is garbage collected.
	let mainWindow;

	async function createWindow() {
		try {
			const locals = {
				arg: JSON.stringify(arg).replace(/\\/g, '/').replace(/\/\//g, '/'),
				node_modules: arg.node_modules
			};
			log(locals);
			let pug = await setupPug({
				pretty: true
			}, locals);
			// pug.on('error', err => console.error('electron-pug error', err))
			pug.on('error', function() {});
		} catch (err) {
			// Could not initiate 'electron-pug'
			log(err);
		}

		let windowPrms = {
			webPreferences: {
				enableRemoteModule: true,
				nodeIntegration: true,
				webviewTag: true
			}
		};
		if (arg.cli) {
			windowPrms.width = 3840 / 4;
			windowPrms.height = 2160 / 2;
		} else {
			windowPrms.width = 3840 / 2;
			windowPrms.height = 2160 / 2;
			windowPrms.frame = false;
		}

		mainWindow = new BrowserWindow(windowPrms);

		let url = 'file://' + arg.__root;
		if (!arg.cli) {
			url += '/views/index.pug';
		} else if (!arg.cli.includes('.')) {
			url += `/${arg.cli}/cli/${arg.cli}-cli.pug`;
		} else {
			url += arg.cli.slice(1);
		}
		mainWindow.loadURL(url);

		// Open the DevTools.
		if (arg.dev || arg.cli) {
			mainWindow.webContents.openDevTools();
		}

		// Emitted when the window is closed.
		mainWindow.on('closed', function() {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null;
		});
	}

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', createWindow);

	// Quit when all windows are closed.
	app.on('window-all-closed', function() {
		app.quit();
	});

	app.on('activate', function() {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (mainWindow === null) {
			createWindow();
		}
	});

})();
