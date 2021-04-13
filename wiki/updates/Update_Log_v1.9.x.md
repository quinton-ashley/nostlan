## Update Summary for v1.9.x

<p><a href="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gcn.png">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/gcn_LQ.png">
</a></p>

#### User Experience

- haptic feedback on gamepads when you move the cursor (tested with an Xbox One controller)
- better Wii U / MAYFLASH GameCube Controller Adapter support
- only one app can use the gca at a time. That means unfortunately when Nostlan launches Dolphin it has to close in order for the gca to work with Dolphin. This isn't ideal ofc but it's still pretty cool just to be able to use a GameCube controller with Nostlan.
- only when users actively use their gca, don't use another controller, and launch a game using Dolphin will Nostlan quit to let Dolphin use the gca. If you simply have a gca plugged in but aren't using a Gamecube controller with Nostlan then Nostlan will function normally and stay open in the background when you launch a game.

![](https://camo.githubusercontent.com/13132416c2cbed600fa668a9ee325218dba290be/687474703a2f2f692e696d6775722e636f6d2f676762596538762e706e67)

### App UI

- when launching a game (not with gca), Nostlan will show the following tip:
  `To close the emulator, press and hold the` +
  `"${prefs.inGame.quit.hold}" button for` +
  `${(prefs.inGame.quit.time/1000).toFixed(0)} seconds`
- better UI labelling on the main menu
