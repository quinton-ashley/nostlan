#!/usr/bin/env node

const log = console.log;

global.__rootDir = __dirname;
const {
	app,
	BrowserWindow
} = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const setupPug = require('electron-pug');
const {
	autoUpdater
} = require("electron-updater");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

async function createWindow() {
	autoUpdater.checkForUpdatesAndNotify();
	let pkgPath = path.join(__rootDir, 'package.json');
	log(pkgPath);
	let package = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
	log('starting ' + package.name);

	try {
		const locals = {
			title: package.name,
			__rootDir: __rootDir.replace(/\\/g, '/'),
			node_modules: path.join(__rootDir, 'node_modules').replace(/\\/g, '/')
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

	mainWindow = new BrowserWindow({
		width: 3840 / 2,
		height: 2160 / 2,
		frame: false
	});

	mainWindow.loadURL(`file://${__dirname}/views/pug/index.pug`);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
