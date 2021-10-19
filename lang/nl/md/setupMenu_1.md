# Nostlan instellen

Geef aan waar Nostlan gedownloade afbeeldingen moet opslaan. Je kunt deze mappenstructuur tevens gebruiken om je spellen in te plaatsen, maar dat kan ook elders - Nostlan zal je vragen naar de spellenmap. [Meer informatie (Engels)](https://github.com/quinton-ashley/nostlan#nostlan-file-structure)

# os windows

Windows-gebruikers dienen hun geëmuleerde programma's of -spellen niet in `Program Files` of een andere niet door Nostlan uit te lezen/beschrijven map te plaatsen. Nostlan zoekt naar uitvoerbare emulatorbestanden in de standaard installatielocatie (indien beschikbaar) en vervolgens in de map `emu/{system}/{emulator}`.

```
📁 ~/Documenten/emu
└─┬ 📁 ds (systeemmap)
  ├─┬ 📁 desmume (emulatormap)
  │ └── 🎮 desmume.exe
  ├─┬ 📁 games
  │ ├── 💿 Mario & Luigi - Partners in Time.nds
  │ └── 💿 Mario & Luigi - Partners in Time.sav
  └─┬ 📁 images
    └──┬ 📁  A58E (spel-id)
		   ├── 🖼 cover.png (voorzijde)
       └── 🖼 cart.png (cartridge)
```

# os mac

Op macOS heeft Nostlan lees- en schrijfrechten nodig op je documentenmap. Deze rechten kun je verlenen in de systeemvoorkeuren. Nostlan zoekt naar emulators in de map `/Applications` en vervolgens in `emu/{system}/{emulator}`. Plaats `nostlan.app` in `/Applications`, maar niet de emulatormap `emu`.

# os linux

Op Linux zoekt Nostlan naar emulators in de standaard installatielocaties of in `emu/{system}/{emulator}`.

# os mac linux

```
📁 ~/Documenten/emu
└─┬ 📁 ds (systeemmap)
  ├── 📁 desmume (emulatormap)
  ├─┬ 📁 games
  │ ├── 💿 Mario & Luigi - Partners in Time.nds
  │ └── 💿 Mario & Luigi - Partners in Time.sav
  └─┬ 📁 images
    └──┬ 📁  A58E (spel-id)
       └── 🖼 box.png (voorkant van de doos)
```
