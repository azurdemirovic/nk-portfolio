function initProjectCarousel() {
  let transitioning = false;
  let carousel;
  let length;

  // Get carousel from lightbox (where the slides actually are)
  carousel = $("#lightbox .carouselContainer");
  length = carousel[0] ? carousel[0].children.length : 0;

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

    // Get the lightbox carousel to determine length
    carousel = $("#lightbox .carouselContainer");
    length = carousel[0] ? carousel[0].children.length : 0;

    // load only the clicked picture element
    // index uses 1-based numbering
    loadPictureEl($("#lightbox #slide-" + index)[0]);

    // hide all slides except the clicked slide
    $("#lightbox .slide").css("display", "none");
    $("#lightbox #slide-" + index).css("display", "");

    $("#lightbox .slide").css("z-index", 1);
    $("#lightbox #slide-" + index).css("z-index", 2);
    $("#lightbox .slidenum").html(pad(index) + "/" + pad(length));

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

      // Remove inline aspect-ratio style from picture elements to prevent clipping
      $("#lightbox .slide picture.slide-content").each(function () {
        $(this).css("aspect-ratio", "unset");
      });

      unlockSite();
      transitioning = false;

      // Make the slide and image clickable to exit (bind after lightbox is open)
      $("#lightbox .slide").off("click").on("click", exitLightbox);
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
          // Load from lightbox carousel
          const lightboxCarousel = $("#lightbox .carouselContainer");
          if (lightboxCarousel[0] && lightboxCarousel[0].children[index - 1]) {
            loadPictureEl(lightboxCarousel[0].children[index - 1]);
          }
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
