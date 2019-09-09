#!/usr/bin/env node

(async function() {
	const log = console.log;
	let arg = require('minimist')(process.argv);
	arg.__rootDir = __dirname.replace(/\\/g, '/');
	if (arg.h) {
		log('info about the app');
		return;
	} else {
		arg.electron = true;
	}

	const {
		app,
		BrowserWindow
	} = require('electron');
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
				arg: JSON.stringify(arg),
				node_modules: path.join(arg.__rootDir, 'node_modules').replace(/\\/g, '/')
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
				nodeIntegration: true
			}
		};
		if (arg.scrape || arg.conv) {
			windowPrms.width = 3840 / 4;
			windowPrms.height = 2160 / 2;
		} else {
			windowPrms.width = 3840 / 2;
			windowPrms.height = 2160 / 2;
			windowPrms.frame = false;
		}

		mainWindow = new BrowserWindow(windowPrms);

		let url;
		if (arg.scrape) {
			url = `file://${__dirname}/scrape/scrape.pug`;
		} else if (arg.conv) {
			url = `file://${__dirname}/dev/convert.pug`;
		} else {
			url = `file://${__dirname}/views/pug/index.pug`;
		}
		mainWindow.loadURL(url);

		// Open the DevTools.
		if (arg.dev || arg.scrape || arg.conv) {
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
