# Nostlan

Nostlan is an open source _high quality_ front-end launcher for video game emulators! Available on Linux, macOS, and Windows! Supports Dolphin, Cemu, Yuzu, mGBA, melonDS, Citra, MAME, PCSX2, RPCS3, and Xenia.  
[Download Nostlan](https://github.com/quinton-ashley/nostlan/releases) and if you enjoy the app [please make a donation](https://www.paypal.me/qashto/20), any amount of money is appreciated! [Support the development of Nostlan on patreon](https://www.patreon.com/qashto) to gain access to premium features!

<p><a href="https://www.patreon.com/qashto">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan/master/views/img/icon.png">
</a></p>

## A what?

A front-end or user interface (UI) is the presentation and interaction layer of an app or website. Most modern emulator apps have basic game list UIs that you can interact with using a mouse/keyboard but not a game controller.

Nostlan looks similar to media viewers like Kaleidescape and AppleTV. You can interact with it using a mouse or game controller. Unlike other popular front-end launchers for video game emulators, Nostlan has a minimalistic design that prioritizes box art, not metadata. Check out the screenshots below!

## Features

- unified UI for mouse/gamepad interaction
- designed for UHD displays and projectors
- checks multiple database sites for the highest quality box art
- nostalgic UI themes for each supported console
- uses individual emulators: no cores and no controller input transfer lag
- most controllers connect to Nostlan automatically, no setup required
- Xbox One, PS4 Dualshock, and Switch Pro controllers all supported
- gamecube controller adapter supported with [gca-js](https://github.com/YonicDev/gca-js)
- advanced customization: edit launch commands
- cross-platform support for Linux, macOS, and Windows!
- [PREMIUM FEATURE] backup/sync all your save data to the cloud or local storage device

## Supported Systems and Emulators

(click an image to see it in full quality 4K)

### Wii, Gamecube, Virtual Console [Dolphin]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wii.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wii_LQ.png">
</a></p>

### Wii U [Cemu]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wiiu.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wiiu_LQ.png">
</a></p>

### Switch [Yuzu]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/switch.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/switch_LQ.png">
</a></p>

### 3DS [Citra]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/n3ds.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/n3ds_LQ.png">
</a></p>

### DS [melonDS, DeSmuME]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/ds.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/ds_LQ.png">
</a></p>

### Arcade Machines [MAME]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/mame.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/mame_LQ.png">
</a></p>

### GBA [mGBA]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gba.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gba_LQ.png">
</a></p>

### PS2 [PCSX2]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/ps2.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/ps2_LQ.png">
</a></p>

### PS3 [RPCS3]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/ps3.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/ps3_LQ.png">
</a></p>

### Xbox 360 [Xenia]

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/xbox360.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/xbox360_LQ.png">
</a></p>

## Premium Features

Support the development of Nostlan on [Patreon](https://www.patreon.com/qashto) to gain access to these premium features!

- backup/sync all your save data to the cloud or local storage device
- custom ui theme-ing (coming soon)

<p><a href="https://www.patreon.com/qashto">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/banner.png">
</a></p>

## How to access Premium Features

On startup Nostlan will prompt you to become a Patreon supporter. Every month, Patreon supporters will be able to see a Patreon post with the monthly donor password unique to that month. Select `access premium features` from the donation menu. After you support Nostlan on Patreon, visit Nostlan's Patreon page to get the monthly donor password. Copy the password and paste it into the donor password input. Select `verify password`, if the password is correct you will have access to premium features! Passwords are automatically posted each month.

## How is Nostlan different from other front-ends?

The name Nostlan, is a portmanteau of "nostalgia launcher". When I created Nostlan I wanted to make box art the primary, practically singular, focus of the UI. Many other frontend apps waste a lot of screen space on metadata, menus, descriptions, or just plain empty space.

This is a screenshot of Emulation Station, which is a prime example of this problem.
![](https://emulationstation.org/assets/featurettes/full/theming_list.png)

This is Launchbox for Windows, it's the most popular frontend. Note that a lot of screen space is wasted and the game box art is thumbnail sized.
![](https://www.launchbox-app.com/Resources/Images/Screenshots/Big-Box-Nintendo-GameCube.jpg)

This is Playnite, it has become really popular too. Looks great for managing really large libraries of PC games.
![](https://playnite.link/screen2.jpg)
![](https://playnite.link/screen4.jpg)

Windows Explorer, despite not having gamepad support, is also surprisingly popular. I've seen reddit posts with tutorials on how to make individual executables that launch emulators with a particular game. I think that's a pretty bad substitute for a dedicated launcher app.
![](https://i.redd.it/z7zxgap037p11.png)

Retroarch is a different kind of frontend. It uses separate cores instead of individual emulator apps like Nostlan does. Game art is very low res and the interface is barebones. It runs on a lot of platforms and seems good for small devices.
![](https://d2.alternativeto.net/dist/s/retroarch_203397_full.png?format=jpg&width=1600&height=1600&mode=min&upscale=false)

This is Pegasus, a relatively new project. It has this huge sidebar that I'm not a fan of.
![](https://pegasus-frontend.org/img/screens/s2.jpg)

OpenEmu for macOS is a great app for making controller profiles consistent among different emulator cores. It looks like dark mode Finder. I use it on my Macbook on plane flights and I like it. The covers are low-res and grid spacing is too wide though. It doesn't support newer emulators either.
![](http://openemu.org/img/intro-gb-grid.png)

## Setting up Nostlan

Nostlan is meant to be really easy to setup if you use the Nostlan file structure for your emulators and I recommend it! It is entirely OPTIONAL though, if you don't use it you can pick the locations of your emulators and game libraries as you use Nostlan.

## Nostlan File Structure

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

Nostlan was designed to OPTIONALLY use this template file structure. The default game library for every system will be its `games` folder. As an exception, Nostlan will default to the internal game library of emulators that store games in file structures meant to mimic the system being emulated. For example, RPCS3 has an internal game library that will be located at `emu/ps3/rpcs3/dev_hdd0/game`.

Windows users should not store emulator apps or games in `Program Files` or any other folder that Nostlan will not have read/write access to. Nostlan will look for emulator executables in the `emu/${sys}/${emu}` folder or the default install location of that emulator (no need to move Yuzu).

On macOS, Nostlan will look for emulator apps in `/Applications` or `emu/${sys}/${emu}`. Nostlan needs read/write permission to the install folder. You can have the nostlan.app in `/Applications` but don't install your emulator folder `emu` there.

On Linux, Nostlan will look for emulator apps in their default install locations or in `emu/${sys}/${emu}`.

## Using Nostlan

Nostlan auto detects controllers. The console themed cover overlay menu displays the options on any given screen. Click "Nostlan" or press the "Start" button to view the settings menu. Click "Open" to load another game library. "Reset" will start the emulator without a game. "Power" starts the emulator with the selected game.

## What is Adaptive Button Mapping?

    // Xbox/PS Adaptive profile example
    // for an Xbox One controller:

    // Nintendo: remapped to match button positions
    //  Y B  ->  X A
    // X A  ->  Y B

    // Xbox or MAME: not remapped
    //  Y B  ->  Y B
    // X A  ->  X A

    // Playstation: not remapped (similar btn positions)
    //  Y B  ->  △ ○
    // X A  ->  □ X

Although some may find this confusing at first, adaptive profiles map the button layout of your controller to match the physical button layout of controllers made for the system being emulated. In the NTSC region, Xbox and Playstation use the bottom button of the face button diamond as the "yes" or "make selection" button. Starting with the SNES the B button has been at the bottom of the layout diamond on Nintendo controllers. The B button on Nintendo systems means "no" or "back".

Hence by using an "Adaptive" profile you will always be using the physically correct button layout for the system library you're browsing, regardless of what controller you use!

I recommend using adaptive mapping in your controller settings for each emulator too. This way you can play games using the button layout that game developers intended even if you're using a controller made for a different system.

The other included gamepad mapping profile types are "Consistent", for non-adaptive remapping between controller types and "None", for no mapping, which is not recommended. You can easily change between these options by editing your preferences file. Set `ui.gamepad.profile` to your desired controller profile.

## System Requirements

Nostlan will probably not perform well on low-end systems. Ultra high resolution images require more storage and animations using these images require strong GPUs. Although, I've tested Nostlan on my 2016 Macbook with a 1.1GHz CPU with onboard Intel HD 515 graphics and it runs at 2304x1440 without stuttering too bad with small game libraries.

Warning! If you pay for internet by bandwidth be aware that for large game libraries Nostlan will download a lot of image files and this will take a lot of bandwidth.

## User Preferences

`region` game files without game IDs in their game file name, for example "Super Smash Bros Melee.iso", will be auto assigned to a default region. Use E for North and South America, P for European PAL, J for Japan. Currently you must rename the file of games made for other regions with the proper game ID.

`ui.mouse.wheel.smoothScroll` = false on Windows by default, should be true if you have a mouse that supports smooth scrolling (like an Apple Macbook trackpad)

`ui.mouse.wheel.multi` it's a multiplier that changes the scroll amount.

`ui.getBackCoverHQ` gets the back of the box in high quality for games without available full covers

`session.sys` the last game library viewed, Nostlan will load this library on start-up next time the app is run

`session.{sys}.gameID` the id of the last game that was run for the specified system

`gamepad.profile` the controller profile you want to use

`{sys}.cmd.{os}` the launch command for that game system and os

## Advanced Features: Custom Launch Commands

Edit your preferences file to change the default launch command for each OS. This is an example of Cemu's command object:

```JSON
"cmd": {
	"linux": ["wine", "${app}", "-g", "${game}", "-f"],
	"win": ["${app}", "-g", "${game}", "-f"]
}
```

## Error Reporting

Please [send me](mailto:qashto@gmail.com) a description of any errors with the relevant error log or report an issue on this project's Github.

### Mismatched or Unidentified Games

If Nostlan has trouble matching your game file name, please take a look at the error log. This can be easily accessed in the Nostlan menu. This file will tell you which game files are unidentifiable or lead to incorrect matches. Give these files the proper game title or game ID and Nostlan will be able to find matches in its game databases. I know that using the file name to match the games is not ideal but it should work for most of your games. Some other frontends read the game's header for the game id, I might implement this for certain systems in the far future. MAME does not have this problem but Nostlan might've still downloaded the wrong cover art. If your game was matched in the database but the cover art is wrong email me and let me know.

    file:   Donkey Kong Country Tropical Freeze [ARKE01]
    match:  Donkey Kong Country: Tropical Freeze

### Missing Cover Art

As of v1.2, Nostlan should be able to get nearly all of your game images. If Nostlan can't find images for a game in the Nostlan database you can put cover art in the game's image folder. For more info see the "Images" sections of this README.

## Contributing to Nostlan

You can contribute to Nostlan to add to and update existing game databases, make a PR or email me <mailto:qashto@gmail.com> with your new or updated entries. Game database JSON files can be found in the db folder. Game entries are structured like this:

```javascript
{
 "id": "G8ME01",
 "title": "Paper Mario: The Thousand-Year Door"
}
```

### Game Properties

- `id` is the official id of the game
- `name` the official name of the game, subtitles are delineated using a colon
- `texp` the array of texture pack objects
- `img` an object with `"imgFileName": "url"` pairs

### Texture Packs

- `authors` usernames or real names of the author(s)
- `name` should be short and simple, such as "UHD" or "Blue Edition"
- `png` and `dds` link(s) to direct download the pack
- `pngRP` and `ddsRP` link(s) to resource pack for Dolphin
- `url` link(s) to the relevant forum post or readme
- `version` the semantic version of the pack
- `rate` the pack's rating 1-10
- `patron` donation link(s) to the author(s) of pack

### Images

- `box` the front of the box
- `boxSide` the side of the box
- `boxBack` the back of the box
- `boxOpen` the inside of the game's box
- `boxOpenMask` parts of the game's box, such as manual clips, that should appear above the game media, manual, and memory card
- `cart` the front of the game's (first) cartridge
- `coverFull` the entire cover sleeve, no box
- `cover` the front facing portion of the cover sleeve, no box
- `coverSide` the side facing portion of the cover sleeve, no box
- `coverBack` the side facing portion of the cover sleeve, no box
- `disc` the front of the game's (first) disc
- `manual` the front of the game's manual
- `memory` the front of a memory card
- `memoryBack` the back of a memory card
- `promo` a promotional insert included in the game box

Images can be `.png` or `.jpg`. Put your images in `emu/nostlan/{sys}/{game.id}`. You can access this folder by clicking on the game's box twice in Nostlan and then clicking on "ImgDir". Front cover box art is prioritized in this order: box, coverFull, cover.

## Development Info

Nostlan is open source! I loved using Electron to make Nostlan. I highly recommend it to developers interested in creating native desktop apps with node.js. Nostlan is written in Javascript, Pug, HTML and CSS. It uses jQuery, Bootstrap, and Contro.

## Contributing to Nostlan (code)

PRs are welcome! No callback pyramids, use Async/Await whenever possible. Do not write plain JS novels when editing the DOM, just use jQuery please. Email me if you want to collaborate on this project!

## Credits

Obviously, Nostlan wouldn't exist without the developers of all the emulators it acts as a frontend for. Please support the development of the emulators you use!

### Databases

ds, n3ds, switch, wii, wiiu:
[gametdb.com](https://www.gametdb.com/)
ps1, ps2, psp:
[psxdatacenter.com](http://psxdatacenter.com)
xbox360:
[gamesdatabase.org](https://www.gamesdatabase.org/xbox_360_games_list_with_title_ids)

### Game Artwork

Nostlan downloads publicly available images under Fair Use.

High quality box scans of popular games for many systems are downloaded from [Andy Decarli's image database](http://andydecarli.com/Video%20Games/Collection).

Covers, boxes, and discs/carts for Wii/Gamecube, DS, Wii U, 3DS, Switch, and PlayStation 3 are downloaded from [gametdb](https://www.gametdb.com/).

Most PS2 and GBA game artwork is downloaded from [The Cover Project](http://www.thecoverproject.net/) and [gamefaqs](https://gamefaqs.gamespot.com).

Archival quality images of arcade game flyers for MAME are downloaded from [FlyerFever](https://www.flyerfever.com/) these images are hosted by [Tumblr](https://www.tumblr.com/). MAME arcade cabinet artwork is downloaded from [Mr. Do's Arcade](http://www.mameworld.info/mrdo/mame_artwork_ingame.php).

These sites are incredible resources thanks to all the people that created them and submit game art to them.

### Template Art

- Gamecube, Wii, and Wii U templates by etschannel via deviantart
- Switch template by ponces245 via deviantart
- PS3 template by the_prototype92 via deviantart
- 3DS template by omegaaaronyt via deviantart
- Xbox 360 template by georgiajedward via deviantart

### Themes

As of yet, all themes were made by me (quinton-ashley/qashto)

[CSS PlayStation button icons were adapted from a CodePen by Hugo Giraudel](https://codepen.io/HugoGiraudel/pen/iJphI)

### Loading Sequences

[Gamecube Intro by MarcMalignan : MIT licensed](https://codepen.io/MarcMalignan/pen/doCth)

[DS by Murat Khatypov](https://codepen.io/AntonEssenetial/pen/LtBaK)

[Switch Pure CSS by joshbader : MIT licensed](https://codepen.io/joshbader/pen/mjZzGM)

[Wii U Gamepad SVG by Tokyoship from Wikimedia Commons : Creative Commons Attribution 3.0 Unported](https://en.wikipedia.org/wiki/File:Wii_U_controller_illustration.svg)

3DS SVG image trace by me (quinton-ashley/qashto)

[Xbox 360 Loading Intro by Girish Sharma](https://codepen.io/grssam/pen/dLbcv)

[PS3 Icon Loader by Jan Machycek](https://codepen.io/machyj/pen/ENvewe)

MAME loader is a combination of two codepens: [Vadim Huck's](https://codepen.io/M4TERIAL/pen/gavvQL) and [Matt J Roberts'](https://codepen.io/mattjroberts/pen/pazNdx)

[SNES Loading Intro](https://codepen.io/servinnissen/pen/ogxjdK)

### Fonts

[nintender](http://www.fontspace.com/lyric-type/nintender)  
[Gamecuben](https://www.dafont.com/gamecube.font)  
[Continum](https://fontmeme.com/fonts/continuum-font/)  
[theboldfont](https://www.dafont.com/the-bold-font.font)  
[DS_BIOS](https://www.dafont.com/nintendo-ds-bios.font)  
[Early_Gameboy](https://www.dafont.com/early-gameboy.font)

## Legal Disclaimer

Although [Emulation is legal](https://en.wikipedia.org/wiki/Bleem!), pirating games you do not own is illegal. Nostlan does not condone piracy. Nostlan is open source software that does not infringe on any copyrights of texture packers, developers, or publishers. Nostlan is not affiliated with Nintendo, Sony, or Microsoft. Anyone asking for or sharing information related to digital piracy on this project's Github issues will have their comments removed and flagged.

## COPYRIGHT AND TRADEMARK INFO

MAME and the MAME Logo are Copyright © 1997-2019 MAMEDev and contributors. MAME® is a registered trademark of Gregory Ember. Use of the MAME name and logo is done so with the expressed written permission from the trademark owner. For more information, please visit <https://www.mamedev.org>.

Nostlan and the Nostlan logo images are Copyright © 2019 Quinton Ashley. The Nostlan logo images are licensed under [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/). The Nostlan software itself is fully open source and licensed under the copyleft [GNU GPLv3 license](https://en.wikipedia.org/wiki/GNU_General_Public_License).

![GNU GPLv3 logo](https://www.gnu.org/graphics/gpl-v3-logo.svg)
