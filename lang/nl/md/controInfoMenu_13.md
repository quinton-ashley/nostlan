# Wat is context-afhankelijke knoptoewijzing?

    Xbox/PS context-afhankelijke knoptoewijzing voor              Playstation: ongewijzigd
    een Xbox One-controller met verschillende       	functioneel dezelfde indeling
    game library browsing contexts:             Y B  ->  △ ○
                                               X A  ->  □ X

    Nintendo: remapped to match Nintendo      Xbox and Arcade: not remapped
    	controller's button layout
      Y B  ->  X A                              Y B  ->  Y B
     X A  ->  Y B                              X A  ->  X A

Although some may find this confusing at first, adaptive context mapping maps the button layout of your controller to match the physical button layout of controllers made for the system being emulated. In the NTSC region, Xbox and Playstation use the bottom button of the face button diamond as the "yes" or "make selection" button. Starting with the SNES, the B button has been at the bottom of the layout diamond on Nintendo controllers. The B button on Nintendo systems means "no" or "back".

Hence by using an adaptive context mapping profile you will always be using the physically correct button layout for the system library you're browsing, regardless of what controller you use! I recommend using adaptive mapping in your controller settings for each emulator too. This way you can play games using the button layout that game developers intended, even if you're using a controller made for a different system.

To disable this feature change the mapping profile from "adaptive" to "none" in controller settings, quit Nostlan to save your changes, and then restart Nostlan.
