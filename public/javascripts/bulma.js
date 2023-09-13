// Src: https://bulma.io/lib/main.js?v=202308181643
// From: Bulma Navbar > get source ...shows the file above, which contains getAll & hamburger functionality
(function () {
  function getAll(selector) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    return Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
  }

  var $burgers = getAll(".navbar-burger");

  if ($burgers.length > 0) {
    $burgers.forEach(function ($el) {
      if (!$el.dataset.target) {
        return;
      }

      $el.addEventListener("click", function () {
        var target = $el.dataset.target;
        var $target = document.getElementById(target);
        $el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }

})();