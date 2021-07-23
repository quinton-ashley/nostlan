const log = console.log;

class Nostlan_iodine {
	constructor() {
		this.btns = ['a', 'b', 'select', 'start', 'right', 'left', 'up', 'down', 'r', 'l'];
		this.ready = false;
		this.cfg = {};
	}

	async launch(game, cfg) {
		this.cfg = cfg;

		let bios = await fetch(cfg.bios);
		bios = await bios.arrayBuffer();
		bios = new Uint8Array(bios);
		IodineGUI.Iodine.attachBIOS(bios);

		let rom = await fetch(game.file);
		rom = await rom.arrayBuffer();
		rom = new Uint8Array(rom);
		IodineGUI.Iodine.attachROM(rom);

		IodineGUI.Iodine.play();
		IodineGUI.Iodine.Iodine.audio.mixer.audio.setupWebAudio();

		IodineGUI.Blitter.setSmoothScaling(false);

		this.mute(cfg.mute);

		this.ready = true;
	}

	// The array index below corresponds to the button bit index.
	controIn(contro) {
		if (!this.ready) return;
		let port = contro.port;
		for (let i in this.btns) {
			if (contro.btns[this.btns[i]] == 1) {
				IodineGUI.Iodine.keyDown(i);
			} else {
				IodineGUI.Iodine.keyUp(i);
			}
		}
	}

	close() {}

	pause(toggle) {
		if (typeof toggle == 'undefined') toggle = true;
		if (toggle) {
			IodineGUI.Iodine.pause();
		} else {
			IodineGUI.Iodine.play();
		}
	}

	unpause() {
		this.pause(false);
	}

	setVolume(level) {
		level = level || this.cfg.volume;
		IodineGUI.mixerInput.setVolume(level / 100);
	}

	mute(toggle) {
		if (toggle || typeof toggle == 'undefined') {
			IodineGUI.mixerInput.setVolume(0);
		} else {
			this.unmute();
		}
	}

	unmute() {
		this.setVolume();
	}

	saveState(slot) {
		// if (typeof slot == 'number') {
		// 	this.fceux.setState(slot);
		// }
		// this.fceux.saveState();
		//
		// let data = this.fceux.exportSaveFiles();
		// data = data['rom.fc' + slot];
		// data = Array.from(data);
		// let ping = {
		// 	saveState: {
		// 		slot: slot,
		// 		data: data,
		// 		ext: '.fc' + slot
		// 	}
		// };
		// sendToNostlan(JSON.stringify(ping));
	}

	loadState(slot) {
		// if (typeof slot == 'number') {
		// 	this.fceux.setState(slot);
		// }
		// this.fceux.loadState();
	}
}

let jsEmu = new Nostlan_iodine();
