# Qodemate

Qodemate is a dynamic, un-sandboxed CS presentation/textbook platform!

## Goals and Ethos

-   Made for CS Educators, so that with minimal prep work they can give fancy, multi-file, non-sequential, step reproduction presentations (like CodeAcademy).
-   The ethos of Qodemate is to make the process of coding transparent so CS educators can teach computer science, not just programming.
-   Works with the fully featured IDEs you love (like Eclipse, Adobe Brackets, Xcode, etc.) and doesn't use a sandboxed webpage IDE (CodeAcademy, Hour of Code, Code Studio).  Many sandboxed tutorial sites teach people the often oversimplified basics of programming.  They often have a lot of code running behind the scenes that users can't access.  This often results in students not knowing how to start their own projects outside of the site's sandboxed environment.
-   In addition to code reproduction, during a Qodemate presentation you can pull up docs, install packages, run commands, and even do a search on StackOverflow.
-   Projects are stored locally so everyone can see all the files and modules.
-   Students that use Qodemate get real world programming experience: how to get from a blank document of nothing to something or use packages to build a project greater than the sum of its parts.  Qodemate was designed so that teachers can purposefully show all the trial and error along the way.

## Why should I use Qodemate?

### Static Slide Presentations

-   require a lot of prep work
-   slides can only contain static screenshots or excerpts of code
-   can't run the program at different points during the presentation
    ### Live Coding Presentations
-   must be done from memory or improvised
-   teaching a class at the same time can be difficult
-   forces you to sit/stand behind a computer during class

### Dynamic Qodemate Presentations

-   prep every moment of a dynamic presentation
-   run code at any point during the presentation
-   no typing necessary, hit the spacebar or use a clicker like you would with a powerpoint

### Summary

Don't just teach your students programming, teach them the process of programming!  By using Qodemate you get all the benefits of static slide based presentations and live coding presentations and none of the disadvantages!  Still not convinced?  Take a look at the simple_sample.js and lesson.md files bellow and see how easy it is to section your code and write slides in markdown!

## Simple Sample Project

```javascript
// simple_sample.js
function setup() { //0
  console.log('setting up...'); //2
  let x = 30; //1
  let y = 50;
} //0
```

```markdown
# lesson.md
# setup function //0
Let's write the setup function!
# setup function //1
Initialize our x and y variables.
# setup function //2
Let's make sure to log what we're doing in the console.
```

## Installation Instructions for Developers

Gotta see it to believe it? ~~Click on the releases tab and download the native Qodemate app for your OS.~~  **Qodemate is currently pre-beta, you must clone this repository and build yourself**

Install the LTS version of node.js and npm.

Windows Specific

    $ npm install --global --production windows-build-tools

macOS Specific

    $ xcode-select --install

All Systems

    $ npm install --global node-gyp
    $ mkdir ~/Documents/dev
    $ cd ~/Documents/dev
    $ git clone https://github.com/quinton-ashley/qodemate.git
    $ cd qodemate
    $ npm i
    $ npm i electron
    $ npm start

## How does it work?

Check out the wiki!  More pages are coming soon.

## Getting Started

Download these test files.  Right now only the jsTestFolder will work.  
<https://github.com/quinton-ashley/qodemate-test-files>

## Future Features

### Video/Audio File Syncing

Steps can also be synced to video tutorials on Youtube, vimeo, etc outside a classroom setting to create interactive tutorial experiences outside the classroom.

### Please consider donating!

If you want to support this project and you appreciate my work so far please donate!  Any amount is accepted.  Thank you :)

Ethereum: 0xb4355179da353f1BA4AA0BB5a7E3Ba4FdC7128ea  
Bitcoin: 1LJkyU5jdZb525sBwcx1dA2qV8kgowdcro  
Patreon: <https://www.patreon.com/qashto>  
Paypal: <https://www.paypal.me/qashto/5>
