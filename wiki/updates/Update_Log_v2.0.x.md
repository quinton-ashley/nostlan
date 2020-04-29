Nostlan is an open source _high quality_ front-end launcher for video game emulators! Available on Linux, macOS, and Windows. Systems supported: Arcade, DS, GBA, 3DS, PS2, PS3, SNES, Switch, Wii, Wii U, and Xbox 360. Emulators supported: bsnes, Cemu, Citra, Dolphin, DeSmuME, MAME, melonDS, mesen, mGBA, PCSX2, RPCS3, Ryujinx, snes9x, Visual Boy Advance, Xenia, and Yuzu.

[Download Nostlan](https://github.com/quinton-ashley/nostlan/releases) and if you enjoy the app [please make a donation](https://www.paypal.me/qashto/20), any amount is appreciated. [Support the development of Nostlan on patreon](https://www.patreon.com/nostlan) to gain access to premium features!

This update log covers changes made in v2.0.x. Unfamiliar with Nostlan? [Read about its features and look at screenshots on the readme page.](https://github.com/quinton-ashley/nostlan/blob/master/README.md)

Join the Nostlan Community on [Discord](https://discord.gg/cT2yNC6) | [Reddit](https://www.reddit.com/r/nostlan/)

## Update Summary for v2.0.x

Performance update! Nostlan now generates thumbnail images with a height of 720px that are used on the game library view. It automatically switches to using the full res game art when you select a game. This update also adds NES support, with em-fceux, a javascript port of fceux as the default emulator. I've also added support for Mesen since right now fceux is missing critical features like the ability to save states to a file to be used on other devices or during another game session.

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gcn.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gcn_LQ.png">
</a></p>

## Coming Soon

#### Emulators

- NES game library support with em-fceux (default) and mesen emulator support

#### App UI

- shows game wiki pages in the `manuals` section of the open box menus (works for wii, n3ds, and switch)

#### User Experience

- when an emulator app is not found Nostlan will prompt the user for the location of the app or if Nostlan should download and install it automatically
- users will be able to manually identify games by searching through Nostlan's game databases and then Nostlan will load cover art for that game
- Users will be able to identify game mods that aren't found in Nostlan's game databases. Mod boxes will have the original game art with the mod's title on a label sticker.
- precise game identification for Nintendo DS games
- precise Wii/Gamecube/VC game identification using `Dolphin.exe` and robotjs to get the game id values directly from the main ui's game table

## Let me know what you think about Nostlan

Nostlan is an experimental project but I want to make it intuitive and useful for the general public! If something is wrong with the app or if you have any questions please email me <mailto:qashto@gmail.com> or write up an issue report on Github. What do you think of the features I have planned? What should I prioritize?

## Support the Development of Nostlan!

[Patreon](https://www.patreon.com/nostlan) supporters get premium features for only \$1 a month!

- [backup/sync game saves to the cloud or local storage device](https://github.com/quinton-ashley/nostlan/wiki/Backup-Saves-and-Cloud-Save-Syncing)
- [unlock alternate UI theme color palettes](https://github.com/quinton-ashley/nostlan/wiki/Change-Theme)
- [custom UI theming, lets you change the intro loading screens and make your own color palettes](https://github.com/quinton-ashley/nostlan/wiki/Custom-Themes)

Even though I decided to make this project open source and free to use, it still took a lot of work and a long time to develop. If you appreciate my work so far and will continue to use the app please support its development. Thank you!

Features that might be offered in the future:

- support for your PC game libraries! (Origin, Steam, Epic Games, etc.)

I'm going to make a lot of videos about Nostlan which will hopefully make it easier for new users to start using the app. Ideally I would like to have 200+ supporters to consider working on Nostlan a worthwhile investment of my time. If Nostlan got 500+ supporters and I made ~$1,500 a month from Patreon, I would work on Nostlan full time and come out with updates a lot more frequently. If you use Nostlan a lot I really don't think $1 a month is too much to ask. Please support this open source project!
