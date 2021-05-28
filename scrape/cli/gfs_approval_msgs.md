## Message From GameFAQs on 01/22/2019

Please, for the sake of us and any other site you wish to source images from, do _not_ build a scraper into the front-end.

Many emulator front-end authors in the past have attempted to offload their work onto us without any sense for what they're doing. Many people using front-ends have literally thousands and thousands of ROMs/ISOs, and when you multiply that by the number of people doing it, there's no way that scales in any way that is fair or equitable to the sites you are scraping.

Alternately, one centralized server scraping our pages on a weekly basis for images, then subsequently sharing those results in an index, is not an issue. Even image downloads are not an issue (as that happens via a CDN for us and many other resources), but distributed individualized scraping absolutely will cause problems for any site no matter how you try to code it.

## Message From qashto on 01/22/2019

Thank you for the quick response. I will remove gamefaqs scraping from the front-end and create a centralized index of direct links so Bottlenose can download images directly as you suggested. Thanks for your help with this! :)

## Message From GameFAQs on 01/22/2019

Thank you for checking in; you're probably the first front-end author to do so. We really don't care how many images get downloaded, it's the site scraping that causes problems.

One last tip; make sure your scraper identifies itself as a robot with a URL or email address in the user agent string; it will quickly get blocked otherwise if you copy a user agent from a browser or don't use one at all.
