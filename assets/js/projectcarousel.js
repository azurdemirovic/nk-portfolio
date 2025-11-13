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
  // Lightbox navigation state
  let currentLightboxIndex = 1;
  let lightboxLength = 0;

  // Get carousel from lightbox (where the slides actually are)
  // Lightbox is a sibling of the container, not a child, so use direct selector
  carousel = $("#lightbox .carouselContainer");
  length = carousel[0] ? carousel[0].children.length : 0;

  // Track touch events to prevent double-firing with click
  let touchStartTime = 0;
  let touchTarget = null;
  let lightboxTouchStartTime = 0; // Separate tracking for lightbox navigation buttons

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

    // Get the current page container FIRST to ensure we're using the right project's lightbox
    const currentContainer = $(
      "div[data-barba='container'][data-barba-namespace='project']"
    );

    if (!currentContainer.length) {
      console.error("Project container not found");
      transitioning = false;
      unlockSite();
      enableScroll();
      return;
    }

    // Get index from the clicked grid item - ensure we're getting it from the current project's grid
    // Use the grid item that was actually clicked (this)
    var index = Number($(this).attr("data-index"));

    // Validate index - if missing or invalid, try to find it from the element
    if (!index || isNaN(index)) {
      // Try to get index from dataset or find position in grid
      index = $(this).data("index") || $(this).attr("data-index");
      if (!index || isNaN(index)) {
        // Fallback: find position in grid container within current project
        const gridContainer = currentContainer.find(".gridContainer");
        if (gridContainer.length) {
          index = gridContainer.find(".grid-item").index($(this)) + 1;
        } else {
          // Last resort: find in any grid container
          const anyGridContainer = $(this).closest(".gridContainer");
          if (anyGridContainer.length) {
            index = anyGridContainer.find(".grid-item").index($(this)) + 1;
          }
        }
      }
      index = Number(index);
    }

    // If still no valid index, log error and return
    if (!index || isNaN(index) || index < 1) {
      console.error(
        "Could not determine grid item index",
        this,
        "Current container:",
        currentContainer
      );
      transitioning = false;
      unlockSite();
      enableScroll();
      return;
    }

    // Lightbox is a sibling of the container, not a child, so use direct selector
    // But ensure we're using the lightbox from the current project page
    const lightbox = currentContainer.siblings("#lightbox").first();

    // Fallback: if lightbox not found as sibling, try direct selector
    const lightboxFallback = $("#lightbox");
    const finalLightbox = lightbox.length ? lightbox : lightboxFallback;

    // Verify lightbox exists
    if (!finalLightbox.length) {
      console.error("Lightbox not found for current project");
      transitioning = false;
      unlockSite();
      enableScroll();
      return;
    }

    // Get the lightbox carousel to determine length
    carousel = finalLightbox.find(".carouselContainer");
    length = carousel[0] ? carousel[0].children.length : 0;

    // Get project color and set lightbox background to darker shade
    const projectColor = currentContainer.attr("data-project-color");
    if (projectColor) {
      // Use darker shade for lightbox - 30% for Desiderata, 20% for others
      const darkenAmount = projectColor === "#d5d7d9" ? 0.35 : 0.2;
      // For Desiderata, use the already-darkened base color (#b8babc) and darken it further
      const baseColor = projectColor === "#d5d7d9" ? "#b8babc" : projectColor;
      const darkerColor = darkenColor(baseColor, darkenAmount);
      finalLightbox.css("background-color", darkerColor);
    }

    // load only the clicked picture element
    // index uses 1-based numbering
    const targetSlide = finalLightbox.find("#slide-" + index)[0];
    if (!targetSlide) {
      console.error("Slide not found:", index, "in lightbox");
      transitioning = false;
      unlockSite();
      enableScroll();
      return;
    }
    loadPictureEl(targetSlide);

    // hide all slides except the clicked slide
    finalLightbox.find(".slide").css("display", "none");
    finalLightbox.find("#slide-" + index).css("display", "");

    finalLightbox.find(".slide").css("z-index", 1);
    finalLightbox.find("#slide-" + index).css("z-index", 2);
    finalLightbox.find(".slidenum").html(pad(index) + "/" + pad(length));

    // Update current index for navigation - always reset to the opened image
    // This ensures navigation works correctly even when switching between projects
    currentLightboxIndex = index;
    lightboxLength = length;
    
    // Validate that the index exists in the current lightbox
    const currentLightbox = finalLightbox;
    const currentCarousel = currentLightbox.find(".carouselContainer");
    const actualLength = currentCarousel[0] ? currentCarousel[0].children.length : 0;
    if (actualLength > 0 && actualLength !== length) {
      // Lightbox length changed (different project), reset index if needed
      lightboxLength = actualLength;
      if (currentLightboxIndex > actualLength) {
        currentLightboxIndex = actualLength;
      }
    }

    finalLightbox.css({
      visibility: "visible",
      transition: "clip-path 1050ms linear",
    });

    // Add "open" class immediately so mobile styles apply during transition
    finalLightbox.addClass("open");

    // clip in from right
    finalLightbox.css({
      "clip-path": "inset(0% 0% 0% 0%)",
    });

    // prep for close + clear inline styles
    setTimeout(() => {
      const lightbox = finalLightbox;
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

      // Make the slide clickable to exit on desktop only (not mobile)
      // Check if device is mobile by checking touch capability and screen width
      const isMobile = window.innerWidth <= 800 || "ontouchstart" in window;
      if (!isMobile) {
        lightbox.find(".slide").off("click").on("click", exitLightbox);
      }
    }, 1050);

    // bind events
    $(document).keyup(exitLightboxOnEsc);
  }

  // Bind both click and touch events for better cross-device compatibility
  // Use event delegation scoped to project namespace to ensure correct project's grid items
  // Remove any existing handlers first to prevent duplicates after page transitions
  $(document)
    .off("click touchstart", "div[data-barba-namespace='project'] .grid-item")
    .on(
      "touchstart",
      "div[data-barba-namespace='project'] .grid-item",
      function (e) {
        e.stopPropagation();
        touchStartTime = Date.now();
        touchTarget = this;
        openLightboxHandler.call(this, e);
      }
    )
    .on(
      "click",
      "div[data-barba-namespace='project'] .grid-item",
      function (e) {
        // Only handle click if it wasn't from a touch
        if (touchStartTime === 0 || Date.now() - touchStartTime > 500) {
          openLightboxHandler.call(this, e);
        }
        touchStartTime = 0;
        touchTarget = null;
      }
    );

  // Also bind directly to existing elements as a fallback
  // This ensures immediate binding if elements already exist
  // Scope to current project container to avoid conflicts between projects
  const currentProjectContainer = $(
    "div[data-barba='container'][data-barba-namespace='project']"
  );
  if (currentProjectContainer.length) {
    const gridItems = currentProjectContainer.find(".grid-item");
    if (gridItems.length > 0) {
      gridItems
        .off("click touchstart")
        .on("touchstart", function (e) {
          e.stopPropagation();
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
  }

  function exitLightboxOnEsc(e) {
    if (e.key === "Escape") {
      exitLightbox();
    }
  }

  // close LB - exit button is in lightbox, which is a sibling of container
  // Use event delegation on document to ensure it works after page transitions
  $(document)
    .off("click", "#exit")
    .on("click", "#exit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      exitLightbox();
    });

  // Also bind directly to the exit button if it exists
  $("#exit")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      exitLightbox();
    });

  // Lightbox navigation function
  function navigateLightbox(direction) {
    if (transitioning) return;

    // Get the current project's lightbox to ensure we're using the correct one
    const currentContainer = $(
      "div[data-barba='container'][data-barba-namespace='project']"
    );
    if (!currentContainer.length) return;

    const lightbox = currentContainer.siblings("#lightbox").first();
    const lightboxFallback = $("#lightbox");
    const finalLightbox = lightbox.length ? lightbox : lightboxFallback;
    
    if (!finalLightbox.hasClass("open")) return;

    const carousel = finalLightbox.find(".carouselContainer");
    if (!carousel[0]) return;

    // Always recalculate length from current lightbox to ensure accuracy
    const actualLength = carousel[0].children.length;
    if (actualLength === 0) return;

    // Update lightboxLength to match current project
    lightboxLength = actualLength;
    
    // Validate currentLightboxIndex is within bounds
    if (currentLightboxIndex < 1 || currentLightboxIndex > lightboxLength) {
      currentLightboxIndex = 1;
    }

    // Calculate new index
    if (direction === "next") {
      currentLightboxIndex = (currentLightboxIndex % lightboxLength) + 1;
    } else {
      currentLightboxIndex = currentLightboxIndex - 1;
      if (currentLightboxIndex < 1) {
        currentLightboxIndex = lightboxLength;
      }
    }

    // Get target slide from the current lightbox
    const targetSlide = finalLightbox.find("#slide-" + currentLightboxIndex)[0];
    if (!targetSlide) {
      // If slide not found, reset to first slide
      currentLightboxIndex = 1;
      const firstSlide = finalLightbox.find("#slide-1")[0];
      if (!firstSlide) return;
      loadPictureEl(firstSlide);
      finalLightbox.find(".slide").css("display", "none");
      $(firstSlide).css("display", "");
      finalLightbox.find(".slide").css("z-index", 1);
      $(firstSlide).css("z-index", 2);
      finalLightbox.find(".slidenum").html(pad(1) + "/" + pad(lightboxLength));
      return;
    }

    // Load the image if needed
    loadPictureEl(targetSlide);

    // Hide all slides
    finalLightbox.find(".slide").css("display", "none");
    // Show target slide
    $(targetSlide).css("display", "");

    // Update z-index
    finalLightbox.find(".slide").css("z-index", 1);
    $(targetSlide).css("z-index", 2);

    // Update slide counter
    finalLightbox
      .find(".slidenum")
      .html(pad(currentLightboxIndex) + "/" + pad(lightboxLength));
  }

  // Bind left/right button navigation in lightbox - support both click and touch
  // Prevent double-firing: touchstart triggers click, so ignore click if touchstart was recent
  $(document)
    .off("click touchstart", "#lightbox .leftButton")
    .on("touchstart", "#lightbox .leftButton", function (e) {
      e.preventDefault();
      e.stopPropagation();
      lightboxTouchStartTime = Date.now();
      navigateLightbox("prev");
    })
    .on("click", "#lightbox .leftButton", function (e) {
      // Only handle click if it wasn't from a touch
      if (lightboxTouchStartTime === 0 || Date.now() - lightboxTouchStartTime > 500) {
        e.preventDefault();
        e.stopPropagation();
        navigateLightbox("prev");
      }
      lightboxTouchStartTime = 0;
    });

  $(document)
    .off("click touchstart", "#lightbox .rightButton")
    .on("touchstart", "#lightbox .rightButton", function (e) {
      e.preventDefault();
      e.stopPropagation();
      lightboxTouchStartTime = Date.now();
      navigateLightbox("next");
    })
    .on("click", "#lightbox .rightButton", function (e) {
      // Only handle click if it wasn't from a touch
      if (lightboxTouchStartTime === 0 || Date.now() - lightboxTouchStartTime > 500) {
        e.preventDefault();
        e.stopPropagation();
        navigateLightbox("next");
      }
      lightboxTouchStartTime = 0;
    });

  function exitLightbox() {
    if (transitioning) {
      return;
    } else {
      transitioning = true;
      lockSite();
    }

    // Lightbox is a sibling of the container, not a child, so use direct selector
    const lightbox = $("#lightbox");

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
          // Load from lightbox carousel - lightbox is a sibling, not a child
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
