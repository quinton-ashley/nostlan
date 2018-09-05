module.exports = function() {

  function moveToSelected(selected) {
    var next = $(selected).next();
    var prev = $(selected).prev();
    var nextSecond = $(next).next();
    var prevSecond = $(prev).prev();
    var nextThird = $(nextSecond).next();
    var prevThird = $(prevSecond).prev();
    var nextFourth = $(nextThird).next();
    var prevFourth = $(prevThird).prev();

    $(selected).removeClass().addClass("selected");

    $(next).removeClass().addClass("next");
    $(prev).removeClass().addClass("prev");

    $(nextSecond).removeClass().addClass("nextRightSecond");
    $(prevSecond).removeClass().addClass("prevLeftSecond");

    $(nextThird).removeClass().addClass("nextRightThird");
    $(prevThird).removeClass().addClass("prevLeftThird");

    $(nextFourth).removeClass().addClass("nextRightFourth");
    $(prevFourth).removeClass().addClass("prevLeftFourth");

    $(nextFourth).nextAll().removeClass().addClass('hideRight');
    $(prevFourth).prevAll().removeClass().addClass('hideLeft');

  }

  $(document).keydown(function(e) {
    switch (e.which) {
      case 37: // left
        moveToSelected($('.prev'));
        break;

      case 39: // right
        moveToSelected($('.next'));
        break;

      default:
        return;
    }
    e.preventDefault();
  });

  $('#carousel div section').click(function() {
    console.log('hello');
    console.log($(this).parent());
    moveToSelected($(this).parent());
  });
}
