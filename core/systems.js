/*
 * systems.js
 *
 * name: the short name
 * fullName: the full name
 * emus: emulators of that system
 * mediaType: cart, disc, or pcb
 * gameExts: game file extensions
 * gamesDir: use if games are stored in emu file structure
 * imagesDir: use if images are stored in emu file structure
 */
module.exports = {
	arcade: {
		name: 'Arcade',
		fullName: 'Arcade',
		emus: ['mame'],
		mediaType: 'pcb'
	},
	ds: {
		name: 'DS',
		fullName: 'Nintendo DS',
		emus: ['desmume', 'melonds'],
		mediaType: 'cart',
		gameExts: ['nds']
	},
	gba: {
		name: 'GBA',
		fullName: 'Nintendo Game Boy Advance',
		emus: ['mgba', 'iodine', 'vba'],
		mediaType: 'cart',
		gameExts: ['gba']
	},
	gcn: {
		name: 'GameCube',
		fullName: 'Nintendo GameCube',
		mediaType: 'disc'
	},
	n3ds: {
		name: '3DS',
		fullName: 'Nintendo 3DS',
		emus: ['citra'],
		mediaType: 'cart'
	},
	nes: {
		name: 'NES',
		fullName: 'Nintendo Entertainment System',
		emus: ['mesen', 'em-fceux'],
		mediaType: 'cart'
	},
	ps2: {
		name: 'PS2',
		fullName: 'Sony PlayStation 2',
		emus: ['pcsx2'],
		mediaType: 'disc'
	},
	ps3: {
		name: 'PS3',
		fullName: 'Sony PlayStation 3',
		emus: ['rpcs3'],
		mediaType: 'disc'
	},
	snes: {
		name: 'SNES',
		fullName: 'Super Nintendo',
		emus: ['bsnes', 'snes9x'],
		mediaType: 'cart',
		gameExts: ['smc', 'sfc']
	},
	switch: {
		name: 'Switch',
		fullName: 'Nintendo Switch',
		emus: ['yuzu', 'ryujinx'],
		mediaType: 'cart'
	},
	wii: {
		name: 'Wii',
		fullName: 'Nintendo Wii',
		emus: ['dolphin'],
		mediaType: 'disc',
		gameExts: ['gcm', 'iso', 'tgc', 'gcz', 'wbfs', 'wad', 'elf', 'dol']
	},
	wiiu: {
		name: 'Wii U',
		fullName: 'Nintendo Wii U',
		emus: ['cemu'],
		mediaType: 'disc'
	},
	xbox360: {
		name: 'Xbox 360',
		fullName: 'Microsoft Xbox 360',
		emus: ['xenia'],
		mediaType: 'disc'
	}
};
