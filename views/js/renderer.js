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
  const bot = require('./bot.js');
  const delay = require('delay');
  const fs = require('fs-extra');
  const Fuse = require('fuse.js');
  const klawSync = require('klaw-sync');
  const md = require('markdown-it')();
  const os = require('os');
  const path = require('path');
  const req = require('requisition');
  const $ = require('jquery');

  window.$ = window.jQuery = $;
  window.Tether = require('tether');
  window.Bootstrap = require('bootstrap');

  require('../js/gcn_intro.js')();
  await delay(4000);

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
      for (let i = 0; i < results.length; i++) {
        if (results[i].id[3] == 'E') {
          $('#loadDialog0').text('loading ' + results[i].title);
          return results[i];
        }
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
      term = term.replace(/[\[\]]/g, '');
      term = term.replace(/[\[\(]*v\d[^ ]*/gi, '');
      // replacements
      term = term.replace(/ -/g, ':');
      term = term.replace(/ multi/gi, ' Multiplayer');
      let temp = term.replace(/, The/gi, '');
      if (term != temp) {
        term = 'The ' + temp;
      }
      // special complete subs
      term = term.replace(/mk(\d*)/gi, 'Mario Kart $1');

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
      let gameDir = `${usrDir}/DATA/EMULATORS/${emu}/GAMES`;
      if (await fs.exists(gameDir)) {
        prefs.wiiLibs.push(gameDir);
        usrDir += '/DATA/EMULATORS/bottlenose';
        await fs.ensureDir(usrDir);
        prefs.usrDir = usrDir;
      } else {
        log('choose the root folder of the WiiU_USB_Helper directory structure');
        // prefs.wiiLibs.push(openLib(consoleName));
      }
      await reset(consoleName);
      await fs.outputFile(gamesPaths[consoleName], JSON.stringify(games));
      await fs.outputFile(prefsPath, JSON.stringify(prefs));
    }
  }

  await load('wii');

  // await delay(1000000);

  async function dl(url, file) {
    if (!(await fs.exists(file))) {
      log('loading image: ' + url);
      log('saving to: ' + file);
      let res = await req(url);
      if (res.status == 404) {
        return false;
      }
      return await res.saveTo(file);
    }
    return true;
  }

  async function getFrontCover(game) {
    let dir = `${usrDir}/${game.console}/${game.id}/img`;
    let file = `${dir}/front_cover.jpg`;
    // if full cover already exists then don't check for high res
    // more than once
    if (!(await fs.exists(`${dir}/full_cover.jpg`))) {
      return true;
    }
    let title = game.title.replace(/ /g, '%20').replace(/[\:]/g, '');
    let url = `http://andydecarli.com/Video%20Games/Collection/Nintendo%20Game%20Cube/Scans/Full%20Size/Nintendo%20Game%20Cube%20${title}%20Front%20Cover.jpg`;
    let res = await dl(url, file);
    if (res) {
      return res;
    }
    url = `http://andydecarli.com/Video%20Games/Collection/Nintendo%20Wii/Scans/Full%20Size/Nintendo%20Wii%20${title}%20Front%20Cover.jpg`;
    res = await dl(url, file);
    if (res) {
      return res;
    }
    return false;
  }

  async function getFullCover(game) {
    let url = `https://art.gametdb.com/wii/coverfullHQ/US/${game.id}.png`;
    let dir = `${usrDir}/${game.console}/${game.id}/img`;
    let file = `${dir}/full_cover.png`;
    let res = await dl(url, file);
    if (res) {
      return res;
    }
    return false;
  }

  for (let i = 0; i < games.length; i++) {
    let game = games[i];
    await getFrontCover(game);
    await getFullCover(game);
  }

  games = games.sort((a, b) => a.title.localeCompare(b.title));

  async function addCover(game, cl) {
    let cl1 = '';
    let file = `${usrDir}/${game.console}/${game.id}/img/Front_Cover.jpg`;
    if (!(await fs.exists(file))) {
      file = `${usrDir}/${game.console}/${game.id}/img/Full_Cover.png`;
      if (!(await fs.exists(file))) {
        throw `no images found for game: ${game.id} ${game.title}`;
        return;
      }
      cl1 = 'front-cover-crop';
    }
    $('#carousel').append(`
			<div class="${((cl)?cl:'hideRight')}">
				<section class="${cl1}">
	      	<img src="${file}"/>
				</section>
	    </div>
		`);
  }

  for (let i = 0, j = 0; i < games.length; i++) {
    try {
      if (j >= 3) {
        await addCover(games[i]);
      } else if (j == 0) {
        await addCover(games[i], 'selected');
      } else if (j == 1) {
        await addCover(games[i], 'next');
      } else if (j == 2) {
        await addCover(games[i], 'nextRightSecond');
      }
      j++;
    } catch (ror) {
      log(ror);
    }
  }

  require('../js/gameLibViewer.js')();
  $('#cvs').remove();

  // $('#openBtn').click(openLib);

  $(document).keydown(function(e) {
    switch (e.which) {
      case 13: // Enter
        log('enter');
        break;
      case 27: // Escape
        remote.getCurrentWindow().close();
        break;
      default:
        return;
    }
    e.preventDefault();
  });
};
