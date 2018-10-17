### Bottlenose Setup

Don't have any games but want to check out Bottlenose?  In demo mode you can browse through sample game box art.  Pick "demo mode" and choose a folder for the demo folder.

Bottlenose requires your game libraries to be organized a certain way.  'BIN' stores the emulator and 'GAMES' stores the games.

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

If you want to fill in a template with your existing emulator folders and game libraries click "create template" then choose the directory you want the template to go in.

When you're ready to start, click "select emu root" and select your root emulation folder.
