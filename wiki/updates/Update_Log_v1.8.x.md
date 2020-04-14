Nostlan is an open source _high quality_ front-end launcher for video game emulators! Available on Linux, macOS, and Windows. Systems supported: Arcade, DS, GBA, 3DS, PS2, PS3, SNES, Switch, Wii, Wii U, and Xbox 360. Emulators supported: bsnes, Cemu, Citra, Dolphin, DeSmuME, MAME, melonDS, mGBA, PCSX2, RPCS3, Ryujinx, Xenia, and Yuzu.

[Download Nostlan](https://github.com/quinton-ashley/nostlan/releases) and if you enjoy the app [please make a donation](https://www.paypal.me/qashto/20), any amount is appreciated. [Support the development of Nostlan on patreon](https://www.patreon.com/nostlan) to gain access to premium features!

This update log covers changes made in v1.8.x. Unfamiliar with Nostlan? [Read about its features and look at screenshots on the readme page.](https://github.com/quinton-ashley/nostlan/blob/master/README.md)

## Update Summary for v1.8.x

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/snes.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/snes_LQ.png">
</a></p>

#### Emulators

- SNES game lib support with [bsnes](https://byuu.org/bsnes) as the default emulator (on macOS and Linux use [bsnes-hd](https://github.com/DerKoun/bsnes-hd/releases))
- Support for alternate emulators! DS games can be played with melonDS (default) or DeSmuME.
- running Yuzu without a game will run the maintenancetool updater

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wiiu_boxOpenMenu.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wiiu_boxOpenMenu_LQ.png">
</a></p>

#### User Experience

- Open box menu added for Wii U, Switch, GBA, Arcade, and SNES. The only systems missing this feature are the PS3 and 3DS.
- The readme page was way too long, I broke it up into separate wiki pages. I've put a lot more effort into documenting Nostlan on the wiki. I hope you find it helpful!
- mouse hides automatically when using a controller, reappears when moved
- fixed the stuttering when scrolling by completely replacing the old scrolling mechanics with a better method for achieving the same aesthetic results
- Unidentified games and games with no cover art will now be shown with handwritten labels that can be edited! Older versions of Nostlan ignored them.
- More intuitive UI labelling. On the game library view, clicking "Sys", short for systems, will open a submenu where you can choose to load another system's game library. Clicking "Play" starts the emulator with the game that the cursor is on. Clicking "Emu", short for emulator(s), will start the emulator without a game so you can update the emulator, setup controllers, etc. In previous versions the labels on the library view were "Power", "Reset", and "Open" just like on a GameCube which aesthetically looked cool but it's just a terrible way to label the functions of those buttons and I should've changed it sooner.
- Precise Nintendo Switch game identification! Nostlan uses `yuzu-cmd.exe` to identify your games using its 16 hex digit title id. Since the Switch is a current gen console a complete database for switch games that has all the title ids doesn't exist yet ofc. Nostlan's Switch database has some title id's for older Nintendo Switch games. I added some newer ones myself for the most popular games.
- Precise SNES game identification! Nostlan uses `icarus.exe` to identify SNES games. It doesn't work on some files but it's pretty good with .sfc roms.
- When the user selects a box from the game library menu, the box select menu zooms in on the whole library to focus on that game box. You can scroll and move the cursor to other games in this zoomed in state.
- unlock alternate UI theme color palettes (Patreon supporter premium feature)
- custom UI theming, lets you change the intro loading screens and make your own color palettes (Patreon supporter premium feature)

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/switch_boxSelectMenu.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/switch_boxSelectMenu_LQ.png">
</a></p>

#### Development

- updated open source license to GNU GPLv3
- contro-ui (my controller ui framework) now uses hierarchal submenus. I replaced a lot of bodge code.

## Coming Soon

#### Emulators

- [Ryujinx](https://ryujinx.org/download/) support (alt Switch emulator that can run 32bit games, unlike Yuzu). I planned to have this feature included in v1.8 but it's not working yet. I've submitted a [bug report](https://github.com/Ryujinx/Ryujinx/issues/1106) to the Ryujinx devs. Not a huge deal rn cause the emulator is still in its infancy in terms of game rendering and sound quality.
- snes9x support (alt SNES emulator)

#### User Experience

- users will be able to manually identify games by searching through Nostlan's game databases and then Nostlan will load cover art for that game
- Users will be able to identify game mods that aren't found in Nostlan's game databases. Mod boxes will have the original game art with the mod's title on a label sticker.
- precise Wii/Gamecube/VC game identification using `Dolphin.exe` and robotjs to get the game id values directly from the main ui's game table
- when an emulator app is not found Nostlan will prompt the user for the location of the app or if Nostlan should download and install it automatically

## Supporting Multiple Emulators per System

When users launch a game, a menu will appear prompting users to choose which emulator they want to play the game with!

To implement this new feature in a way that made sense, I had to rethink what the default paths to your emulators and games should be.

If you've used Nostlan before, when you load this update Nostlan will attempt to reorganize the default paths to your emulators and games. This update breaks compatibility with all older versions of Nostlan. The folders for game images and user game list files have been moved into their respective system folder in `emu`.

Example of what the OPTIONAL default Nostlan file structure looks like on Windows. Its optional but I do highly recommend using it as it makes using the Nostlan so much easier. As always, you can edit emulator app and game library locations in your user preferences file. For more info read [Setting up Nostlan](https://github.com/quinton-ashley/nostlan/wiki/Setting-up-Nostlan).

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

## Let me know what you think about Nostlan

Nostlan is an experimental project but I want to make it intuitive and useful for the general public! If something is wrong with the app or if you have any questions please email me <mailto:qashto@gmail.com> or write up an issue report on Github. What do you think of the features I have planned? What should I prioritize?

# Support the Development of Nostlan!

Patreon supporters get premium features for only $1 a month!

- backup/sync game saves to the cloud or local storage device
- unlock alternate UI theme color palettes
- custom UI theming, lets you change the intro loading screens and make your own color palettes

Even though I decided to make this project open source and free to use, it still took a lot of work and a long time to develop. If you appreciate my work so far and will continue to use the app please support its development. Thank you!

Features that might be offered in the future:

- support for your PC game libraries! (Origin, Steam, Epic Games, etc.)

Until I reach my first goal of 100 supporters on Patreon, I will not be able to dedicate any more time to this project for the foreseeable future due to my financial situation. I'm going to make a lot of videos about Nostlan which will hopefully make it easier for new users to start using the app. Ideally I would like to have 200+ supporters to consider working on Nostlan a worthwhile investment of my time. If I could get $1,500 a month from Patreon I could work on Nostlan full time and come out with big updates weekly! If you use Nostlan I really don't think $1 a month is too much to ask. Please support this open source project!
