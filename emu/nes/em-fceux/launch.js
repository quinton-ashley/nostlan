let fceux;

class Nostlan_em_fceux {
	constructor() {
		this.bits = 0;
		this.btns = ['a', 'b', 'select', 'start', 'up', 'down', 'left', 'right'];
	}

	async launch(game) {
		fceux = await FCEUX();
		// Initialize the instance (creates Web Audio etc.)
		fceux.init('#screen0');

		// Download a game ROM and start it.
		fceux.downloadGame(game.file);

		// Run the emulation update loop.
		// Use requestAnimationFrame() to synchronise to repaints.
		function updateLoop() {
			window.requestAnimationFrame(updateLoop);
			fceux.update();
		}
		window.requestAnimationFrame(updateLoop);
	}

	// The array index below corresponds to the button bit index.
	// ['A','B','Select','Start','Up','Down','Left','Right']
	btnPress(port, btn) {
		let idx = this.btns.indexOf(btn);
		idx *= (port + 1);
		for (let i = 0; i < 16; i++) {
			if (i == idx) {
				this.bits |= 1 << i;
			} else {
				this.bits &= ~(1 << i);
			}
		}
		fceux.setControllerBits(this.bits);
	}

	async close() {}
}

let jsEmu = new Nostlan_em_fceux();
