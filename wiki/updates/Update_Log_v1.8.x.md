Nostlan is an open source _high quality_ front-end launcher for video game emulators! Available on Linux, macOS, and Windows. Systems supported: Arcade, DS, GBA, 3DS, PS2, PS3, SNES, Switch, Wii, Wii U, and Xbox 360. Emulators supported: bsnes, Cemu, Citra, Dolphin, DeSmuME, MAME, melonDS, mGBA, PCSX2, RPCS3, Ryujinx, Xenia, and Yuzu.

[Download Nostlan](https://github.com/quinton-ashley/nostlan/releases) and if you enjoy the app [please make a donation](https://www.paypal.me/qashto/20), any amount is appreciated. [Support the development of Nostlan on patreon](https://www.patreon.com/nostlan) to gain access to premium features!

This update log covers changes made in v1.8.x. Unfamiliar with Nostlan? [Read about its features and look at screenshots on the readme page.](https://github.com/quinton-ashley/nostlan/blob/master/README.md)

<p><a href="https://www.patreon.com/qashto">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/banner.png">
</a></p>

## Update Summary for v1.8.x

SNES game library support added, with bsnes as the default emulator. Support for alternate emulators! Switch games can be played with yuzu (default) or ryujinx . DS games can be played with melonDS (default) or DeSmuME.

#### Emulators

- SNES game lib support with bsnes as the default emulator (bsnes-hd on macOS)
- Ryujinx support (alt Switch emulator that can run 32bit games)
- running Yuzu without a game will run the maintenancetool updater

#### User Experience

- the readme page was way too long, I broke it up into wiki pages. I've put a good amount of effort into documenting Nostlan on the wiki. I hope you find it helpful!
- mouse hides automatically when using a controller, reappears when moved
- fixed scroll stuttering by completely replacing the old scrolling mechanics with a better method for achieving the same aesthetic results
- improved error checking
- unidentified games and games with no cover art will now be shown with handwritten labels that can be edited! Older versions of Nostlan ignored them.
- More intuitive UI labelling. On the game library view, clicking "Sys", short for systems, will open a submenu where you can choose to load another system's game library. Clicking "Play" starts the emulator with the game that the cursor is on. Clicking "Emu", short for emulator(s), will start the emulator without a game so you can update the emulator, setup controllers, etc. In previous versions the labels on the library view were "Power", "Reset", and "Open" just like on a GameCube which aesthetically looked cool but it's just a terrible way to label the functions of those buttons and I should've changed it sooner.

#### Development

- updated open source license to GNU GPLv3
- contro-ui (my controller ui framework) now uses hierarchal submenus, replaced a lot of bodge code

## Coming Soon

#### Emulators

- PSP game lib support with PPSSPP as the default emulator
- snes9x support (alt SNES emulator)
- Dreamcast game lib support with Redream as the default emulator

#### User Interface

- users will be able to manually identify games that could not be automatically identified from Nostlan's game databases and then Nostlan will load cover art for that game
- users will be able to identify game mods (not found in Nostlan's game database), they'll use the cover art of the original game with a label sticker describing the mod.

## Supporting Multiple Emulators per System

When users launch a game, a menu will appear prompting users to choose which emulator they want to play the game with!

When you load this update Nostlan will attempt to reorganize the default paths to your emulators and games. This update breaks compatibility with all older versions of Nostlan. The folders for game images and user game list files have been moved into their respective system folder in `emu`.

    📁 emu (root folder can have any name)
    ├─┬ 📁 nostlan
    │ └── 📁 themes
    ├─┬ 📁 arcade
    │ └─┬ 📁 mame
    │   ├─┬ 📁 roms
    │   │ ├── 💿 1942.zip
    │   │ └── 💿 spang.zip
    │   └── 🎮 mame64.exe
    ├─┬ 📁 ds
    │ ├─┬ 📁 melonds
    │ │ └── 🎮 melonDS.exe
    │ └─┬ 📁 games
    │   ├── 💿 Mario & Luigi - Partners in Time.nds
    │   └── 💿 Mario & Luigi - Partners in Time.sav
    ├─┬ 📁 gba
    │ ├─┬ 📁 mgba
    │ │ └── 🎮 mGBA.exe
    │ └─┬ 📁 games
    │   ├── 💿 Mario & Luigi - Superstar Saga.gba
    │   └── 💿 Mario & Luigi - Superstar Saga.sav
    ├─┬ 📁 n3ds
    │ ├─┬ 📁 citra
    │ │ └─┬ 📁 nightly-mingw
    │ │   └── 🎮 citra-qt.exe
    │ └─┬ 📁 games
    │   └── 💿 Super Mario 3D Land.3ds
    ├─┬ 📁 ps2
    │ ├─┬ 📁 pcsx2
    │ │ └── 🎮 pcsx2.exe
    │ └─┬ 📁 games
    │   └── 💿 Bully.iso
    ├─┬ 📁 ps3
    │ └─┬ 📁 rpcs3
    │   ├─┬ 📁 dev_hdd0
    │   │ └─┬ 📁 game
    │   │   ├── 💿 BLES00760/USRDIR/EBOOT.BIN
    │   │   └── 💿 BLUS30591/USRDIR/EBOOT.BIN
    │   └── 🎮 rpcs3.exe
    ├─┬ 📁 snes
    │ ├─┬ 📁 bsnes
    │ │ └── 🎮 bsnes.exe
    │ └─┬ 📁 games
    │   └── 💿 Super Mario World.sfc
    ├─┬ 📁 switch
    │ ├── 📁 yuzu
    │ └─┬ 📁 games
    │ 	└── 💿 Super Mario Odyssey.xci
    ├─┬ 📁 wii
    │ ├─┬ 📁 dolphin
    │ │ ├── 📁 User
    │ │ ├── 📄 portable.txt
    │ │ └── 🎮 Dolphin.exe
    │ └─┬ 📁 games
    │   ├── 💿 Super Mario Sunshine.gcz
    │   ├── 💿 Super Smash Bros Melee.iso
    │   └── 💿 sm64.wad
    ├─┬ 📁 wiiu
    │ ├─┬ 📁 cemu
    │ │ └── 🎮 Cemu.exe
    │ └─┬ 📁 games
    │   └── 💿 Mario Kart 8/code/Turbo.rpx
    └─┬ 📁 xbox360
      ├─┬ 📁 xenia
      │ └── 🎮 xenia.exe
      └─┬ 📁 games
        ├── 💿 Halo 4 (disc a).iso
        └── 💿 Halo 4 (disc b).iso

Due to these huge changes, v1.8.x breaks compatibility with older versions of Nostlan. No going back!

## Let me know what you think about Nostlan

Nostlan is an experimental project but I want to make it intuitive and useful for the general public! If something is wrong with the app or if you have any questions please email me <mailto:qashto@gmail.com> or write up an issue report on Github. What do you think of the premium features I have planned?

## Premium Features

Support the development of Nostlan on [Patreon](https://www.patreon.com/qashto) to gain access to these premium features!

- backup/sync all your save data to the cloud or local storage device
- custom ui themeing (coming soon)

Features that might be offered in the future:

- support for PC games, making Nostlan able to launch all your games
- single click to install emulators/updates
- database of Dolphin texture packs
- batch install and auto-update texture packs for Dolphin
- easy way to mix and swap texture packs for Dolphin

## If you like using Nostlan please donate!

Hi my name is Quinton and this is the part where I beg you for money! Even though I decided to make this project open source and free to use, it still took a lot of work and a long time to develop. If you appreciate my work so far and will continue to use Nostlan please [donate](https://www.paypal.me/qashto/10) an amount of your choosing. If everyone that downloads this update gave me even $1 I would really appreciate it. Cloud saving is coming soon for Patreon supporters. Thank you!

Support on Patreon:  
<https://www.patreon.com/qashto>

Donate via Paypal:  
<https://www.paypal.me/qashto/20>
