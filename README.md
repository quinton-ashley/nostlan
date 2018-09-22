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

-   automated install/update texture packs for Dolphin
-   automated install/update graphics packs for Cemu
-   game controller UI mode
-   automatic emulator updates with no retroarch requirement
-   easy way to mix and swap texture packs for Dolphin
-   Linux support

## Supported emulators (as of now)

-   Dolphin (Wii, Gamecube, Virtual Console)
-   DeSmuME (DS)
-   Cemu (Wii U)
-   Citra (3DS)
-   Yuzu (Switch)

## Required Directory Structure

```javascript
Emulation (root folder can have any name)
├─┬ Dolphin
│ ├─┬ BIN
│ │ ├── Languages
│ │ ├── Sys
│ │ ├── User
│ │ ├── portable.txt
│ │ ├── Dolphin.exe
│ │ └── ...
│ └─┬ GAMES
│   ├── Super Mario Sunshine.iso
│   ├── Super Smash Bros Melee.iso
│   └── ...
├── Cemu
└── Yuzu
```

## Donation Required!

Even though there is no free trial limit, Bottlenose is not free.  If you appreciate my work so far and will continue to use the app please donate any amount to support this project!  If I don't receive any donations I will assume people are not interested in a high quality front-end for emulators and I won't be willing to dedicate a significant amount of time to this project.  I've already been working on it for a month!  If you want me to add updates and new features to Bottlenose please support me with a donation and share the app with your friends.  Thank you :)

Ethereum: 0xb4355179da353f1BA4AA0BB5a7E3Ba4FdC7128ea  
Patreon: <https://www.patreon.com/qashto>  
Paypal: <https://www.paypal.me/qashto/5>

## How is Bottlenose different form other front-ends?

Emulation Station is a beautiful front end for Windows and Linux.  Like Bottlenose, it's open source!  I highly recommend it.  I was inspired by Emulation Station when I started working on Bottlenose.  Bottlenose however makes box art the primary, practically singular, focus of the UI, not metadata or descriptions:
<https://emulationstation.org/assets/featurettes/full/theming_list.png>

The most popular front end for Windows is Launchbox.  If Launchbox makes you barf rainbows then you might like the simplicity of Bottlenose!  Launchbox looks great for old arcade titles and seems to be made for custom arcade cabinets and PCs with older hardware.  Shoots for quantity over quality image wise.  A lot of the game cover screens erroneously contain in-game or promotional art for a different game.  For example in the promotional video, Super Smash Bros. for N64 has Brawl character renders behind it.  Bottlenose will mainly focus on post-Gamecube (2001) emulators.  This is the "Big Box" mode:
<https://www.launchbox-app.com/Resources/Images/Screenshots/Big-Box-Nintendo-GameCube.jpg>

OpenEmu for macOS is a great app for making controller profiles consistent among different emulators.  Otherwise it looks just like dark mode Finder.  I use it on my Macbook on plane flights and I like it.  The covers are low-res, grid spacing is too wide:
<http://openemu.org/img/intro-gb-grid.png>

## Development Info

Bottlenose is open source and MIT licensed!  I loved using Electron to make Bottlenose.  I highly recommend it to devs interested in creating native desktop apps with node.js.  Bottlenose is written in plain old, no-types-allowed javascript and proudly uses Pug, jQuery, Bootstrap, and Google's Material Design Icons.

## Collaboration Guide

PRs are welcome!  Please follow my coding style though.  Line length should be ~80.  In general I prefer more verbose JS syntax.  End each line with a semicolon.  No if statements without brackets.  Wrap ternary ops in parens.  Absolutely no callback pyramids, use Async/Await whenever possible.  Comment your code but not too much.  Do not write plain JS novels for editing the DOM, just use jQuery please.  Make sure your console specific code is not console agnostic and vice versa.

## Image Naming Convention

The following names can be used to specify images:

-   "box" the front cover including box
-   "coverFull" the entire cover sleeve, no box
-   "cover" the front facing portion of the cover sleeve, no box
-   "disc" the front of the game's (first) disc
-   "cart" the front of the game's (first) cartridge

## Credits!

Bottlenose uses publicly available image databases under Fair Use.  

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

High quality gcn, wii, and wiiu templates by etschannel via deviantart

Switch template by ponces245 via deviantart

### Loading Sequences

Gamecube Loading Intro CSS by MarcMalignan
MIT
<https://codepen.io/MarcMalignan/pen/doCth>

Switch Loading Intro Pure CSS by joshbader
MIT
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

Although [Emulation is legal](https://en.wikipedia.org/wiki/Bleem!) pirating games you do not own is illegal.  Bottlenose does not condone piracy.  Bottlenose is open source software that does not infringe on any copyrights of Nintendo, Sony, or Microsoft.
