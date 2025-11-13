function initProjectCarousel() {
  let transitioning = false;
  let carousel;
  let length;

  // Get carousel from lightbox (where the slides actually are)
  carousel = $("#lightbox .carouselContainer");
  length = carousel[0] ? carousel[0].children.length : 0;

  // Track touch events to prevent double-firing with click
  let touchStartTime = 0;
  let touchTarget = null;

  // open LB - support both click and touch events for better device compatibility
  function openLightboxHandler(e) {
    // For touch devices, only handle if it's a touchstart (not click that follows)
    if (
      e.type === "click" &&
      touchStartTime > 0 &&
      Date.now() - touchStartTime < 500
    ) {
      // This click was likely triggered by a touch, ignore it
      touchStartTime = 0;
      return;
    }

    // Only prevent default on touch events to avoid scrolling
    // Don't prevent default on click events as it can interfere with some browsers
    if (e.type === "touchstart") {
      e.preventDefault();
    }
    e.stopPropagation();

    if (transitioning) {
      return;
    } else {
      transitioning = true;
      lockSite();
      disableScroll();
    }

    var index = Number($(this).attr("data-index"));

    // Validate index - if missing or invalid, try to find it from the element
    if (!index || isNaN(index)) {
      // Try to get index from dataset or find position in grid
      index = $(this).data("index") || $(this).attr("data-index");
      if (!index || isNaN(index)) {
        // Fallback: find position in grid container
        const gridContainer = $(this).closest(".gridContainer");
        if (gridContainer.length) {
          index = gridContainer.find(".grid-item").index($(this)) + 1;
        }
      }
      index = Number(index);
    }

    // If still no valid index, log error and return
    if (!index || isNaN(index) || index < 1) {
      console.error("Could not determine grid item index", this);
      transitioning = false;
      unlockSite();
      enableScroll();
      return;
    }

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
  }

  // Bind both click and touch events for better cross-device compatibility
  // Use event delegation on document to ensure it works even if elements are added later
  // Remove any existing handlers first to prevent duplicates after page transitions
  $(document)
    .off("click touchstart", ".grid-item")
    .on("touchstart", ".grid-item", function (e) {
      touchStartTime = Date.now();
      touchTarget = this;
      openLightboxHandler.call(this, e);
    })
    .on("click", ".grid-item", function (e) {
      // Only handle click if it wasn't from a touch
      if (touchStartTime === 0 || Date.now() - touchStartTime > 500) {
        openLightboxHandler.call(this, e);
      }
      touchStartTime = 0;
      touchTarget = null;
    });

  // Also bind directly to existing elements as a fallback
  // This ensures immediate binding if elements already exist
  const gridItems = $(".grid-item");
  if (gridItems.length > 0) {
    gridItems
      .off("click touchstart")
      .on("touchstart", function (e) {
        touchStartTime = Date.now();
        touchTarget = this;
        openLightboxHandler.call(this, e);
      })
      .on("click", function (e) {
        // Only handle click if it wasn't from a touch
        if (touchStartTime === 0 || Date.now() - touchStartTime > 500) {
          openLightboxHandler.call(this, e);
        }
        touchStartTime = 0;
        touchTarget = null;
      });
  }

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
