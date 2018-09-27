# Bottlenose

Bottlenose is a simple, yet high quality front-end for video game emulators.  Unlike other front-ends available today, Bottlenose was designed for **UHD** displays and projectors.  It scrapes multiple game database sites for the _highest quality_ box art available.  The UI prioritizes box art, not metadata.  Bottlenose is an open source node.js app powered by Electron!

## Features

-   _aesthetic_ UI themes for each supported console
-   the cover viewer has _eccentric_ alternating scroll direction rows
-   most Nintendo systems are supported
-   covers are stored locally so it never redownloads images
-   Windows and macOS supported

## Planned Features!

I want to make Bottlenose a full companion app for Dolphin and other emulators, not just an elegant front-end.

-   batch install/update texture packs for Dolphin
-   batch install/update graphics packs for Cemu
-   game controller UI mode
-   automatic emulator updates
-   easy way to mix and swap texture packs for Dolphin
-   Linux support
-   Xenia and RPCS3 support

## Supported emulators (as of now)

-   Dolphin (Wii, Gamecube, Virtual Console)
    ![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/gcn.PNG)
-   DeSmuME (DS)
    ![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/ds.PNG)
-   Cemu (Wii U)
    ![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/wiiu.PNG)
-   Citra (3DS)
    ![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/n3ds.PNG)
-   Yuzu (Switch)
    ![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/switch.PNG)

## Required Directory Structure Example

```javascript
Emulation (root folder can have any name)
├─┬ Dolphin
│ ├─┬ BIN (must be in all caps)
│ │ ├── User
│ │ ├── portable.txt
│ │ └── Dolphin.exe
│ └─┬ GAMES
│   ├── Super Mario Sunshine.gcz
│   ├── Super Smash Bros Melee.iso
│   └── sm64.wad
├─┬ Cemu
│ ├── BIN
│ └─┬ GAMES
│   └─┬ Mario Kart 8 (game folder)
│     └─┬ code
│       └── Turbo.rpx (Bottlenose uses this file to launch game)
└── Yuzu
```

The default game library of each emulator will be its `GAMES` folder.  Bottlenose will default to the internal game library of emulators that store games in file structures meant to mimic the system being emulated.  For example, RPCS3 has an internal game library that will be located at `emu/RPCS3/BIN/dev_hdd0/game`.

## Donation Required!

Even though there is no free trial limit, Bottlenose is not free.  If you appreciate my work so far and will continue to use the app please donate any amount to support this project!  If I don't receive any donations I will assume people are not interested in a high quality front-end for emulators and I won't be willing to dedicate a significant amount of time to this project.  I've already been working on it for a month!  If you want me to add updates and new features to Bottlenose please support me with a donation and share the app with your friends.  Thank you :)

Ethereum: 0xb4355179da353f1BA4AA0BB5a7E3Ba4FdC7128ea  
Patreon: <https://www.patreon.com/qashto>  
Paypal: <https://www.paypal.me/qashto/5>

## How is Bottlenose different form other front-ends?

Emulation Station is a beautiful front end for Windows and Linux.  Like Bottlenose, it's open source!  I was inspired by Emulation Station when I started working on Bottlenose.  Bottlenose however makes box art the primary, practically singular, focus of the UI, not metadata or descriptions:
![](https://emulationstation.org/assets/featurettes/full/theming_list.png)

The most popular front end for Windows is Launchbox.  If Launchbox makes you barf rainbows then you might like the simplicity of Bottlenose!  Launchbox looks great for old arcade titles and seems to be ready to run in custom arcade cabinets and PCs with older hardware.  Shoots for quantity over quality image wise.  Also, a lot of the game cover screens erroneously contain in-game or promotional art for a different game.  For example in the promotional video, Super Smash Bros. for N64 has Brawl character renders behind it.  Bottlenose will mainly focus on post-Gamecube (2001) emulators.  This is the "Big Box" mode:
![](https://www.launchbox-app.com/Resources/Images/Screenshots/Big-Box-Nintendo-GameCube.jpg)

OpenEmu for macOS is a great app for making controller profiles consistent among different emulators.  Otherwise it looks just like dark mode Finder.  I use it on my Macbook on plane flights and I like it.  The covers are low-res, grid spacing is too wide:
![](http://openemu.org/img/intro-gb-grid.png)

## Development Info

Bottlenose is open source and MIT licensed!  I loved using Electron to make Bottlenose.  I highly recommend it to devs interested in creating native desktop apps with node.js.  Bottlenose is written in plain old, no-types-allowed javascript and proudly uses Pug, jQuery, Bootstrap, and Google's Material Design Icons.

## Collaboration Guide

PRs are welcome!  Please follow my coding style though.  Line length should be ~80.  In general I prefer more verbose JS syntax.  End each line with a semicolon.  No if statements without brackets.  No callback pyramids, use Async/Await whenever possible.  Comment your code but not too much.  Do not write plain JS novels for editing the DOM, just use jQuery please.  Pay attention to whether you need to write system/emu specific or general code.

## Contributing to Bottlenose

If you would like to update a game database, make a PR or email me <mailto:qashto@gmail.com> with your new or updated entries.  Game database JSON files can be found in the db folder.  Game entries are structured like this:

```javascript
{
 "id": "G8ME01",
 "title": "Paper Mario: The Thousand-Year Door",
 "texp": [{
	 "name": "HD",
	 "authors": ["The Dolphin Community"],
	 "rate": 10,
	 "version": "1.7.0",
	 "png": "https://drive.google.com/file/d/1QtgZFz2darznGNtViJVOep8UZ3xuaUkN/view?usp=sharing",
	 "dds": "https://drive.google.com/file/d/1x6XJnQTW9SvbA6EmNHIKz9bGDXXweHAD/view?usp=sharing",
	 "url": "https://forums.dolphin-emu.org/Thread-paper-mario-ttyd-hd-texture-pack-v1-7-july-4-2018"
 }]
}
```

### Game Properties

-   `id` is the official id of the game, if the game you're adding is a homebrew or mod then you must make a unique id for it with a valid region code
-   `name` the official name of the game, subtitles should be delineated using a colon.
-   `texp` the texture pack array, order is irrelevant
-   `img` img array which contains an object with image names/image url key/data pairs that override the default scape location.

### Texture Packs

-   `name` should be short, simple and should not include "Texture" or "Pack".
-   `png` and `dds` links must be direct download links or google drive links.  Mega links will never be supported.
-   `url` is the link to the relevant forum post or readme.
-   `version` must use semantic versioning.
-   `rate` is the pack's rating 1-10.

### Images

The following names can be used to specify images:

-   "box" the front cover including box ()
-   "coverFull" the entire cover sleeve, no box
-   "cover" the front facing portion of the cover sleeve, no box
-   "disc" the front of the game's (first) disc
-   "cart" the front of the game's (first) cartridge

Box art is prioritized in this order: box (super high quality), coverFull, cover, box (low quality).  In a future version of bottlenose users will be able to change images in the UI.  For now, add them in an `img` object like this:

```javascript
{
 "id": "ALERA",
 "title": "Mario Tennis Aces",
 "texp": [],
 "img": {
	 "box": "https://images-na.ssl-images-amazon.com/images/I/91TvX36nF-L.jpg"
 }
}
```

## Planned Features! (continued)

Texture packs with a rating of 7 and above will be considered recommended.  In a future version of Bottlenose, users will be able to batch install all the recommended packs for their entire game library.  The highest ranking pack for each game will become the default pack and placed in `User/Load/Textures`.  Users will still be able to install non-recommended packs individually in the app.  Incompleteness of a pack has no bearing on a pack's rating.  Pack ratings will be curated by me (quinton-ashley) and based on the Dolphin forum's democratic star rating and opinions from other texture pack creators.  The vast majority of packs currently on the Dolphin forums will receive a 8-10.

## Credits!

Bottlenose uses publicly available images under Fair Use.  

### Databases

gametdb text files were converted to json by me (quinton-ashley)
<https://www.gametdb.com/>

### Covers

The highest quality box scans are from Andy Decarli!
<http://andydecarli.com/Video%20Games/Collection>

Full covers, boxes, discs/carts are scraped from gametdb
<https://www.gametdb.com/>

Some full resolution product images from Amazon are used for Wii U and Switch titles.

### Template Art

-   Gamecube, Wii, and Wii U templates by etschannel via deviantart
-   Switch template by ponces245 via deviantart
-   PS3 template by the_prototype92 via deviantart
-   3DS template by omegaaaronyt via deviantart

### Loading Sequences

Gamecube Loading Intro CSS by MarcMalignan : MIT licensed
<https://codepen.io/MarcMalignan/pen/doCth>

Switch Loading Intro Pure CSS by joshbader : MIT licensed
<https://codepen.io/joshbader/pen/mjZzGM>

### Controllers

Wii U Gamepad SVG by Tokyoship from Wikimedia Commons
Creative Commons Attribution 3.0 Unported
<https://en.wikipedia.org/wiki/File:Wii_U_controller_illustration.svg>

### Fonts

nintender
<http://www.fontspace.com/lyric-type/nintender>
Gamecuben
<https://www.dafont.com/gamecube.font>
Continum
<https://fontmeme.com/fonts/continuum-font/>
theboldfont
<https://www.dafont.com/the-bold-font.font>
DS_BIOS
<https://www.dafont.com/nintendo-ds-bios.font>

## Legal Disclaimer

Although [Emulation is legal](https://en.wikipedia.org/wiki/Bleem!), pirating games you do not own is illegal.  Bottlenose does not condone piracy.  Bottlenose is open source software that does not infringe on any copyrights of texture packers, Nintendo, Sony, or Microsoft.  Anyone asking about or sharing information related to illegal activities on this project's Github page will be banned.
