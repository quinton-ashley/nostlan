/*
 * renderer.js handles responses to user interactions with the menu and app UI
 * authors: quinton-ashley
 * copyright 2018
 */
module.exports = async function(opt) {
  const err = console.error;
  const log = console.log;
  global.__rootDir = opt.__rootDir;

  const {
    app,
    dialog,
    Menu
  } = require('electron').remote;
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

  usrDir = '';

  require('../js/gcn_intro.js')();

  // make UI changes
  $('#update').hide();

  // get the default prefrences
  let prefsDefaultPath = path.join(__rootDir, '/prefs/prefsDefault.json');
  let prefsDefault = JSON.parse(await fs.readFile(prefsDefaultPath));
  let prefsPath = path.join(__rootDir, '/usr/prefs.json');
  let prefs = prefsDefault;

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

  // if prefs exist load them if not copy the default prefs
  if (await fs.exists(prefsPath)) {
    prefs = JSON.parse(await fs.readFile(prefsPath));
  } else {
    usrDir = chooseBottlenoseDir() + '/DATA/EMULATORS/Dolphin';
    if (await fs.exists(usrDir)) {
      prefs.wiiLibs.push(usrDir + '/GAMES');
      usrDir += '/bottlenose';
      await fs.ensureDir(usrDir);
    } else {
      prefs.wiiLibs.push(openLib('wii'));
    }
  }

  let gameDB = [];

  async function getGameDB(consoleName) {
    let DBPath = path.join(__rootDir, `/db/${consoleName}DB.json`);
    return JSON.parse(await fs.readFile(DBPath)).games;
  }
  gameDB = await getGameDB('wii');
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

  let games = [];
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
      game.file = file;
      games.push(game);
    }
  }
  // await delay(1000000);

  async function dl(url, file) {
    if (!(await fs.exists(file))) {
      log('loading image: ' + url);
      let res = await req(url);
      if (res.status == 404) {
        return false;
      }
      return await res.saveTo(file);
    }
    return true;
  }

  for (let i = 0; i < games.length; i++) {
    let game = games[i];
    let url = `http://andydecarli.com/Video%20Games/Collection/Nintendo%20Game%20Cube/Scans/Full%20Size/Nintendo%20Game%20Cube%20${game.title.replace(/ /g, '%20')}%20Front%20Cover.jpg`;
    let name = game.title.replace(/ /g, '_');
    let dir = `${usrDir}/${game.id}/img`;
    let file = `${dir}/front_cover.jpg`;
    await dl(url, file);
    url = `https://art.gametdb.com/wii/coverfullHQ/US/${game.id}.png`;
    file = `${dir}/full_cover.png`;
    await dl(url, file);
  }

  function addCover(game, cl) {
    $('#carousel').append(`
			<div class="${((cl)?cl:'hideRight')}">
	      <img src="${usrDir}/${game.id}/img/Front_Cover.jpg">
	    </div>
		`);
  }

  for (let i = 0; i < games.length; i++) {
    if (i >= 3) {
      addCover(games[i]);
    } else if (i == 0) {
      addCover(games[i], 'selected');
    } else if (i == 1) {
      addCover(games[i], 'next');
    } else if (i == 2) {
      addCover(games[i], 'nextRightSecond');
    }
  }

  require('../js/gameLibViewer.js')(games);
  $('#cvs').remove();

  $('#openBtn').click(openLib);

  const template = [{
      label: 'File',
      submenu: [{
        label: 'Open',
        click() {
          open();
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [{
          role: 'reload'
        },
        {
          role: 'forcereload'
        },
        {
          role: 'toggledevtools'
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'window',
      submenu: [{
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      role: 'help',
      submenu: [{
        label: 'Learn More',
        click() {
          require('electron').shell.openExternal('https://electronjs.org')
        }
      }]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Qodemate',
      submenu: [{
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })

    // Window menu
    template[4].submenu = [{
        role: 'close'
      },
      {
        role: 'minimize'
      },
      {
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        role: 'front'
      }
    ]
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
