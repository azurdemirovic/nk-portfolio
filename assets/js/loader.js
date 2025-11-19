function initLoader() {
  if ($(".loader").length) {
    disableScroll();
  } else {
    enableScroll();
    return;
  }

  var loadedBool = false;

  $("#homepage").css("visibility", "visible");

  // Preload project images
  preloadProjectImages();

  /**
   * Bind click handler
   */
  $(".loader").click(function () {
    if (loadedBool) {
      $("body").css("pointer-events", "none");
      $(".loader").css("clip-path", "inset(0% 100% 0% 0%)");

      setTimeout(() => {
        enableScroll();
        $("body").css("pointer-events", "");
        $(".loader").remove();
      }, 2000);
    }
  });

  /**
   * Preload only first visible images from each carousel (optimized for performance)
   */
  function preloadProjectImages() {
    var imagesToLoad = new Set();

    // Only preload the first visible slide from each carousel (not all images)
    $(".carouselContainer").each(function () {
      var $carousel = $(this);
      // Get only the first slide (index 0) - the one that's initially visible
      var $firstSlide = $carousel.find(".slide").first();
      if ($firstSlide.length) {
        var $picture = $firstSlide.find("picture");
        if ($picture.length) {
          // Check for data-src (lazy loaded)
          var $img = $picture.find("img[data-src]");
          if ($img.length) {
            var src = $img.attr("data-src");
            if (src) imagesToLoad.add(src);
          }

          // Check for regular src (if not lazy loaded yet)
          var $imgSrc = $picture.find("img[src]:not([data-src])");
          if ($imgSrc.length) {
            var src = $imgSrc.attr("src");
            if (src) imagesToLoad.add(src);
          }

          // Check for data-srcset (lazy loaded)
          var $imgDataSrcset = $picture.find("img[data-srcset]");
          if ($imgDataSrcset.length) {
            var srcset = $imgDataSrcset.attr("data-srcset");
            if (srcset) {
              // Get the first/largest image from srcset
              var urls = srcset.match(/(https?:\/\/[^\s,]+)/g);
              if (urls && urls.length > 0) {
                imagesToLoad.add(urls[urls.length - 1]);
              }
            }
          }

          // Check source elements with data-srcset (prefer webp)
          var $source = $picture.find("source[data-srcset]");
          if ($source.length) {
            var srcset = $source.attr("data-srcset");
            if (srcset) {
              var urls = srcset.match(/(https?:\/\/[^\s,]+)/g);
              if (urls && urls.length > 0) {
                imagesToLoad.add(urls[urls.length - 1]);
              }
            }
          }
        }
      }
    });

    var imagesArray = Array.from(imagesToLoad);

    if (imagesArray.length === 0) {
      // No images to load, mark as loaded after a short delay
      setTimeout(loaded, 500);
      return;
    }

    var loadedCount = 0;
    var totalImages = imagesArray.length;
    var errors = 0;

    // Load each image
    imagesArray.forEach(function (src) {
      var img = new Image();
      img.onload = function () {
        loadedCount++;
        checkComplete();
      };
      img.onerror = function () {
        loadedCount++;
        errors++;
        // Continue even if some images fail
        checkComplete();
      };
      img.src = src;
    });

    function checkComplete() {
      if (loadedCount === totalImages) {
        loaded();
      }
    }

    // Fallback timeout (8 seconds max wait)
    setTimeout(function () {
      if (!loadedBool) {
        loaded();
      }
    }, 8000);
  }

  /**
   * Mark loader as loaded
   */
  function loaded() {
    if (loadedBool) return;
    loadedBool = true;
    $(".loader").css("cursor", "pointer");
  }
}
