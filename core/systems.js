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
		emus: ['melonds', 'desmume'],
		mediaType: 'cart',
		gameExts: ['nds', 'tad', 'srl']
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
		// same extensions as wii
	},
	n3ds: {
		name: '3DS',
		fullName: 'Nintendo 3DS',
		emus: ['citra'],
		mediaType: 'cart',
		gameExts: ['3ds', 'cci', 'cxi', 'cfa']
	},
	n64: {
		name: 'N64',
		fullName: 'Nintendo 64',
		emus: ['mupen64plus'],
		mediaType: 'cart',
		gameExts: ['n64', 'rom', 'bin', 'jap', 'pal', 'usa', 'eur', 'u64', 'v64', 'z64', 'd64']
	},
	nes: {
		name: 'NES',
		fullName: 'Nintendo Entertainment System',
		emus: ['mesen', 'em-fceux'],
		mediaType: 'cart',
		gameExts: ['nes', 'fds']
	},
	ps2: {
		name: 'PS2',
		fullName: 'Sony PlayStation 2',
		emus: ['pcsx2'],
		mediaType: 'disc',
		gameExts: ['iso']
	},
	ps3: {
		name: 'PS3',
		fullName: 'Sony PlayStation 3',
		emus: ['rpcs3'],
		mediaType: 'disc',
		gameExts: ['iso']
	},
	// smd: {
	// 	name: 'SMD',
	// 	fullName: 'SEGA Genesis',
	// 	emus: ['emulatrix-sega-genesis'],
	// 	mediaType: 'cart',
	//	gameExts: ['smd', 'gen', '32x', 'bin', 'rom']
	// },
	snes: {
		name: 'SNES',
		fullName: 'Super Nintendo',
		emus: ['bsnes', 'snes9x'],
		mediaType: 'cart',
		gameExts: ['snes', 'smc', 'sfc']
	},
	switch: {
		name: 'Switch',
		fullName: 'Nintendo Switch',
		emus: ['ryujinx', 'ryujinx-ldn', 'yuzu'],
		mediaType: 'cart',
		gameExts: ['nsp', 'xci', 'nca', 'nso']
	},
	wii: {
		name: 'Wii',
		fullName: 'Nintendo Wii',
		emus: ['dolphin'],
		mediaType: 'disc',
		gameExts: ['gcm', 'iso', 'tgc', 'gcz', 'rvz', 'wbfs', 'wad', 'elf', 'dol']
	},
	wiiu: {
		name: 'Wii U',
		fullName: 'Nintendo Wii U',
		emus: ['cemu'],
		mediaType: 'disc',
		gameExts: ['rpx', 'rpl', 'wud', 'wux']
	},
	xbox360: {
		name: 'Xbox 360',
		fullName: 'Microsoft Xbox 360',
		emus: ['xenia'],
		mediaType: 'disc',
		gameExts: ['iso']
	}
};
