# Bottlenose

Bottlenose is a new front-end for video game emulators!  It scrapes game database sites for the _highest quality_ box art available.  Bottlenose was designed for **UHD** displays and projectors.

## Features

-   uses _high quality_ box art from the best game databases
-   _aesthetic_ UI themes for each supported console
-   the cover viewer has _eccentric_ alternating scroll direction rows
-   all Nintendo systems are supported

## Supported emulators

-   Dolphin (Wii)
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

## Planned Features!

I want to make Bottlenose a full companion app for Dolphin and other emulators, not just a fancy front-end.

-   automated install/update texture packs for Dolphin
-   automated install/update graphics packs for Cemu
-   game controller UI mode

## Donation Required!

Even though there is no free trial limit, Bottlenose is not free.  If you appreciate my work so far and will continue to use the app please donate any amount to support this project!  If I don't receive any donations I will assume people are not interested in a high quality front-end for emulators and I won't be willing to dedicate a significant amount of time to this project.  I've already been working on it for a month!  If you want me to add updates and new features to Bottlenose please support me with a donation and share the app with your friends.  Thank you :)

Ethereum: 0xb4355179da353f1BA4AA0BB5a7E3Ba4FdC7128ea  
Patreon: <https://www.patreon.com/qashto>  
Paypal: <https://www.paypal.me/qashto/5>

## Development Info

Bottlenose is open source and MIT licensed!  I loved using Electron to make Bottlenose.  I highly recommend it to devs interested in creating native desktop apps.  Bottlenose is written in plain old, no-types-allowed javascript and proudly uses Pug, jQuery, Bootstrap, and Google's Material Design Icons.

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

### Databases

gametdb text files were converted to json by me (quinton-ashley)
<https://www.gametdb.com/>

### Covers

High quality box scans from andydecarli
<http://andydecarli.com/Video%20Games/Collection>

Best available quality of full covers, boxes, discs/carts are scraped from gametdb
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
link//
theboldfont
link//
