# 1.1.1

MAME and mGBA are now supported!  Major user experience improvements.

Bottlenose can now automatically download high quality cover art for the majority of your games!  This update required a lot of behind the scenes work, writing scrapers for FlyerFever, The Cover Project, and gamefaqs to get direct links to images and storing them in the game database files.

Arcade game flyers for MAME are from [FlyerFever](https://www.flyerfever.com/) these images are hosted by [Tumblr](https://www.tumblr.com/).  Be warned, if you have the full MAME library all of these images will require 13GB of disk space!  It's totally worth it though, a lot of this artwork is incredible.  Take a look at [this screenshot](https://raw.githubusercontent.com/quinton-ashley/bottlenose-screenshots/master/mame.png).  MAME arcade cabinet artwork is downloaded from [Mr. Do's Arcade](http://www.mameworld.info/mrdo/mame_artwork_ingame.php).

Most PS2 and GBA game artwork is downloaded from [The Cover Project](http://www.thecoverproject.net/) and [gamefaqs](https://gamefaqs.gamespot.com).

This update adds several new features that will improve the user experience.  There are two new options in the pause menu: `rescan game library` and `recheck for images`.  A rescan should be done if you've added new games to your game library.  Bottlenose will check for available game artwork images for those games.  Rechecking for images will rescan your game library and recheck for available images for all your games.  If you are a previous user of Bottlenose, you should do a recheck for all of your game libraries to get missing images.

Need to adjust settings in the emulator app without loading a game?  The `Reset` button on the main game library screen now does just that!  `Power` will start the emulator with the selected game.

I've made an ease of use change that several users have suggested.  The entire overlay covers, not just the buttons, are clickable.  Now you can haphazardly drag the mouse to the corner and click without having to precisely move it over the little buttons.

Controller profiles are now assigned automatically by controller type: `xbox`, `ps`, or `nintendo`.  The `default` profile will be used if the connected controller's gamepad id is not one of those types.

Several annoying User Interface problems have been fixed in this version.

Bottlenose now remembers your most recently played game for each individual emulator.  Bottlenose will auto-scroll and place the game controller cursor on it when you load the corresponding game library.  This is a necessity for the large MAME library.  Filter searching for games will be the next feature I will work on!

Bottlenose is no longer an "experimental" project and is ready for public use!

If something is wrong with the app or if you have any questions please email me <mailto:qashto@gmail.com> or write up an issue report on Github.

Please [donate any amount](https://www.paypal.me/qashto/10) to support my development of Bottlenose if you can.  If everyone that downloads this update gave me even one dollar I would really appreciate it.  I spent several days over the past month working non-stop to make this update.  Supporting so many emulators and game libraries has proven to be a massive undertaking.

# 1.0.65

This is a work in progress update to Bottlenose that includes MAME support!  I would love for Bottlenose to gain widespread use and hopefully by supporting MAME   Once I have more time to work on Bottlenose, I will work on creating a database of flyer image urls.  The flyer images will be sourced from flyerfever.com, which has a high resolution, high quality images of arcade flyers.

My previous update to Bottlenose added Gamecube controller adapter support but broke the app for first time users.  If you have a problem with Bottlenose please let me know!  I got 200+ upvotes on that post but not one complaint.
