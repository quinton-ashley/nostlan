/*
 * renderer.js handles responses to user interactions with the menu and app UI
 * authors: quinton-ashley
 * copyright 2018
 */
module.exports = async function(opt) {
  const err = console.error;
  const log = console.log;
  global.__rootDir = opt.__rootDir;

  const remote = require('electron').remote;
  const {
    app,
    dialog,
    Menu
  } = remote;
  const delay = require('delay');
  const fs = require('fs-extra');
  const Fuse = require('fuse.js');
  const klawSync = require('klaw-sync');
  const path = require('path');
  const pug = require('pug');
  const $ = require('jquery');

  window.$ = window.jQuery = $;
  window.Tether = require('tether');
  window.Bootstrap = require('bootstrap');
  // var jQueryBridget = require('jquery-bridget');
  // var Masonry = require('masonry-layout');
  // // make Masonry a jQuery plugin
  // jQueryBridget('masonry', Masonry, $);
  const viewer = require('../js/gameLibViewer.js');

  const gcnIntroHTML = pug.compileFile(path.join(__dirname, '../pug/gcnIntro.pug'));
  const gcnIntro = function() {
    $('body').prepend(gcnIntroHTML());
    require('../js/gcnIntro.js')();
  }
  gcnIntro();
  // await delay(4000);

  // make UI changes
  $('#update').hide();

  // get the default prefrences
  let prefsDefaultPath = path.join(__rootDir, '/prefs/prefsDefault.json');
  let prefsDefault = JSON.parse(await fs.readFile(prefsDefaultPath));
  let prefsPath = path.join(__rootDir, '/usr/prefs.json');
  let prefs = prefsDefault;
  let gamesPaths = {
    wii: path.join(__rootDir, '/usr/wiiGames.json')
  };
  let usrDir = '';
  let games = [];

  String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
  }

  function openLib(consoleName) {
    let dir = dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: `open ${consoleName} game library`,
      message: `choose the ${consoleName} game library`
    });
    return dir[0];
  }

  function chooseBottlenoseDir() {
    let dir = dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'choose bottlenose folder',
      message: `choose the root dir for bottlenose`
    });
    return dir[0];
  }

  function getEmuForConsole(consoleName) {
    switch (consoleName) {
      default: return 'Dolphin';
    }
  }

  async function reset(consoleName) {
    games = [];
    let gameDB = [];
    let DBPath = path.join(__rootDir, `/db/${consoleName}DB.json`);
    gameDB = JSON.parse(await fs.readFile(DBPath)).games;
    log(gameDB);

    let options = {
      shouldSort: true,
      threshold: 0.4,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "id",
        "title"
      ]
    };
    let fuse = new Fuse(gameDB, options);

    function addGame(searchTerm) {
      let results = fuse.search(searchTerm);
      let region = prefs.region;
      let game = results.find(x => x.id === x.id.replaceAt(3, region));
      if (game) {
        return game;
      }
      for (let i = 0; i < results.length; i++) {
        let gRegion = results[i].id[3];
        if (gRegion == 'E' && (region == 'P' || region == 'J')) {
          continue;
        }
        if (gRegion == 'P' && (region == 'E' || region == 'J')) {
          continue;
        }
        if (gRegion == 'J' && (region == 'E' || region == 'P')) {
          continue;
        }
        $('#loadDialog0').text('loading ' + results[i].title);
        return results[i];
      }
      return false;
    }

    // TODO: cut strings to 32 characters max
    let files = klawSync(prefs.wiiLibs[0], {
      nodir: true
    });
    for (let i = 0; i < files.length; i++) {
      let file = files[i].path;
      log(file);
      let term = path.parse(file).name;
      // eliminations
      term = term.replace(/[\[\(]USA[\]\)]/gi, '');
      term = term.replace(/[\[\(]*(NTSC)+(-U)*[\]\)]*/gi, '');
      term = term.replace(/[\[\(]*(N64|GCN)[,]*[\]\)]*/gi, '');
      term = term.replace(/[\[\(,](En|Ja|Eu)[\]\)]*/gi, '');
      // replacements
      term = term.replace(/ -/g, ':');
      let temp = term.replace(/, The/gi, '');
      if (term != temp) {
        term = 'The ' + temp;
      }
      // eliminations part 2
      term = term.replace(/,/g, '');
      // special complete subs
      term = term.replace(/ssbm/gi, 'Super Smash Bros. Melee');
      term = term.replace(/ 20XX.*/gi, ': 20XX Training Pack');
      term = term.replace(/sm *64/gi, 'Super Mario 64')
      term = term.replace(/mk(\d+)/gi, 'Mario Kart $1');
      term = term.replace(/warioware,*/gi, 'Wario Ware');
      term = term.replace(/ bros /gi, ' Bros. ');
      term = term.replace(/Nickelodeon SpongeBob/gi, 'SpongeBob');
      term = term.replace(/(papermario|paper mario[^\: ])/gi, 'Paper Mario');
      term = term.replace(/lego/gi, 'lego');
      // special check for ids
      let id = term.match(/[A-Z1-9][A-Z1-9][A-Z1-9][A-Z]\d*/g);
      if (id) {
        term = id[0];
      }
      // eliminations part 3
      term = term.replace(/[\[\(]*(v\d.|\d+\.).*/gi, '');
      term = term.replace(/[\[.*\]]/g, '');

      term = term.trim();
      log(term);
      let game = addGame(term);
      if (game) {
        log(game.title);
        game.console = consoleName;
        game.file = file;
        games.push(game);
      }
    }
    await fs.outputFile(gamesPaths[consoleName], JSON.stringify(games));
    await fs.outputFile(prefsPath, JSON.stringify(prefs));
  }

  async function load(consoleName) {
    // if prefs exist load them if not copy the default prefs
    if (await fs.exists(prefsPath)) {
      games = JSON.parse(await fs.readFile(gamesPaths[consoleName]));
      prefs = JSON.parse(await fs.readFile(prefsPath));
      usrDir = prefs.usrDir;
    } else {
      usrDir = chooseBottlenoseDir();
      let emu = getEmuForConsole(consoleName);
      let gameDir = `${usrDir}/${emu}/GAMES`;
      if (await fs.exists(gameDir)) {
        prefs.wiiLibs.push(gameDir);
        usrDir += '/bottlenose';
        await fs.ensureDir(usrDir);
        prefs.usrDir = usrDir;
      } else {
        log(`choose emulation folder with directory structure:
{root folder can have any name}
├─┬ Dolphin
│ ├─┬ BIN
│ │ ├── Languages
│ │ ├── Sys
│ │ ├── User
│ │ ├── portable.txt
│ │ ├── Dolphin.exe
│ │ └── ...
│ └─┬ GAMES
│   └── ...
├── Cemu
└── Yuzu`);
        // prefs.wiiLibs.push(openLib(consoleName));
      }
      await reset(consoleName);
    }
  }

  await load('wii');
  await viewer.load(games, prefs);
  $('#cvs').remove();

  async function powerBtn() {
    await viewer.powerBtn();
    gcnIntro();
    await viewer.load(games, prefs);
    $('#cvs').remove();
  }

  async function resetBtn() {
    viewer.remove();
    gcnIntro();
    await reset('wii');
    await viewer.load(games, prefs);
    $('#cvs').remove();
  }

  async function openBtn() {

  }

  $('#powerBtn').click(powerBtn);
  $('#openBtn').click(openBtn);
  $('#resetBtn').click(resetBtn);

  // $(document).keydown(function(e) {
  //   switch (e.which) {
  //     case 13: // Enter
  //       log('enter');
  //       break;
  //     case 27: // Escape
  //       remote.getCurrentWindow().close();
  //       break;
  //     default:
  //       return;
  //   }
  //   e.preventDefault();
  // });
};
