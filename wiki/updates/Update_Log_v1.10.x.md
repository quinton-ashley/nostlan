## Update Summary for v1.10.x

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gcn.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gcn_LQ.png">
</a></p>

#### Emulators

- NES game library and Mesen emulator support! I consider Mesen to be the best nes emulator but it's not available on macOS and can't be run with wine. em-fceux, a NES emulator ported to javascript will be bundled built-in with Nostlan in the future.
- [Ryujinx](https://ryujinx.org/download/) support (alternate Switch emulator that can run 32bit games, unlike Yuzu)

#### App UI

- shows emulator wiki pages for games in the `manuals` section of the open box menus (only works for wii and switch right now)

#### User Experience

- search for games on the game library view just by typing (no search bar), just like with Windows File Explorer
- increased performance in the game library view due to the use of thumbnail images. Nostlan automatically switches to using the full res game art when you select a game. Scrolling and animations are now smooth even for really large libraries!
