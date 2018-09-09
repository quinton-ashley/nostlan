module.exports = function() {
  const log = console.log;

  let pos = 0;
  $(window).bind('mousewheel', function(event) {
    event.preventDefault();
    if ($('.panel.selected').length) {
      return;
    }
    log(pos);
    if (event.originalEvent.wheelDelta < 0) {
      pos += 100;
    } else {
      pos -= 100;
    }
    $('html').stop().animate({
      scrollTop: pos
    }, 2000);
    $('.reel.reverse').stop().animate({
      bottom: pos * -1
    }, 2000);
  });

  $('.panel').click(function() {
    $(this).toggleClass('selected');
    $(this).parent().toggleClass('selected');
    log($(this));
  });
}
