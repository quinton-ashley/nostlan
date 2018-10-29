# Bottlenose Setup

Click "demo mode" to browse through sample game box art.

To use the full version of Bottlenose, your game libraries and emulator folders must be organized like this:

```javascript
emu (root folder can have any name)
└─┬ Dolphin
  ├─┬ BIN
  │ ├── User/...
  │ ├── portable.txt
  │ └── Dolphin.exe
  └─┬ GAMES
    ├── Super Mario Sunshine.gcz
    ├── Super Smash Bros Melee.iso
    └── sm64.wad
```

Click "create template" and Bottlenose will generate a template file structure for you to move your game libraries and emulators to.

When you're ready click "full version" and select your root folder.  In the example it's named "emu" but you can give it any name.
