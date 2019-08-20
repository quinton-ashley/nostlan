# Bottlenose

Bottlenose is a _high quality_ front-end launcher for video game emulators!  Available on Linux, macOS, and Windows!  
[Download Bottlenose](https://github.com/quinton-ashley/bottlenose/releases) and [please choose an amount to pay for it](https://www.paypal.me/qashto/20) or [become a patreon supporter!](https://www.patreon.com/qashto)  
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose/master/views/img/icon.png)

## A what?

A front-end or user interface (UI) is the presentation and interaction layer of an app or website.  Most modern emulators have basic game list UIs that you can interact with using a mouse or keyboard but not a game controller.

Bottlenose looks similar to media viewers like Kaleidescape and AppleTV.  You can interact with it using a mouse or game controller.  Unlike other front-ends, Bottlenose has a minimalistic design that prioritizes box art, not metadata.  Check out the screenshots below!

## Features

-   unified UI for mouse/gamepad interaction
-   designed for _UHD_ displays and projectors
-   checks multiple database sites for the _highest quality_ box art
-   _nostalgic_ UI themes for each supported console
-   fancy scroll direction alternation effect on rows in cover view mode
-   uses individual emulators: no cores and no controller input transfer lag
-   controllers connect to Bottlenose automatically, no setup required
-   Xbox One, PS4 Dualshock, and Switch Pro controllers all supported
-   gamecube controller support with [gca-js](https://github.com/YonicDev/gca-js)
-   advanced customization: edit launch commands and change game art
-   browse demo mode if don't have any games on your computer
-   cross-platform support for Linux, macOS, and Windows!

## Supported Emulators

#### Dolphin (Wii, Gamecube, Virtual Console) [Linux, macOS, & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/gcn.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/gcn_LQ.png)

#### Cemu (Wii U) [Windows & Linux* using Wine]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/wiiu.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/wiiu_LQ.png)

#### Yuzu (Switch) [Linux & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/wiiu.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/switch_LQ.png)

#### Citra (3DS) [Linux, macOS, & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/n3ds.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/n3ds_LQ.png)

#### DeSmuME (DS) [Linux, macOS & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/ds.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/ds_LQ.png)

#### MAME [Linux, macOS, & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/mame.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/mame_LQ.png)

#### mGBA (GBA) [Linux, macOS, & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/gba.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/gba_LQ.png)

#### PCSX2 (PS2) [Linux, macOS, & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/ps2.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/ps2_LQ.png)

#### RPCS3 (PS3) [Linux & Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/ps3.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/ps3_LQ.png)

#### Xenia (Xbox 360) [Windows]

[click to see the full quality UHD screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/xbox360.png)
![](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/xbox360_LQ.png)

## Please consider donating!

Even though Bottlenose is open source software that's free to use, it still took a lot of work and a long time to develop.  If you appreciate my work so far and will continue to use this app please donate an amount of your choosing.  I need your support to develop new features.  Thank you!

Monthly Donations:  
Patreon: <https://www.patreon.com/qashto>  

Single Donation:  
Paypal: <https://www.paypal.me/qashto/20>

## Planned Features

If enough people support the project on Patreon I will be able to set aside the time to implement these features!

-   real time filter search for games
-   open box menu with submenus for manual reading, save management, and disc art viewing
-   create a database of Dolphin texture packs
-   batch install and auto-update texture packs for Dolphin
-   install emulators
-   automatic emulator updates for emulators that lack this feature
-   easy way to mix and swap texture packs for Dolphin
-   list style view mode for browsing through box sides, useful for very large game libraries
-   instant auto-complete search
-   user ability to make custom themes
-   PPSSPP emulator support

## How is Bottlenose different from other front-ends?

When I created Bottlenose I wanted to make box art the primary, practically singular, focus of the UI.  Many other frontend apps waste a lot of screen space on metadata, menus, descriptions, or just plain empty space.  This is a screenshot of Emulation Station, which is a prime example of this problem.
![](https://emulationstation.org/assets/featurettes/full/theming_list.png)

This is Launchbox for Windows, it's the most popular frontend.  Note that a lot of screen space is wasted and the game box art is thumbnail sized.
![](https://www.launchbox-app.com/Resources/Images/Screenshots/Big-Box-Nintendo-GameCube.jpg)

Windows Explorer, despite not having gamepad support, is also surprisingly popular.  I've seen reddit posts with tutorials on how to make individual executables that launch emulators with a particular game.  I think that's a pretty bad substitute for a dedicated launcher app.
![](https://i.redd.it/z7zxgap037p11.png)

Retroarch is a different kind of frontend.  It uses separate cores instead of individual emulator apps like Bottlenose does.  Game art is very low res and the interface is barebones.  It runs on a lot of platforms and seems good for small devices.
![](https://d2.alternativeto.net/dist/s/retroarch_203397_full.png?format=jpg&width=1600&height=1600&mode=min&upscale=false)

OpenEmu for macOS is a great app for making controller profiles consistent among different emulator cores.  It looks like dark mode Finder.  I use it on my Macbook on plane flights and I like it.  The covers are low-res and grid spacing is too wide though.  It doesn't support newer emulators either.
![](http://openemu.org/img/intro-gb-grid.png)

## Using Bottlenose

Bottlenose auto detects controllers, no setup is required.  The console themed plastic cover overlay menu displays the basic options on any given screen.  On any game library view you can press the "Start" button on your controller or click "Bottlenose" on the overlay to access the settings menu.  "Open" will pull up a menu with a list of game consoles.  Select a console to open your game libraries for that console.  "Reset" will start the emulator without a game.  "Power" start the emulator with the selected game.

## What is Adaptive Button Mapping?

    // Xbox/PS Adaptive profile usage example:

    // User is currently browsing their Nintendo Switch library
    // Xbox One controller is mapped to
    // Nintendo Switch controller button layout
    //  Y B  ->  X A
    // X A  ->  Y B

    // User is browsing Xbox 360 games so no mapping occurs
    //  Y B  ->  Y B
    // X A  ->  X A

    // User is browsing PS3 games so no mapping occurs either
    // since Xbox One has the same mapping as PS3
    //  Y B  ->  △ ○
    // X A  ->  □ X

Although some may find this confusing at first, adaptive profiles map the button layout of your controller to match the button layout of controllers made for whatever system you're browsing.  In the NTSC region, Xbox and Playstation use the bottom button of the face button diamond as the "yes" or "make selection" button.  Starting with the SNES the B button has been at the bottom of the layout diamond on Nintendo controllers that have a standard button layout.  The B button on Nintendo systems means "no" or "back".  The default profile remaps from Xbox and PlayStation button layouts to Nintendo's button layout when browsing Nintendo system libraries.  This mapping will occur when browsing Nintendo game libraries only.  On PS and Xbox game libraries `Xbox_PS_Adaptive` does not remap buttons.

Hence by using an "Adaptive" profile you will always be using the physically correct button layout for the system library you're browsing, regardless of what controller you use!

I recommend using adaptive mapping in your emulator controller settings too.  This way you can play games using the button layout that game developers intended even if you're using a controller made for a different system.

The other included gamepad mapping profile types are "Consistent", for non-adaptive remapping between controller types and "None", for no mapping, which is not recommended.  You can easily change between these options by editing your preferences file.  Set `ui.gamepad.profile` to your desired controller profile.  If for example, you're using a Nintendo Switch controller, you should use `Nintendo_Adaptive`.

## System Requirements

Bottlenose will probably not perform well on low-end systems.  Ultra high resolution images require more storage and animations using these images require strong GPUs.  Although, I've tested Bottlenose on my 2016 Macbook with a 1.1GHz CPU with onboard Intel HD 515 graphics and it runs at 2304x1440 without any bad stuttering.

## Setting up Bottlenose

If you do not want to use the optional template file structure, simply select "continue" on the setup page.  Bottlenose will prompt you for the location of your game directories.  It may also prompt for the emulator app before you launch a game with Bottlenose for the first time.  Setup as you go and Bottlenose will save these locations in your preferences file.

## OPTIONAL Template File Structure

```javascript
emu (root folder can have any name)
├─┬ Dolphin
│ ├─┬ BIN
│ │ ├── User/...
│ │ ├── portable.txt
│ │ ├── Dolphin.exe
│ │ └── ...
│ └─┬ GAMES
│   ├── Super Mario Sunshine.gcz
│   ├── Super Smash Bros Melee.iso
│   └── sm64.wad
└─┬ Cemu
  ├─┬ BIN
	│ ├── Cemu.exe
  │ └── ...
  └─┬ GAMES
    └─┬ Mario Kart 8 (game folder)
      └─┬ code
        └── Turbo.rpx
```

Bottlenose was designed to OPTIONALLY use the same directory structure as WiiUSBHelper, for compatibility.  Although WiiUSBHelper is no longer maintained, Bottlenose will continue to use this structure as the template.  The default game library of each emulator will be its `GAMES` folder.  As an exception, Bottlenose will default to the internal game library of emulators that store games in file structures meant to mimic the system being emulated.  For example, RPCS3 has an internal game library that will be located at `emu/RPCS3/BIN/dev_hdd0/game`.

On windows, the auto-updater for yuzu doesn't let users pick yuzu's location.  This is okay, Bottlenose will default to the location that the installer uses instead of `emu/Yuzu/BIN`.

On macOS, Bottlenose looks for your emu apps in `Applications/`.

On Linux, Bottlenose knows how to use apps via the command line and will prompt you for the location of other emu apps.

## User Preferences

`region` game files without game IDs in their game file name, for example "Super Smash Bros Melee.iso", will be auto assigned to a default region.  Use E for North and South America, P for European PAL, J for Japan.

`ui.mouse.wheel.smoothScroll` = false on Windows by default, should be true if you have a mouse that supports smooth scrolling (like an Apple Macbook trackpad)

`ui.mouse.wheel.multi` it's a multiplier that changes the scroll amount.

`ui.getBackCoverHQ` get's the back of the box in high quality for games without available full covers

`ui.recheckImgs` when true, on reset, images will be downloaded for all games in the given library, not just new games

`session.sys` the last game library viewed, Bottlenose will load this library on start-up next time the app is run

`session.{sys}.gameID` the id of the last game that was run for the specified system

`gamepad.profile` the controller profile you want to use

`{sys}.cmd.{os}` the launch command for that game system and os

## Advanced Features: Custom Launch Commands

Edit your preferences file to change the default launch command for each OS.  This is an example of Cemu's command object:

```JSON
"cmd": {
	"linux": ["wine", "${app}", "-g", "${game}", "-f"],
	"win": ["${app}", "-g", "${game}", "-f"]
}
```

## Error Reporting

Please [send me](mailto:qashto@gmail.com) a description of any errors with the relevant error log or report an issue with the code on this project's Github.

### Mismatched or Unidentified Games

If Bottlenose has trouble matching your game file name, please take a look at the error log.  This can be easily accessed in the Bottlenose menu.  This file will tell you which game files are unidentifiable or lead to incorrect matches.  Give these files the proper game title or game ID and Bottlenose will be able to find matches in its game databases.  Using the file name to match the games is not ideal but it should work for most of your games.  Some other frontends read the game's header for the game id, I might implement this in the far future.

### Missing Cover Art

As of version 1.0.81, Bottlenose should be able to get nearly all of your game images.  If Bottlenose can't find images for a game in the Bottlenose database you can put cover art in `emu/bottlenose/{sys}/{game.id}/img`.  For more info see the "Images" sections of this README.

## Contributing to Bottlenose

You can contribute to Bottlenose to add to and update existing game databases, make a PR or email me <mailto:qashto@gmail.com> with your new or updated entries.  Game database JSON files can be found in the db folder.  Game entries are structured like this:

```javascript
{
 "id": "G8ME01",
 "title": "Paper Mario: The Thousand-Year Door",
 "texp": [{
	 "name": "HD",
	 "authors": ["The Dolphin Community"],
	 "rate": 10,
	 "version": "1.7.0",
	 "png": ["https://drive.google.com/file/d/1QtgZFz2darznGNtViJVOep8UZ3xuaUkN/view?usp=sharing"],
	 "dds": ["https://drive.google.com/file/d/1x6XJnQTW9SvbA6EmNHIKz9bGDXXweHAD/view?usp=sharing"],
	 "url": ["https://forums.dolphin-emu.org/Thread-paper-mario-ttyd-hd-texture-pack-v1-7-july-4-2018"]
 }]
}
```

### Game Properties

-   `id` is the official id of the game
-   `name` the official name of the game, subtitles are delineated using a colon
-   `texp` the texture pack array, order is irrelevant
-   `img` an object with `"imgFileName": "url"` pairs that override the default image location

### Texture Packs

-   `authors` usernames or real names of the author(s)
-   `name` should be short and simple, such as "UHD" or "Blue Edition"
-   `png` and `dds` link(s) to direct download the pack
-   `pngRP` and `ddsRP` link(s) to resource pack for Dolphin
-   `url` link(s) to the relevant forum post or readme
-   `version` the semantic version of the pack
-   `rate` the pack's rating 1-10
-   `patron` donation link(s) to the author(s) of pack

### Images

The following names can be used to specify images:

-   `box` the front of the box
-   `boxSide` the side of the box
-   `boxBack` the back of the box
-   `boxOpen` the inside of the game's box
-   `boxOpenMask` clips that should appear above game media, manual, and memory card
-   `cart` the front of the game's (first) cartridge
-   `coverFull` the entire cover sleeve, no box
-   `cover` the front facing portion of the cover sleeve, no box
-   `coverSide` the side facing portion of the cover sleeve, no box
-   `coverBack` the side facing portion of the cover sleeve, no box
-   `disc` the front of the game's (first) disc
-   `manual` the front of the game's manual
-   `memory` the front of a memory card
-   `memoryBack` the back of a memory card
-   `promo` a promotional insert included in the game box

Box art downloading is prioritized in this order: box (highest quality), coverFull, cover, box (low quality).  In a future version of Bottlenose users will be able to add image urls from within the UI.  For now, you can add them in the game's `img` object like this:

```javascript
{
  "id": "ALERA",
  "title": "Mario Tennis Aces",
  "img": {
    "box": "https://images-na.ssl-images-amazon.com/images/I/91TvX36nF-L.jpg"
  }
}
```

## Planned Features! (continued)

Texture packs with a rating of 7 and above will be considered recommended.  In a future version of Bottlenose, users will be able to batch install all the recommended packs for their entire game library.  The highest ranking pack for each game will become the default pack and placed in `User/Load/Textures`.  Users will still be able to install non-recommended packs individually in the app.  Incompleteness of a pack has no bearing on a pack's rating.  Pack ratings will be curated by me (quinton-ashley/qashto) and based on the Dolphin forum's democratic star rating and opinions from other texture pack creators.  The vast majority of packs currently on the Dolphin forums will receive a 8-10.

## Development Info

Bottlenose is open source and MIT licensed!  I loved using Electron to make Bottlenose.  I highly recommend it to devs interested in creating native desktop apps with node.js.  Bottlenose is written in good ol', no-types-allowed javascript and uses Pug, jQuery, Bootstrap, and Contro.

## Contributing to Bottlenose (code)

PRs are welcome!  Please follow my coding style though.  No callback pyramids, use Async/Await whenever possible.  Do not write plain JS novels when editing the DOM, just use jQuery please.

## Credits!

Obviously, Bottlenose wouldn't exist without the developers of these emulators.  Please support the devs of emulators you use!

### Logo

The logo is a [vaporwave](https://en.wikipedia.org/wiki/Vaporwave) style variation on [MayImilae's Dolphin logo](https://commons.wikimedia.org/wiki/File:Dolphin-logo.svg)  

### Databases

I converted several game database text files to JSON from [gametdb](https://www.gametdb.com/).  

### Game Artwork

Bottlenose downloads publicly available images under Fair Use.

High quality box scans of popular games for many systems are from [Andy Decarli](http://andydecarli.com/Video%20Games/Collection).  

Full covers, boxes, discs/carts are downloaded from [gametdb](https://www.gametdb.com/).  

Most PS2 and GBA game artwork is downloaded from [The Cover Project](http://www.thecoverproject.net/) and [gamefaqs](https://gamefaqs.gamespot.com).  

Some full resolution product images from Amazon are used for Wii U and Switch titles.

Archival quality images of arcade game flyers for MAME are from [FlyerFever](https://www.flyerfever.com/) these images are hosted by [Tumblr](https://www.tumblr.com/).  MAME arcade cabinet artwork is downloaded from [Mr. Do's Arcade](http://www.mameworld.info/mrdo/mame_artwork_ingame.php).  

### Template Art

-   Gamecube, Wii, and Wii U templates by etschannel via deviantart
-   Switch template by ponces245 via deviantart
-   PS3 template by the_prototype92 via deviantart
-   3DS template by omegaaaronyt via deviantart
-   Xbox 360 template by georgiajedward via deviantart

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

MAME loader by [Vadim Huck's](https://codepen.io/M4TERIAL/pen/gavvQL) and [Matt J Roberts'](https://codepen.io/mattjroberts/pen/pazNdx)

### Fonts

[nintender](http://www.fontspace.com/lyric-type/nintender)  
[Gamecuben](https://www.dafont.com/gamecube.font)  
[Continum](https://fontmeme.com/fonts/continuum-font/)  
[theboldfont](https://www.dafont.com/the-bold-font.font)  
[DS_BIOS](https://www.dafont.com/nintendo-ds-bios.font)  
[Early_Gameboy](https://www.dafont.com/early-gameboy.font)

## Legal Disclaimer

Although [Emulation is legal](https://en.wikipedia.org/wiki/Bleem!), pirating games you do not own is illegal.  Bottlenose does not condone piracy.  Bottlenose is open source software that does not infringe on any copyrights of texture packers, developers, or publishers.  Bottlenose is not affiliated with Nintendo, Sony, or Microsoft.  Anyone asking for or sharing information related to digital piracy on this project's Github issues will have their comments removed and flagged.

## COPYRIGHT AND TRADEMARK INFO

MAME and the MAME Logo are Copyright © 1997-2019 MAMEDev and contributors. MAME® is a registered trademark of Gregory Ember. Use of the MAME name and logo is done so with the expressed written permission from the trademark owner. For more information, please visit <https://www.mamedev.org>.
