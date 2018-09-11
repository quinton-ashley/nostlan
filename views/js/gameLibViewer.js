module.exports = function(games, prefs) {
  const log = console.log;

  const spawn = require('await-spawn');
  const delay = require('delay');
  const path = require('path');
  const {
    remote
  } = require('electron');

  let pos = 0;

  this.goTo = function(position, time) {
    pos = position;
    if (!pos) {
      log("pos can't be: " + pos);
      return;
    }
    time = time || 2000;
    $('html').stop().animate({
      scrollTop: pos
    }, time);
    $('.reel.reverse').stop().animate({
      bottom: pos * -1
    }, time);
    log(pos);
  }
  let goTo = this.goTo;

  $(window).bind('mousewheel', function(event) {
    event.preventDefault();
    if ($('.panel.selected').length) {
      return;
    }
    if (event.originalEvent.wheelDelta < 0) {
      pos += 100;
    } else {
      pos -= 100;
    }
    goTo(pos);
  });

  this.scrollToGame = function(gameID, time) {
    let $cover = $('.' + gameID).eq(0);
    let $reel = $cover.parent();
    let pos = $cover.height() * ($cover.index() + .5);
    if ($reel.hasClass('reverse')) {
      pos += $(window).height() * .5;
      pos = $reel.height() - pos;
    } else {
      pos -= $(window).height() * .5;
    }
    goTo(pos, time);
  }
  let scrollToGame = this.scrollToGame;

  $('.panel').click(function() {
    let $cover = $(this);
    let $reel = $cover.parent();
    scrollToGame($cover.attr('class').split(' ')[1], 1000);
    $cover.toggleClass('selected');
    $reel.toggleClass('selected');
    $('.reel').toggleClass('bg');
    $('nav').toggleClass('gameView');
    if ($cover.hasClass('selected')) {
      $reel.css('left', `${$(window).width()*.5-$cover.width()*.5}px`);
      $cover.css('transform', `scale(${$(window).height()/$cover.height()})`);
    } else {
      $reel.css('left', '');
      $cover.css('transform', '');
    }
    log($cover);
  });

  this.getSelectedID = function() {
    return $('.panel.selected').attr('class').split(' ')[1];
  }
  let getSelectedID = this.getSelectedID;

  async function powerBtn() {
    remote.BrowserWindow.getFocusedWindow().minimize();
    await spawn(path.join(prefs.usrDir, '../Dolphin/BIN/Dolphin.exe'), [
      games.find(x => x.id === getSelectedID()).file
    ]);
  }

  $('#powerBtn').click(powerBtn);

  // $(window).on('scroll', function() {
  //   $('.reel.reverse').css('bottom', window.pageYOffset * -1);
  //   pos = window.pageYOffset;
  // });
}
