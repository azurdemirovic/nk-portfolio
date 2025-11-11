function initProjectCarousel() {
  let turning = false;
  let transitioning = false;
  let counter = 0;
  let carousel;
  let length;

  carousel = $(`div[data-barba-namespace="project"] .carouselContainer`);
  length = carousel[0].children.length;

  // right button
  $(`.rightButton`).click(function () {
    if (!turning && !transitioning) {
      turning = true;

      carousel = $(`.carouselContainer`);

      // load adjacent picture elements in the direction the
      // carousel is being advanced, counter uses 1-based numbering
      loadPictureEl(carousel[0].children[getWrappedIndex(counter + 1, length)]);
      loadPictureEl(carousel[0].children[getWrappedIndex(counter + 2, length)]);

      // outgoing el
      let prev = carousel[0].children[counter];
      prev.style.transition = "clip-path linear 1050ms";
      prev.style.clipPath = "inset(0% 100% 0% 0%)";
      prev.style.zIndex = "3";

      // set index
      counter++;
      if (counter >= length) {
        counter = 0;
      }

      // incoming el
      let curr = carousel[0].children[counter];
      curr.style.zIndex = "2";
      curr.style.display = "";

      // set slide number
      $(".slidenum").html(pad(counter + 1) + "/" + pad(length));

      // unset styles
      setTimeout(function () {
        turning = false;
        prev.style.zIndex = "1";
        prev.style.transition = "";
        prev.style.clipPath = "";
        curr.style.zIndex = "2";
      }, 1050);
    }
  });

  // left button
  $(`.leftButton`).click(function () {
    if (!turning && !transitioning) {
      turning = true;

      carousel = $(`.carouselContainer`);
      length = carousel[0].children.length;

      // load adjacent picture elements in the direction the
      // carousel is being advanced, counter uses 1-based numbering
      loadPictureEl(carousel[0].children[getWrappedIndex(counter - 1, length)]);
      loadPictureEl(carousel[0].children[getWrappedIndex(counter - 2, length)]);

      // outgoing el
      let prev = carousel[0].children[counter];
      prev.style.transition = "clip-path linear 1050ms";
      prev.style.clipPath = "inset(0% 0% 0% 100%)";
      prev.style.zIndex = "3";

      // set index
      counter--;
      if (counter < 0) {
        counter = length - 1;
      }

      // incoming el
      let curr = carousel[0].children[counter];
      curr.style.zIndex = "2";
      curr.style.display = "";

      // set slide number
      $(".slidenum").html(pad(counter + 1) + "/" + pad(length));

      // unset styles
      setTimeout(function () {
        turning = false;
        prev.style.zIndex = "1";
        prev.style.transition = "";
        prev.style.clipPath = "";
        curr.style.zIndex = "2";
      }, 1050);
    }
  });

  // open LB
  $(".grid-item").click(function () {
    if (transitioning) {
      return;
    } else {
      transitioning = true;
      lockSite();
      disableScroll();
    }

    var index = Number($(this).attr("data-index"));

    // load the clicked picture element and the 4 adjacent picture elements
    // index uses 1-based numbering
    loadPictureEl($("#slide-" + index)[0]);
    loadPictureEl($("#slide-" + getWrappedIndex(index + 1, length))[0]);
    loadPictureEl($("#slide-" + getWrappedIndex(index + 2, length))[0]);
    loadPictureEl($("#slide-" + getWrappedIndex(index - 1, length))[0]);
    loadPictureEl($("#slide-" + getWrappedIndex(index - 2, length))[0]);

    // hide all slides except the clicked slide to improve performance while the lb clips in
    $(".slide").css("display", "none");
    $("#slide-" + index).css("display", "");

    $(".slide").css("z-index", 1);
    $("#slide-" + index).css("z-index", 2);
    counter = index - 1;
    $(".slidenum").html(pad(counter + 1) + "/" + pad(length));

    $("#lightbox").css({
      visibility: "visible",
      transition: "clip-path 1050ms linear",
    });

    // clip in from right
    $("#lightbox").css({
      "clip-path": "inset(0% 0% 0% 0%)",
    });

    // prep for close + clear inline styles
    setTimeout(() => {
      $("#lightbox").addClass("open");
      $("#lightbox").css({
        visibility: "",
        "clip-path": "",
      });

      unlockSite();
      transitioning = false;
    }, 1050);

    // bind events
    $(document).keyup(exitLightboxOnEsc);
  });

  function exitLightboxOnEsc(e) {
    if (e.key === "Escape") {
      exitLightbox();
    }
  }

  // close LB
  $("#exit").click(exitLightbox);

  function exitLightbox() {
    if (transitioning) {
      return;
    } else {
      transitioning = true;
      lockSite();
    }

    $("#lightbox").css({
      "clip-path": "inset(0% 100% 0% 0%)",
    });

    setTimeout(() => {
      $("#lightbox").css({
        visibility: "hidden",
        "clip-path": "",
        transition: "",
      });

      $("#lightbox").removeClass("open");
      $("body").css("overflow", "auto");

      transitioning = false;
      unlockSite();
      enableScroll();
    }, 1050);

    // unbind esc key
    $(document).unbind("keyup", exitLightboxOnEsc);
  }

  // lazy load full lb images using intersection observer
  // to watch for thumbnails that enter the viewport
  const observer = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index;
          loadPictureEl(carousel[0].children[index]);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  const thumbs = $(".grid-item");

  for (let i = 0; i < thumbs.length; i++) {
    observer.observe(thumbs[i]);
  }
}
