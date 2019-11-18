# Message From on 01/22/2019

A Bottlenose user has informed me that Bottlenose may be violating GFAQs TOS by scraping the site to download cover images for the user's games.

Bottlenose is a high quality front-end launcher for video game emulators. It's a native app available on Linux, macOS, and Windows. It's primary functions are command line emulator launching and automated cover art retrieval from several sites.

I would like to be authorized to scrape the gameFAQs image database. Here's how I currently perform scraping:

I make 1 request per game when indexing to search for it on the site map. The gameFAQs id is stored. I make 2 addition requests to get the image page, searching for the first US cover listed, then I make a request to the image page before download each of the back, front, and side cover images. If there was no cover available for the game at the time, a user can check for covers again in the future using the gameFAQs so one less request will be made.

Bottlenose does not download any images during the scraping process, it only needs the html. Therefore, Bottlenose scraping is actually less resource intensive for the gameFAQs servers than a human browsing the site through a browser would be.

I'm sure we could come to a mutually beneficial agreement that will allow Bottlenose users to continue to benefit from the convenience of automated downloads from gameFAQs. In the future I would also like Bottlenose to download game saves from gameFAQs.

I have a few possible ideas for the partnership:

-   a full screen gameFAQs logo displayed when the app loads

-   seamless gameFAQs ads in Bottlenose through the use of overlaid stickers on some game covers downloaded from gameFAQs

-   "view this game's walk-through/saves/manual/etc. on gamefaqs button" in the game box menu

If gameFAQs would rather contract/employ me to make Bottlenose a gameFAQs product I am open to negotiating how that would work too. Note that the code of Bottlenose, a hobby project, is currently not representative of my more professional work on Qodemate and automaDICOM.

# Message From GameFAQs on 01/22/2019

Please, for the sake of us and any other site you wish to source images from, do _not_ build a scraper into the front-end.

Many emulator front-end authors in the past have attempted to offload their work onto us without any sense for what they're doing. Many people using front-ends have literally thousands and thousands of ROMs/ISOs, and when you multiply that by the number of people doing it, there's no way that scales in any way that is fair or equitable to the sites you are scraping.

Alternately, one centralized server scraping our pages on a weekly basis for images, then subsequently sharing those results in an index, is not an issue. Even image downloads are not an issue (as that happens via a CDN for us and many other resources), but distributed individualized scraping absolutely will cause problems for any site no matter how you try to code it.

# Message From on 01/22/2019

Thank you for the quick response. I will remove gamefaqs scraping from the front-end and create a centralized index of direct links so Bottlenose can download images directly as you suggested. Thanks for your help with this! :)
Message From GameFAQs on 01/22/2019

Thank you for checking in; you're probably the first front-end author to do so. We really don't care how many images get downloaded, it's the site scraping that causes problems.

One last tip; make sure your scraper identifies itself as a robot with a URL or email address in the user agent string; it will quickly get blocked otherwise if you copy a user agent from a browser or don't use one at all.
