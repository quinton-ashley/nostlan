# Nostlan Setup

Choose the location of the `nostlan` image folder and a template file structure for organizing your game libraries. If you don't want to put your games in these folders that's okay, Nostlan will prompt you for their location. [More info](https://github.com/quinton-ashley/nostlan#nostlan-file-structure)

# os win

Windows users should not store emulator apps or games in `Program Files` or any other folder that Nostlan will not have read/write access to. Nostlan will look for emulator executables in the `emu/{sys}/{emu}` folder or the default install location of that emulator (no need to move Yuzu).

```
📁 ~/Documents/emu
└─┬ 📁 ds (system folder)
  ├─┬ 📁 desmume (emulator folder)
  │ └── 🎮 desmume.exe
  ├─┬ 📁 games
  │ ├── 💿 Mario & Luigi - Partners in Time.nds
  │ └── 💿 Mario & Luigi - Partners in Time.sav
  └─┬ 📁 images
    └──┬ 📁  A58E (the game id)
		   ├── 🖼 cover.png (front cover)
       └── 🖼 cart.png (cartridge)
```

# os mac

On macOS, Nostlan will look for emulator apps in `/Applications` or `emu/{sys}/{emu}`. Nostlan needs read/write permission to the install folder. You can have the nostlan.app in `/Applications` but don't install your emulator folder `emu` there.

# os linux

On Linux, Nostlan will look for emulator apps in their default install locations or in `emu/{sys}/{emu}`.

# os mac linux

```
📁 ~/Documents/emu
└─┬ 📁 ds (system folder)
  ├── 📁 desmume (emulator folder)
  ├─┬ 📁 games
  │ ├── 💿 Mario & Luigi - Partners in Time.nds
  │ └── 💿 Mario & Luigi - Partners in Time.sav
  └─┬ 📁 images
    └──┬ 📁  A58E (the game id)
       └── 🖼 box.png (front of the box)
```
