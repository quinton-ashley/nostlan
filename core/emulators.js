module.exports = (() => {
	let emus = {
		bsnes: {
			name: 'bsnes',
			sys: 'snes',
			appRegex: {
				linux: 'bsnes_hd',
				mac: 'bsnes_hd\\.app',
				win: 'bsnes\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}', '--fullscreen'],
				mac: ['${app}', '${game}', '--fullscreen'],
				win: ['${app}', '${game}', '--fullscreen']
			},
			install: {
				'linux-x86_64': {
					portable: 'https://github.com/DerKoun/bsnes-hd/releases/download/beta_10_4h2/bsnes_hd_beta_10_4_mac.tar.bz2'
				},
				'mac-x86_64': {
					portable: 'https://github.com/DerKoun/bsnes-hd/releases/download/beta_10_4h2/bsnes_hd_beta_10_4_linux.tar.bz2'
				},
				'win-x86_64': {
					portable: 'https://github.com/bsnes-emu/bsnes/releases/download/nightly/bsnes-windows.zip'
				}
			}
		},
		cemu: {
			name: 'Cemu',
			sys: 'wiiu',
			appRegex: {
				linux: 'Cemu\\.exe',
				mac: 'Cemu\\.exe',
				win: 'Cemu\\.exe'
			},
			cmd: {
				linux: ['wine', '${app}', '-g', '${game}', '-f'],
				mac: ['wine', '${app}', '-g', '${game}', '-f'],
				win: ['${app}', '-g', '${game}', '-f']
			},
			install: {
				'linux-x86_64': {
					portable: 'https://cemu.info/releases/cemu_1.22.11.zip'
				},
				'mac-x86_64': {
					portable: 'https://cemu.info/releases/cemu_1.22.11.zip'
				},
				'win-x86_64': {
					portable: 'https://cemu.info/releases/cemu_1.22.11.zip'
				}
			}
		},
		citra: {
			name: 'Citra',
			sys: 'n3ds',
			app: {
				linux: 'org.citra.citra-nightly'
			},
			appDirs: {
				mac: [
					'/Applications/Citra/nightly',
					'/Applications/Citra/canary'
				],
				win: [
					'$home/AppData/Local/Citra/nightly-mingw',
					'$home/AppData/Local/Citra/canary-mingw',
					'$emu/nightly-mingw',
					'$emu/canary-mingw'
				]
			},
			appRegex: {
				mac: 'citra-qt\\.app',
				win: 'citra-qt\\.exe'
			},
			cmd: {
				linux: ['flatpak', 'run', '${app}', '${game}', '-f'],
				mac: ['${app}', '${game}', '-f'],
				win: ['${app}', '${game}', '-f']
			},
			install: {
				'linux-x86_64': {
					pkgManager_flatpak: [
						['flatpak', 'remote-add', '--if-not-exists', 'flathub', 'https://flathub.org/repo/flathub.flatpakrepo'],
						['flatpak', 'install', 'https://flatpak.citra-emu.org/citra-nightly.flatpakref'],
						['flatpak', 'install', 'https://flatpak.citra-emu.org/citra-canary.flatpakref']
					]
				},
				'mac-x86_64': {
					installer: 'https://github.com/citra-emu/citra-web/releases/latest/download/citra-setup-mac.dmg'
				},
				'win-x86_64': {
					installer: 'https://github.com/citra-emu/citra-web/releases/latest/download/citra-setup-windows.exe'
				}
			},
			saveDirs: {
				linux: ['$home/.local/share/citra-emu/sdmc'],
				mac: ['$home/.local/share/citra-emu/sdmc'],
				win: ['$home/AppData/Roaming/Citra/sdmc']
			}
		},
		desmume: {
			name: 'DeSmuME',
			sys: 'ds',
			app: {
				linux: 'desmume'
			},
			appRegex: {
				mac: 'DeSmuME.*\\.app',
				win: 'DeSmuME.*\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}'],
				mac: ['${app}', '${game}'],
				win: ['${app}', '${game}']
			},
			install: {
				'linux-x86_64': {
					pkgManager_arch: ['pacman', '-s', '${app}']
				},
				'mac-x86_64': {
					standalone: 'https://drive.google.com/uc?export=download&id=1XGf24WNHTkewXGD9_U7kH49nsjdYDrcK .zip'
				},
				'win-x86_64': {
					standalone: 'https://ci.appveyor.com/api/buildjobs/yk4i2mh53wukiy4d/artifacts/desmume%2Fsrc%2Ffrontend%2Fwindows%2F__bins%2FDeSmuME-VS2019-x64-Release.exe'
				}
			},
			fullscreenKeyCombo: {
				linux: ['f11'],
				win: ['enter', 'alt']
			}
		},
		dolphin: {
			name: 'Dolphin',
			sys: 'wii',
			app: {
				linux: 'dolphin-emu'
			},
			appRegex: {
				mac: 'dolphin\\.app',
				win: 'Dolphin\\.exe'
			},
			cmd: {
				linux: ['${app}', '-e', '${game}'],
				mac: ['${app}', '-e', '${game}'],
				win: ['${app}', '-e', '${game}']
			},
			install: {
				'linux-x86_64': {
					pkgManager_arch: ['pacman', '-S', '${app}']
				},
				'mac-x86_64': {
					installer: 'https://dl.dolphin-emu.org/builds/84/d3/dolphin-master-5.0-12247.dmg'
				},
				'win-x86_64': {
					portable: 'https://dl.dolphin-emu.org/builds/99/df/dolphin-master-5.0-12247-x64.7z'
				}
			}
		},
		'em-fceux': {
			name: 'em-fceux',
			sys: 'nes',
			app: '$emu/launch.js',
			jsEmu: true,
			install: {
				jsEmu: [
					'https://unpkg.com/em-fceux/dist/fceux.js',
					'https://unpkg.com/em-fceux/dist/fceux.wasm'
				]
			},
			latestVersion: '1.1.0',
			dev: false,
			mute: false,
			volume: 20,
			keyboard: [{},
				{}
			]
		},
		iodine: {
			name: 'IodineGBA',
			sys: 'gba',
			app: '$emu/launch.js',
			bios: '$emu/bios.bin',
			jsEmu: true,
			install: {
				jsEmu: 'https://github.com/taisel/IodineGBA/archive/master.zip'
			},
			latestVersion: '1.0.0',
			dev: false,
			mute: false,
			volume: 20,
			keyboard: [{},
				{}
			]
		},
		mame: {
			name: 'MAME',
			sys: 'arcade',
			app: {
				linux: 'mame'
			},
			appDirs: {
				linux: ['$home/.mame']
			},
			gamesDir: 'roms',
			imagesDir: 'artwork',
			appRegex: {
				mac: 'mame',
				win: 'mame\\.exe'
			},
			cmd: {
				linux: ['${app}', '-inipath', '${cwd}', '${game.id}'],
				mac: ['${app}', '-inipath', '${cwd}', '${game.id}'],
				win: ['${app}', '-inipath', '${cwd}', '${game.id}']
			},
			install: {
				'mac-x86_64': {
					portable: 'https://sdlmame.lngn.net/mame0230-x86.zip'
				},
				'win-x86_64': {
					portable: 'https://github.com/mamedev/mame/releases/download/mame0230/mame0230b_64bit.exe'
				}
			}
		},
		melonds: {
			name: 'melonDS',
			sys: 'ds',
			appRegex: {
				linux: 'melonDS',
				win: 'melonDS\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}'],
				win: ['${app}', '${game}']
			},
			install: {
				'linux-x86_64': {
					portable: 'http://melonds.kuribo64.net/downloads/melonDS_0.9.2_linux64.7z'
				},
				'linux-arm': {
					portable: 'http://melonds.kuribo64.net/downloads/melonDS_0.9.2_linuxARM.7z'
				},
				'mac-x86_64': {
					installer: 'http://melonds.kuribo64.net/downloads/melonDS_0.9.2_mac64.dmg'
				},
				'mac-arm': {
					installer: 'http://melonds.kuribo64.net/downloads/melonDS_0.9.2_macARM.dmg'
				},
				'win-x86_64': {
					portable: 'http://melonds.kuribo64.net/downloads/melonDS_0.9.2_win64.7z'
				}
			}
		},
		mesen: {
			name: 'mesen',
			sys: 'nes',
			appRegex: {
				win: 'Mesen\\.exe'
			},
			cmd: {
				win: ['${app}', '${game}']
			},
			install: {
				'win-x86_64': {
					standalone: 'https://www.mesen.ca/download.php'
				}
			},
			fullscreenKeyCombo: {
				linux: ['f11'],
				win: ['f11']
			}
		},
		mgba: {
			name: 'mGBA',
			sys: 'gba',
			app: {
				linux: 'mgba-sdl'
			},
			appRegex: {
				mac: 'mGBA\\.app',
				win: 'mgba-sdl\\.exe'
			},
			cmd: {
				linux: ['${app}', '-f', '${game}'],
				mac: ['${app}', '-f', '${game}'],
				win: ['${app}', '-f', '${game}']
			},
			install: {
				'linux-x86_64': {
					pkgManager_arch: ['pacman', '-S', '${app}']
				},
				'mac-x86_64': {
					standalone: 'https://github.com/mgba-emu/mgba/releases/download/0.8.3/mGBA-0.8.3-osx.tar.xz'
				},
				'win-x86_64': {
					portable: 'https://github.com/mgba-emu/mgba/releases/download/0.8.3/mGBA-0.8.3-win64.7z'
				}
			},
			fullscreenKeyCombo: {
				mac: ['f', 'command']
			}
		},
		pcsx2: {
			name: 'PCSX2',
			sys: 'ps2',
			app: {
				linux: 'pcsx2'
			},
			appRegex: {
				win: 'pcsx2\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}', '--nogui', '--fullscreen'],
				win: ['${app}', '${game}', '--nogui', '--fullscreen']
			},
			install: {
				'linux-x86_64': {
					pkgManager_arch: ['pacman', '-S', '${app}']
				},
				'win-x86_64': {
					portable: 'https://pcsx2.net/download/releases/windows/send/40-windows/119-pcsx2-1-4-0-binaries.html'
				}
			}
		},
		rpcs3: {
			name: 'RPCS3',
			sys: 'ps3',
			appRegex: {
				linux: 'rpcs3.*\\.AppImage',
				win: 'rpcs3\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}'],
				win: ['${app}', '${game}']
			},
			install: {
				'linux-x86_64': {
					standalone: 'https://github.com/RPCS3/rpcs3-binaries-linux/releases/download/build-264df11132f222ba7c2dcdada79909ece21f1316/rpcs3-v0.0.12-10950-264df111_linux64.AppImage'
				},
				'win-x86_64': {
					portable: 'https://github.com/RPCS3/rpcs3-binaries-win/releases/download/build-264df11132f222ba7c2dcdada79909ece21f1316/rpcs3-v0.0.12-10950-264df111_win64.7z'
				}
			}
		},
		ryujinx: {
			name: 'Ryujinx',
			sys: 'switch',
			appRegex: {
				linux: '^Ryujinx',
				mac: '^Ryujinx',
				win: '^Ryujinx\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}'],
				mac: ['${app}', '${game}'],
				win: ['${app}', '${game}']
			},
			site: 'https://ryujinx.org/',
			patreon: 'https://www.patreon.com/ryujinx',
			install: {
				'linux-x86_64': {
					portable: 'https://ci.appveyor.com/api/buildjobs/kqvbvvbkpmwe2nh6/artifacts/ryujinx-1.0.6846-linux_x64.tar.gz'
				},
				'mac-x86_64': {
					portable: 'https://ci.appveyor.com/api/buildjobs/xfcucfdape4klhwa/artifacts/ryujinx-1.0.6551-osx_x64.zip'
				},
				'win-x86_64': {
					portable: 'https://ci.appveyor.com/api/buildjobs/7m60tgm9086anlvk/artifacts/ryujinx-1.0.6551-win_x64.zip'
				}
			},
			fullscreenKeyCombo: {
				linux: ['f11'],
				win: [11000, ['f11']]
			}
		},
		'ryujinx-ldn': {
			name: 'Ryujinx LDN',
			sys: 'switch',
			appRegex: {
				linux: '^Ryujinx',
				mac: '^Ryujinx',
				win: '^Ryujinx\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}'],
				mac: ['${app}', '${game}'],
				win: ['${app}', '${game}']
			},
			install: {
				'linux-x86_64': {
					portable: 'https://www.patreon.com/file?h=45268370&i=7206532 .zip'
				},
				'win-x86_64': {
					portable: 'https://www.patreon.com/file?h=45268370&i=7206533 .zip'
				}
			},
			fullscreenKeyCombo: {
				linux: ['f11'],
				win: [11000, ['f11']]
			}
		},
		snes9x: {
			name: 'snes9x',
			sys: 'snes',
			app: {
				linux: 'snes9x-gtk'
			},
			appRegex: {
				mac: 'snes9x-x64\\.exe',
				win: 'snes9x-x64\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}', '-fullscreen'],
				mac: ['wine64', '${app}', '${game}', '-fullscreen'],
				win: ['${app}', '${game}', '-fullscreen']
			},
			install: {
				'mac-x86_64': {
					portable: 'https://www.emulator-zone.com/download.php/emulators/snes/snes9x/snes9x-1.60-win32-x64.zip'
				},
				'win-x86_64': {
					portable: 'https://www.emulator-zone.com/download.php/emulators/snes/snes9x/snes9x-1.60-win32-x64.zip'
				}
			},
			fullscreenKeyCombo: {
				linux: ['f11'],
				win: ['f11']
			}
		},
		vba: {
			name: 'Visual Boy Advance',
			sys: 'gba',
			app: {
				linux: 'vbam-sdl'
			},
			appRegex: {
				mac: 'visualboyadvance-m\\.app',
				win: 'visualboyadvance-m\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}'],
				mac: ['${app}', '${game}'],
				win: ['${app}', '${game}']
			},
			install: {
				'linux-x86_64': {
					pkgManager_arch: [
						'pacman',
						'-S',
						'${app}'
					]
				},
				'mac-x86_64': {
					standalone: 'https://github.com/visualboyadvance-m/visualboyadvance-m/releases/latest/download/visualboyadvance-m-Mac-64bit.zip'
				},
				'win-x86_64': {
					standalone: 'https://github.com/visualboyadvance-m/visualboyadvance-m/releases/latest/download/visualboyadvance-m-Win-64bit.zip'
				}
			},
			fullscreenKeyCombo: {
				linux: ['f11'],
				win: ['f11']
			}
		},
		yuzu: {
			name: 'Yuzu',
			sys: 'switch',
			appDirs: {
				win: [
					'$home/AppData/Local/yuzu/yuzu-windows-msvc',
					'$home/AppData/Local/yuzu/yuzu-windows-msvc-early-access'
				]
			},
			appRegex: {
				linux: 'yuzu-.*\\.AppImage',
				win: 'yuzu\\.exe'
			},
			cmd: {
				linux: ['${app}', '${game}'],
				win: ['${app}', '${game}']
			},
			site: 'https://yuzu-emu.org/',
			patreon: 'https://www.patreon.com/yuzuteam',
			install: {
				'linux-x86_64': {
					standalone: 'https://github.com/yuzu-emu/yuzu-mainline/releases/download/mainline-0-588/yuzu-20210411-9c1e7b5f5.AppImage'
				},
				'win-x86_64': {
					prereq: 'https://aka.ms/vs/16/release/vc_redist.x64.exe',
					installer: 'https://github.com/yuzu-emu/liftinstall/releases/download/1.8/yuzu_install.exe'
				}
			},
			update: {
				win: [
					'$home/AppData/Local/yuzu/maintenancetool.exe',
					'--launcher', '${app}'
				]
			},
			fullscreenKeyCombo: {
				linux: ['f11'],
				win: [4000, ['f11']]
			}
		},
		xenia: {
			name: 'Xenia',
			sys: 'xbox360',
			site: 'https://xenia.jp',
			patreon: 'https://patreon.com/xenia_project',
			appRegex: {
				win: 'Xenia\\.exe'
			},
			cmd: {
				win: [
					'${app}',
					'${game}',
					'--draw_resolution_scale=2',
					'--fullscreen'
				]
			},
			install: {
				'win-x86_64': {
					portable: [
						'https://github.com/microsoft/DirectXShaderCompiler/releases/download/v1.6.2104/dxc_2021_04-20.zip',
						'https://ci.appveyor.com/api/projects/benvanik/xenia/artifacts/xenia_master.zip?branch=master&job=Configuration%3A%20Release&pr=false .zip'
					]
				}
			}
		}
	};

	// only keeps the info necessary for the current os + chip arch
	for (let _emu in emus) {

		let props = ['app', 'appDirs', 'appRegex', 'cmd', 'update', 'install', 'fullscreenKeyCombo'];

		for (let prop of props) {
			if (!emus[_emu][prop]) continue;
			let type = osType;
			if (prop == 'install') type += '-' + prefs.chip_arch;

			if (emus[_emu][prop][type]) {
				emus[_emu][prop] = emus[_emu][prop][type];
			} else {
				delete emus[_emu][prop];
			}
		}
	}

	return emus;
})();
