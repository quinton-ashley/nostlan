module.exports = function() {
  var c = $('#minicube');
  var cubeSize = 150;
  var cSize = cubeSize / 3;

  var x = cSize * 2;
  var y = 0;
  var z = 0;
  var delayAmt = 60;

  function metal() {
    if ($('.square').length == $('.square.visible').length) {
      $('#cube').addClass('full');
      setTimeout(function() {
        $('#cube').addClass('metal');
      }, delayAmt * 8);
    }
  }

  function rX(d) {
    c.toggleClass('transition').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px) rotateX(' + d + 'deg)');
  }

  function rY(d) {
    c.toggleClass('transition').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px) rotateY(' + d + 'deg)');
  }

  function rZ(d) {
    c.toggleClass('transition').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px) rotateZ(' + d + 'deg)');
  }

  function animate() {

    var i = 0;

    $('.cubeface .square').each(function(key, value) {
      var sq = $(this);
      setTimeout(function() {
        sq.addClass('visible');
        metal();
      }, delayAmt * 2 * (key + 1));
    });

    // moving left
    setTimeout(function() {
      rY(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      x -= cSize;
      rY(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rY(-90);
    }, delayAmt * (i++));
    // switch
    setTimeout(function() {
      x -= cSize;
      rY(0);
      c.css('transform-origin', cSize + 'px ' + cSize + 'px 0');
    }, delayAmt * (i++));
    // moving forward
    setTimeout(function() {
      rX(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      y += cSize;
      rX(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rX(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      y += cSize;
      rX(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rX(-180);
    }, delayAmt * (i++));
    //switch
    setTimeout(function() {
      y += cSize;
      z -= cSize;
      rX(0);
      c.css('transform-origin', cSize + 'px 0 0');
    }, delayAmt * (i++));
    // moving down
    setTimeout(function() {
      rX(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      z -= cSize;
      rX(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rX(-90);
    }, delayAmt * (i++));
    //switch
    setTimeout(function() {
      z -= cSize;
      rX(0);
    }, delayAmt * (i++));
    // moving right
    setTimeout(function() {
      rZ(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      x += cSize;
      rZ(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rZ(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      x += cSize;
      rZ(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rZ(-180);
    }, delayAmt * (i++));
    //switch
    setTimeout(function() {
      x += cSize;
      y -= cSize;
      rZ(0);
      c.css('transform-origin', '0 0 0');
    }, delayAmt * (i++));
    // moving back
    setTimeout(function() {
      rZ(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      y -= cSize;
      rZ(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rZ(-90);
    }, delayAmt * (i++));
    // switch
    setTimeout(function() {
      y -= cSize;
      rZ(0);
      c.css('transform-origin', '0 0 ' + cSize + 'px');
    }, delayAmt * (i++));
    // moving up
    setTimeout(function() {
      rY(-90);
    }, delayAmt * (i++));
    setTimeout(function() {
      z += cSize;
      rY(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      rY(-90);
    }, delayAmt * (i++));
    // switch
    setTimeout(function() {
      z += cSize;
      rY(0);
      c.css('transform-origin', '0 ' + cSize + 'px 0');
    }, delayAmt * (i++));
    // moving left
    setTimeout(function() {
      rZ(90);
    }, delayAmt * (i++));
    setTimeout(function() {
      y += cSize;
      rZ(0);
    }, delayAmt * (i++));
    setTimeout(function() {
      $('#minicube').addClass('grow');
    }, delayAmt * (i++));
  }

  setTimeout(animate, delayAmt * 10);
}
