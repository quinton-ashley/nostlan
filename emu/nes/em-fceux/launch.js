class Nostlan_emfceux {
	constructor() {
		this.bits = 0;
		this.btns = ['a', 'b', 'select', 'start', 'up', 'down', 'left', 'right'];
		this.fceux;
		this.ready = false;
	}

	async launch(game) {
		this.fceux = await FCEUX();
		// Initialize the instance (creates Web Audio etc.)
		this.fceux.init('#screen0');

		// Download a game ROM and start it.
		this.fceux.downloadGame(game.file);

		// Run the emulation update loop.
		// Use requestAnimationFrame() to synchronise to repaints.
		let _this = this;

		function updateLoop() {
			window.requestAnimationFrame(updateLoop);
			_this.fceux.update();
		}
		window.requestAnimationFrame(updateLoop);
		this.ready = true;
	}

	// The array index below corresponds to the button bit index.
	// ['A','B','Select','Start','Up','Down','Left','Right']
	controIn(contro) {
		if (!this.ready) return;
		let port = contro.port;
		for (let i = 8 * port; i < 8 * (port + 1); i++) {
			if (contro.btns[this.btns[i % 8]]) {
				this.bits |= 1 << i;
			} else {
				this.bits &= ~(1 << i);
			}
		}
		this.fceux.setControllerBits(this.bits);
	}

	async close() {}
}

let jsEmu = new Nostlan_emfceux();
