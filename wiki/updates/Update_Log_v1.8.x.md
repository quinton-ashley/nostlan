## Update Summary for v1.8.x

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/snes.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/snes_LQ.png">
</a></p>

#### Emulators

- SNES game lib support with [bsnes](https://byuu.org/bsnes) as the default emulator (on macOS and Linux use [bsnes-hd](https://github.com/DerKoun/bsnes-hd/releases)).
- Support for alternate emulators!
- DS games can be played with melonDS (default) or DeSmuME.
- SNES games can be played with bsnes (default) or snes9x.
- GBA games can be played with mGBA (default) or Visual Boy Advance.

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/playMenu.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/playMenu_LQ.png">
</a></p>

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/emuMenu.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/emuMenu_LQ.png">
</a></p>

### App UI

- Unidentified games and games with no cover art will now be shown with handwritten labels that can be edited! Older versions of Nostlan ignored them.
- fixed the stuttering when scrolling by completely replacing the old scrolling mechanics with a better method for achieving the same aesthetic results
- mouse hides automatically when using a controller, reappears when moved
- When the user selects a box from the game library menu, the box select menu zooms in on the whole library to focus on that game box. You can scroll and move the cursor to other games in this zoomed in state.
- Open box menu added for Wii U, Switch, GBA, Arcade, and SNES. The only systems missing this feature are now the PS3 and 3DS.
- More intuitive UI labelling. On the game library view, clicking "Sys", short for systems, will open a submenu where you can choose to load another system's game library. Clicking "Play" opens the Play Menu, you can choose which emulator should be used to play your selected game. Clicking "Emu", will open the emulator menu. In the emulator menu click "Configure {emu name}" to start the emulator without a game so you can setup controllers, change graphics settings, update the emulator, etc. In previous versions the labels on the library view were "Power", "Reset", and "Open" just like on a GameCube which aesthetically looked cool but it's just a terrible way to label the functions of those buttons and I should've changed it sooner.
- update Yuzu via Nostlan's Emulator Menu
- unlock alternate UI theme color palettes (Patreon supporter premium feature)
- custom UI theming, lets you change the intro loading screens and make your own color palettes (Patreon supporter premium feature)

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/switch_boxSelectMenu.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/switch_boxSelectMenu_LQ.png">
</a></p>

#### User Experience

- The readme page was way too long, I broke it up into separate wiki pages. I've put a lot more effort into documenting Nostlan on the [wiki](https://github.com/quinton-ashley/nostlan/wiki). I hope you find it helpful!
- Precise Nintendo Switch game identification! Nostlan uses `yuzu-cmd.exe` to identify your games using its 16 hex digit title id. Since the Switch is a current gen console a complete database for switch games that has all the title ids doesn't exist yet ofc. Nostlan's Switch database has some title id's for older Nintendo Switch games. I added some newer ones myself for the most popular games.
- Precise SNES game identification! Nostlan uses `icarus.exe` to identify SNES games. It doesn't work on some files but it's pretty good with .sfc roms.

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wiiu_boxOpenMenu.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/wiiu_boxOpenMenu_LQ.png">
</a></p>

#### Development

- updated open source license to GNU GPLv3
- contro-ui (my controller ui framework) now uses hierarchal submenus. I replaced a lot of bodge code.
