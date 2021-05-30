# Nostlan Setup

Choose where Nostlan should put the images it will download. You can also put your games within this folder structure that Nostlan will create. If you want to keep your games somewhere else on your computer that's fine too, Nostlan will just ask you where they are. [More info](https://github.com/quinton-ashley/nostlan#nostlan-file-structure)

# os win

Windows users should not store emulator apps or games in `Program Files` or any other folder that Nostlan will not have read/write access to. Nostlan will look for emulator executables in their default install location (if they had one) and then in the `emu/{system}/{emulator}` folder.

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

On macOS, Nostlan needs read/write permission to your Documents folder so be sure to enable that in System Preferences. Nostlan will look for emulator apps in `/Applications`, then in `emu/{system}/{emulator}`. You should put the `nostlan.app` itself in `/Applications` but don't install your emulator folder `emu` there.

# os linux

On Linux, Nostlan will look for emulator apps in their default install locations or in `emu/{system}/{emulator}`.

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
