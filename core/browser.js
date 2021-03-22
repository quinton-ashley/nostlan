class Browser {
	constructor() {
		this.url;
		this.browser;
	}

	async goTo(url) {
		if (!this.browser) {
			const wind = electron.BrowserWindow.getFocusedWindow();
			this.browser = new electron.BrowserView({
				webPreferences: {
					sandbox: true,
					nodeIntegration: false,
					contextIsolation: true,
					preload: __root + '/core/browser_preload.js'
				}
			});
			wind.setBrowserView(this.browser);
		}

		let w = $('body').width();
		let h = $('body').height();
		this.browser.setBounds({
			x: Math.round(w / 4),
			y: Math.round(h / 4),
			width: Math.round(w / 2),
			height: Math.round(h / 2)
		});

		if (this.url != url) {
			this.browser.webContents.loadURL(url);
			this.url = url;
		}
	}

	close() {
		this.browser.setBounds({
			x: 0,
			y: 0,
			width: 0,
			height: 0
		});
	}
}

module.exports = new Browser();
