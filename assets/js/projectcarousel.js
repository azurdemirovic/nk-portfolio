// Function to darken a hex color
function darkenColor(hex, amount) {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Darken each component
  const newR = Math.max(0, Math.floor(r * (1 - amount)));
  const newG = Math.max(0, Math.floor(g * (1 - amount)));
  const newB = Math.max(0, Math.floor(b * (1 - amount)));

  // Convert back to hex
  return (
    "#" +
    ("0" + newR.toString(16)).substr(-2) +
    ("0" + newG.toString(16)).substr(-2) +
    ("0" + newB.toString(16)).substr(-2)
  );
}

function initProjectCarousel() {
  let transitioning = false;
  let carousel;
  let length;

  // Get carousel from lightbox in the current page container (where the slides actually are)
  // Scope to current Barba container to avoid finding lightbox from other pages
  const currentContainer = $(
    "div[data-barba='container'][data-barba-namespace='project']"
  );
  carousel = currentContainer.find("#lightbox .carouselContainer");
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

    // Get the current page container to scope lightbox selection
    const currentContainer = $(
      "div[data-barba='container'][data-barba-namespace='project']"
    );
    const lightbox = currentContainer.find("#lightbox");

    // Get the lightbox carousel to determine length
    carousel = lightbox.find(".carouselContainer");
    length = carousel[0] ? carousel[0].children.length : 0;

    // Get project color and set lightbox background to darker shade
    const projectColor = currentContainer.attr("data-project-color");
    if (projectColor) {
      // Use darker shade for lightbox - 30% for Desiderata, 20% for others
      const darkenAmount = projectColor === "#d5d7d9" ? 0.35 : 0.2;
      // For Desiderata, use the already-darkened base color (#b8babc) and darken it further
      const baseColor = projectColor === "#d5d7d9" ? "#b8babc" : projectColor;
      const darkerColor = darkenColor(baseColor, darkenAmount);
      lightbox.css("background-color", darkerColor);
    }

    // load only the clicked picture element
    // index uses 1-based numbering
    const targetSlide = lightbox.find("#slide-" + index)[0];
    if (!targetSlide) {
      console.error("Slide not found:", index, "in lightbox");
      transitioning = false;
      unlockSite();
      enableScroll();
      return;
    }
    loadPictureEl(targetSlide);

    // hide all slides except the clicked slide
    lightbox.find(".slide").css("display", "none");
    lightbox.find("#slide-" + index).css("display", "");

    lightbox.find(".slide").css("z-index", 1);
    lightbox.find("#slide-" + index).css("z-index", 2);
    lightbox.find(".slidenum").html(pad(index) + "/" + pad(length));

    lightbox.css({
      visibility: "visible",
      transition: "clip-path 1050ms linear",
    });

    // clip in from right
    lightbox.css({
      "clip-path": "inset(0% 0% 0% 0%)",
    });

    // prep for close + clear inline styles
    setTimeout(() => {
      const currentContainer = $(
        "div[data-barba='container'][data-barba-namespace='project']"
      );
      const lightbox = currentContainer.find("#lightbox");

      lightbox.addClass("open");
      lightbox.css({
        visibility: "",
        "clip-path": "",
      });

      // Remove inline aspect-ratio style from picture elements to prevent clipping
      lightbox.find(".slide picture.slide-content").each(function () {
        $(this).css("aspect-ratio", "unset");
      });

      unlockSite();
      transitioning = false;

      // Make the slide and image clickable to exit (bind after lightbox is open)
      lightbox.find(".slide").off("click").on("click", exitLightbox);
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

  // close LB - scope to current page container
  const currentContainer = $(
    "div[data-barba='container'][data-barba-namespace='project']"
  );
  currentContainer.find("#exit").off("click").on("click", exitLightbox);

  function exitLightbox() {
    if (transitioning) {
      return;
    } else {
      transitioning = true;
      lockSite();
    }

    // Get the current page container to scope lightbox selection
    const currentContainer = $(
      "div[data-barba='container'][data-barba-namespace='project']"
    );
    const lightbox = currentContainer.find("#lightbox");

    lightbox.css({
      "clip-path": "inset(0% 100% 0% 0%)",
    });

    setTimeout(() => {
      lightbox.css({
        visibility: "hidden",
        "clip-path": "",
        transition: "",
      });

      lightbox.removeClass("open");
      $("body").css("overflow", "auto");

      // Reset lightbox background color when closing
      lightbox.css("background-color", "");

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
          // Load from lightbox carousel in current page container
          const currentContainer = $(
            "div[data-barba='container'][data-barba-namespace='project']"
          );
          const lightboxCarousel = currentContainer.find(
            "#lightbox .carouselContainer"
          );
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
