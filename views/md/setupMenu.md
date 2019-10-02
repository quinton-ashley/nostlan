# Nostlan Setup

Choose the location of the `nostlan` image folder and a template file structure for organizing your game libraries.  If you don't want to put your games in these folders that's okay, Nostlan will prompt you for their location.

# os win

Windows users should not store emulator apps or games in `Program Files` or any other folder that Nostlan will not have read/write access to.  On Windows, Nostlan will look for emulator executables in the `BIN` folder or the default install location of that emulator (no need to move Yuzu).

    📁 emu (root folder can have any name)
    ├─┬ 📁 nostlan (image folder)
    │ └─┬ 📁 wii
    │   └──┬ 📁 GALE01 (Melee's game id)
    │      └── 🖼 box.png
    └─┬ 📁 Dolphin
    	├─┬ 📁 BIN
    	│ ├── 📁 User
    	│ ├── 📄 portable.txt
    	│ └── 🎮 Dolphin.exe
    	└─┬ 📁 GAMES
    		├── 💿 Super Mario Sunshine.gcz
    		├── 💿 Super Smash Bros Melee.iso
    		└── 💿 sm64.wad

# os mac

On macOS, Nostlan will look for emulator apps in `/Applications`.  Nostlan needs read/write permission to the install folder you choose so do not choose to install the Nostlan image folder at `/Applications`.

# os linux

On Linux, Nostlan will look for emulator apps in their default install locations.

# os mac linux

    📁 emu (root folder can have any name)
    ├─┬ 📁 nostlan (image folder)
    │ └─┬ 📁 wii
    │   └──┬ 📁  GALE01 (Melee's game id)
    │      └── 🖼 box.png
    └─┬ 📁 Dolphin
    	└─┬ 📁 GAMES
    		├── 💿 Super Mario Sunshine.gcz
    		├── 💿 Super Smash Bros Melee.iso
    		└── 💿 sm64.wad
