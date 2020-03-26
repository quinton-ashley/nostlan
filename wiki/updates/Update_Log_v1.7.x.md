Nostlan is an open source _high quality_ front-end launcher for video game emulators! Available on Linux, macOS, and Windows. Supports Dolphin, Cemu, Yuzu, mGBA, melonDS, Citra, MAME, PCSX2, RPCS3, and Xenia.

[Download the latest version of Nostlan](https://github.com/quinton-ashley/nostlan/releases) and if you enjoy the app [please make a donation](https://www.paypal.me/qashto/20), any amount of money is appreciated. [Support the development of Nostlan on patreon](https://www.patreon.com/qashto) to gain access to premium features! [New user? Read more about Nostlan](https://github.com/quinton-ashley/nostlan/blob/master/README.md)

<p><a href="https://www.patreon.com/qashto">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/banner.png">
</a></p>

## Summary

- backup/sync all your save data to the cloud or local storage device!
- support for Yuzu Early Access builds
- custom theming (coming soon)

## New Premium Feature: Cloud Save Sync!

If you support Nostlan on Patreon for just $1/month you can access this new premium feature!

Nostlan can automatically sync all of your emulator game saves and save states to a folder in your Dropbox, OneDrive, etc. so you can play across multiple devices without losing in-game progress! This feature has never been implemented in an emulator launcher before. I've been working on it for a while and I'm really excited that people will finally be able to use it!

### How it works

Nostlan will prompt you to choose where you want your save sync folder to go. If for example you choose `D:/Dropbox`, Nostlan will create a new folder `D:/Dropbox/nostlan_saves` in your Dropbox. Saves will be stored in this format `nostlan_saves/{timestamp}/{folder index}`. Do not delete or modify any of the files in nostlan_saves!

### Backing up save data

Quitting Nostlan or pressing `backup saves` in the pause menu will upload/backup your local save data (ONLY for the current game library being viewed) to your Nostlan save sync folder.

### Sync progress between multiple devices

Starting Nostlan, loading a game library, or pressing `update saves` in the pause menu will update your local game saves (ONLY for the current game library being viewed) if there's newer save data that was uploaded by another device to your save sync folder. WARNING if you don't backup your progress when you finish gaming on one device it's possible to overwrite that progress after you upload save data from another device. Use of this feature is at your own risk. I've tested this feature and it works perfectly though.

### Sync progress from your Android to your PC

WARNING I don't own an Android and haven't tried this myself. I'm pretty sure this is how it would work but let me know. If you make progress on a mobile device, like an Android, that will make changes directly to the saves in your nostlan_saves folder, your saves on your PC won't be automatically updated because Nostlan looks for an increase in the timestamp number on the folder those saves are in. You can force Nostlan to pull those changes from the save sync folder by using `update saves` in the pause menu.

## How to access Premium Features

On startup Nostlan will prompt you to become a Patreon supporter. Every month, Patreon supporters will be able to see a Patreon post with the monthly donor password unique to that month. Select `access premium features` from the donation menu. After you support Nostlan on Patreon, visit Nostlan's Patreon page to get the monthly donor password. Copy the password and paste it into the donor password input. Select `verify password`, if the password is correct you will have access to premium features!

## Coming Soon: Custom Theming

Custom theming is coming to Nostlan. Want to help me make the default color palettes for each system? Edit the `theme.css` files in the `themes` folder of this project and submit a pull request!

```css
.n3ds {
  --cover-color: #3f4044;
  --cover-text-color: #202125;
  --powerBtn-color: #5a86c7;
  --resetBtn-color: #009a6d;
  --openBtn-color: #ddbb62;
}

.n3ds.blue {
  --cover-color: #557eaa;
  --cover-text-color: #3a465e;
  --powerBtn-color: #3a465e;
  --resetBtn-color: #3a465e;
  --openBtn-color: #3a465e;
  --powerBtn-text-color: #5a86c7;
  --resetBtn-text-color: #009a6d;
  --openBtn-text-color: #ddbb62;
}

.n3ds.white {
  --cover-color: #ebebeb;
  --cover-text-color: #949494;
  --powerBtn-color: #ffa93a;
  --resetBtn-color: #ffa93a;
  --openBtn-color: #ffa93a;
  --powerBtn-text-color: #5a86c7;
  --resetBtn-text-color: #009a6d;
  --openBtn-text-color: #ddbb62;
}
```

## Let me know what you think about Nostlan

Nostlan is an experimental project but I want to make it useful for the general public! If something is wrong with the app or if you have any questions please email me <mailto:qashto@gmail.com> or write up an issue report on Github. What do you think of the premium features I have planned?

## Premium Features

Support the development of Nostlan on [Patreon](https://www.patreon.com/qashto) to gain access to these premium features!

- backup/sync all your save data to the cloud or local storage device
- custom ui themeing (coming soon)

Features that might be offered in the future:

- support for PC games, making Nostlan able to launch all your games
- single click to install emulators/updates
- database of Dolphin texture packs
- batch install and auto-update texture packs for Dolphin
- easy way to mix and swap texture packs for Dolphin

## If you like using Nostlan please donate!

Hi my name is Quinton and this is the part where I beg you for money! Even though I decided to make this project open source and free to use, it still took a lot of work and a long time to develop. If you appreciate my work so far and will continue to use Nostlan please [donate](https://www.paypal.me/qashto/10) an amount of your choosing. If everyone that downloads this update gave me even $1 I would really appreciate it. Cloud saving is coming soon for Patreon supporters. Thank you!

Support on Patreon:  
<https://www.patreon.com/qashto>

Donate via Paypal:  
<https://www.paypal.me/qashto/20>

<p><a href="https://www.patreon.com/qashto">
<img src="https://raw.githubusercontent.com/quinton-ashley/nostlan-screenshots/master/banner.png">
</a></p>
