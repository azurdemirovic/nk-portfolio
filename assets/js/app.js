/**
 * Font
 * Using system font (Helvetica), so no need to wait for font loading
 */
let fontLoaded = true;

// System fonts are immediately available, so start marquees if they exist
if (document.querySelector("#mqr")) {
  startMarquee("#mqr");
}
// Lightbox marquee removed - no longer needed
// if (document.querySelector("#lb-mqr")) {
//   startMarquee("#lb-mqr");
// }

/**
 * Screensaver
 */
// initScreensaver(); // Disabled - uncomment to re-enable screensaver

/**
 * Barba
 */
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

let targetProjY = null;
let isInitialPageLoad = true;
let hasNavigatedAway = false;

// Check if loader has been shown in this session
function hasLoaderBeenShown() {
  return sessionStorage.getItem("loaderShown") === "true";
}

function markLoaderAsShown() {
  sessionStorage.setItem("loaderShown", "true");
}

// Hide loader immediately on page load if it's already been shown
$(document).ready(function () {
  if (hasLoaderBeenShown()) {
    $(".loader").css({
      visibility: "hidden",
      display: "none",
      "z-index": "-1",
      "clip-path": "inset(0% 100% 0% 0%)",
      "background-color": "transparent",
    });
  }

  // Watch for new loader elements being added to DOM (during Barba transitions)
  // and immediately hide them if loader has already been shown
  const observer = new MutationObserver(function (mutations) {
    if (hasLoaderBeenShown()) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // Element node
            // Check if the added node is a loader
            if (node.classList && node.classList.contains("loader")) {
              node.style.cssText =
                "background-color: transparent !important; visibility: hidden !important; display: none !important; z-index: -1 !important;";
            }
            // Check if the added node contains a loader
            const loader = node.querySelector && node.querySelector(".loader");
            if (loader) {
              loader.style.cssText =
                "background-color: transparent !important; visibility: hidden !important; display: none !important; z-index: -1 !important;";
            }
          }
        });
      });
    }
  });

  // Start observing the document body for added nodes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

$(document).ready(function () {
  barba.init({
    timeout: 20000,
    /**
     * Hooks to initialize els and to bind events
     */
    views: [
      {
        namespace: "homepage",
        beforeEnter(data) {
          // Only show loader on initial page load, not when navigating back
          // Check if we're coming from a project page (browser back or Barba navigation)
          const comingFromProject =
            data.current && data.current.namespace === "project";
          const loaderAlreadyShown = hasLoaderBeenShown();
          const isFirstLoad =
            !loaderAlreadyShown &&
            isInitialPageLoad &&
            !hasNavigatedAway &&
            !comingFromProject;

          if (isFirstLoad) {
            initLoader();
            markLoaderAsShown();
            isInitialPageLoad = false;
          } else {
            // If navigating back (via browser or Barba), ensure loader is hidden and homepage is visible
            // Hide loader in the new container that was just loaded - do this FIRST
            const loaderInNewContainer =
              data.next.container.querySelector(".loader");
            if (loaderInNewContainer) {
              loaderInNewContainer.style.cssText =
                "visibility: hidden !important; display: none !important; z-index: -1 !important; clip-path: inset(0% 100% 0% 0%) !important; position: fixed !important; background-color: transparent !important;";
            }
            // Also hide any existing loader
            $(".loader").css({
              visibility: "hidden",
              display: "none",
              "z-index": "-1",
              "clip-path": "inset(0% 100% 0% 0%)",
              "background-color": "transparent",
            });
            $("#homepage").css("visibility", "visible");
            // Restore body scrolling on homepage
            $("body").css({
              overflow: "",
              position: "",
              width: "",
            });
          }
          initInfoButton();
          initHomeCarousels();
          startMarquee("div[data-barba-namespace='homepage'] #mqr");

          // set document title
          // prettier-ignore
          setTimeout(() => {
            titleScroller("You are viewing Nadja Kurtalic's virtual space. ");

            if (!titleScrolledForFirstTime) {
              titleScrolledForFirstTime = true
            }
          }, titleScrolledForFirstTime ? 0 : 5000);
        },
        afterEnter(data) {
          initBTTButton(data.next.container);
          initBottomNav();
        },
        beforeLeave() {
          resetBottomNav();
          resetBTTButton();
        },
      },
      {
        namespace: "project",
        beforeEnter(data) {
          // Mark that we've navigated away from homepage
          hasNavigatedAway = true;
          // Hide loader and homepage when entering project page
          // Ensure loader is completely hidden with transparent background
          $(".loader").css({
            visibility: "hidden",
            display: "none",
            "z-index": "-1",
            "background-color": "transparent",
            opacity: "0",
            "clip-path": "inset(0% 100% 0% 0%)",
            position: "fixed",
          });
          $("#homepage").css("visibility", "hidden");

          // Prevent body scrolling on project pages to fix Safari URL bar issue
          // CSS handles height with proper fallbacks, we just need to prevent overflow
          // Use 100dvh to account for Safari URL bar
          const viewportHeight = window.innerHeight;
          $("body").css({
            overflow: "hidden",
            position: "fixed",
            width: "100%",
            height: viewportHeight + "px",
            top: "0",
            left: "0",
          });

          // Ensure project container content is visible
          if (data.next.container) {
            data.next.container.style.visibility = "visible";
            data.next.container.style.display = "block";
            const tintedBg = data.next.container.querySelector(".tinted-bg");
            if (tintedBg) {
              tintedBg.style.visibility = "visible";
              tintedBg.style.display = "block";
            }
          }

          startMarquee("div[data-barba-namespace='project'] #mqr");
          // Lightbox marquee removed - no longer needed
          // startMarquee("div[data-barba-namespace='project'] #lb-mqr");

          // set document title
          let projectTitle = data.next.container.dataset.projectTitle;

          // prettier-ignore
          setTimeout(() => {
            titleScroller(`You are viewing ${projectTitle} in Nadja Kurtalic's virtual space. `);

            if (!titleScrolledForFirstTime) {
              titleScrolledForFirstTime = true
            }
          }, titleScrolledForFirstTime ? 0 : 5000);
        },
        afterEnter(data) {
          // Final check: ensure loader is completely hidden and content is visible
          $(".loader").css({
            visibility: "hidden",
            display: "none",
            "z-index": "-1",
            "background-color": "transparent",
            opacity: "0",
            "clip-path": "inset(0% 100% 0% 0%)",
            position: "fixed",
          });

          // Ensure project container and content are visible
          if (data.next.container) {
            data.next.container.style.visibility = "visible";
            data.next.container.style.display = "block";
            const tintedBg = data.next.container.querySelector(".tinted-bg");
            if (tintedBg) {
              tintedBg.style.visibility = "visible";
              tintedBg.style.display = "block";
            }
          }

          initProjectCarousel();
          initBTTButton(data.next.container);
        },
        beforeLeave(data) {
          resetBTTButton();
        },
      },
    ],
    transitions: [
      {
        name: "default-transition",
        sync: false,
        /**
         * Hooks for transition logic
         *
         * Clip the *exiting* container.
         *
         * Current container is positioned relative to viewport.
         * Next container position is unchanged, scroll into position.
         */
        beforeEnter(data) {
          // save the scroll position (Y) of current container, wherever it's at, before we
          // start positining containers
          const currentYPos =
            -1 *
              (document.documentElement.scrollTop || document.body.scrollTop) +
            "px";
          data.current.container.style.top = currentYPos;

          // Hide loader if navigating to project page
          if (data.next.namespace === "project") {
            $(".loader").css({
              visibility: "hidden",
              display: "none",
              "z-index": "-1",
              "background-color": "transparent",
            });
            $("#homepage").css("visibility", "hidden");
            // Ensure exiting homepage container will be hidden
            if (data.current.namespace === "homepage") {
              data.current.container.style.zIndex = "1";
            }
          }

          // Hide loader during ALL transitions to prevent background flash
          // This ensures no loader background is visible during page transitions
          // Only hide if loader has already been shown (not on first visit)
          if (hasLoaderBeenShown()) {
            const allLoaders = document.querySelectorAll(".loader");
            allLoaders.forEach((loader) => {
              loader.style.setProperty(
                "background-color",
                "transparent",
                "important"
              );
              loader.style.setProperty("opacity", "0", "important");
              loader.style.setProperty("visibility", "hidden", "important");
              loader.style.setProperty("z-index", "-1", "important");
            });
          }

          // Hide loader in new container BEFORE making it visible (critical for browser back button)
          if (data.next.namespace === "homepage") {
            const comingFromProject =
              data.current && data.current.namespace === "project";
            const loaderAlreadyShown = hasLoaderBeenShown();
            if (loaderAlreadyShown || comingFromProject || hasNavigatedAway) {
              const nextLoader = data.next.container.querySelector(".loader");
              if (nextLoader) {
                // Hide immediately with inline styles before container becomes visible
                nextLoader.style.setProperty(
                  "visibility",
                  "hidden",
                  "important"
                );
                nextLoader.style.setProperty("display", "none", "important");
                nextLoader.style.setProperty("z-index", "-1", "important");
                nextLoader.style.setProperty(
                  "clip-path",
                  "inset(0% 100% 0% 0%)",
                  "important"
                );
                nextLoader.style.setProperty("position", "fixed", "important");
                nextLoader.style.setProperty(
                  "background-color",
                  "transparent",
                  "important"
                );
              }
            }
          }

          // layer containers over each other
          document.body.classList.add("transitioning");
          data.current.container.classList.add("exiting");
          data.next.container.classList.add("entering");
          // Ensure entering container is visible
          data.next.container.style.visibility = "visible";
          data.next.container.style.display = "block";
          data.next.container.style.zIndex = "11";

          // for navigations (push *or* pop state) into homepage,
          // align target project to the top of the viewport
          if (data.next.namespace === "homepage") {
            // Hide loader when navigating back to homepage (not initial load)
            // The loader will be shown in the view's beforeEnter hook only on initial load
            // Check if coming from project page (works for both browser back and Barba navigation)
            const comingFromProject =
              data.current && data.current.namespace === "project";
            const loaderAlreadyShown = hasLoaderBeenShown();
            if (loaderAlreadyShown || comingFromProject || hasNavigatedAway) {
              // Hide loader in the new container immediately - CRITICAL: do this as early as possible
              const nextLoader = data.next.container.querySelector(".loader");
              if (nextLoader) {
                nextLoader.style.cssText =
                  "visibility: hidden !important; display: none !important; z-index: -1 !important; clip-path: inset(0% 100% 0% 0%) !important; position: fixed !important; background-color: transparent !important;";
              }
            }
            const targetProjHref = data.current.url.href;
            const prevProjectEl = data.next.container.querySelector(
              `a[href="${targetProjHref}"]`
            );

            if (prevProjectEl) {
              const targetEl = prevProjectEl.parentElement;

              targetProjY =
                targetEl.getBoundingClientRect().top +
                document.documentElement.scrollTop -
                14 +
                0.3; // 14px top margin, 0.3 prevents 1px jitter
            } else {
              // scroll to top in the event we're coming from an unlisted page
              targetProjY = 0;
            }

            document.documentElement.scrollTop = document.body.scrollTop =
              targetProjY;
          }
          // for vanilla navs, just go to the top of the next page
          else {
            document.documentElement.scrollTop = document.body.scrollTop = 0;
          }

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 100);
          });
        },
        enter(data) {
          lockSite();

          // Ensure loader is hidden when navigating back to homepage
          const comingFromProject =
            data.current && data.current.namespace === "project";
          const loaderAlreadyShown = hasLoaderBeenShown();
          if (
            data.next.namespace === "homepage" &&
            (loaderAlreadyShown || comingFromProject || hasNavigatedAway)
          ) {
            const nextLoader = data.next.container.querySelector(".loader");
            if (nextLoader) {
              nextLoader.style.cssText =
                "visibility: hidden !important; display: none !important; z-index: -1 !important; clip-path: inset(0% 100% 0% 0%) !important; position: fixed !important; background-color: transparent !important;";
            }
          }

          setTimeout(() => {
            // clip exiting container
            data.current.container.style.clipPath = "inset(0% 100% 0% 0%)";
          }, 100); // slight delay for perf

          return new Promise((resolve) => {
            setTimeout(() => {
              setTimeout(() => {
                // unset transition styles
                document.body.classList.remove("transitioning");
                data.current.container.classList.remove("exiting");
                data.next.container.classList.remove("entering");
                $("div[data-barba='container']").css("pointer-events", "");

                resolve();
              }, 100); // slight delay for perf
            }, 1150); // transition is 1050ms
          });
        },
        after(data) {
          unlockSite();
          // Final check: ensure loader is hidden when on homepage (unless it's the initial load)
          if (data.next.namespace === "homepage") {
            const comingFromProject =
              data.current && data.current.namespace === "project";
            const loaderAlreadyShown = hasLoaderBeenShown();
            if (loaderAlreadyShown || comingFromProject || hasNavigatedAway) {
              $(".loader").css({
                visibility: "hidden",
                display: "none",
                "z-index": "-1",
                "clip-path": "inset(0% 100% 0% 0%)",
                "background-color": "transparent",
              });
            }
          }
          document.documentElement.scrollTop = document.body.scrollTop =
            data.next.namespace === "homepage" ? targetProjY : 0;
        },
      },
    ],
  });
});

/**
 * Globals
 */
let titleScrollerId;

// This value delays the initial call to titleScroller() as a workaround for weird
// auto-generated site titles when the browser saves the site title for "Recently Visited"
// or "Favorites" browser sections
let titleScrolledForFirstTime = false;

function titleScroller(text) {
  if (titleScrollerId) {
    clearInterval(titleScrollerId);
  }

  document.title = text;

  titleScrollerId = setTimeout(function () {
    titleScroller(text.substr(1) + text.substr(0, 1));
  }, 500);
}

function lockSite() {
  $("html").css("overflow", "hidden");
  document.body.classList.add("pointer-events-none");
}

function unlockSite() {
  $("html").css("overflow", "auto");
  document.body.classList.remove("pointer-events-none");
}

function enableScroll() {
  $("html").css("overflow", "auto");
}

function disableScroll() {
  $("html").css("overflow", "hidden");
}

/**
 * Utils
 */
function pad(num) {
  return num.toString().padStart(2, "0");
}

// Given an index, any positive or negative number, returns a number
// mapped into the range from 1 to length.
//
// For use in 1-based number contexts.
function getWrappedIndex(index, length) {
  if (index <= 1) {
    return index + length;
  } else if (index > length) {
    return index - length;
  } else {
    return index;
  }
}

// Given a DOM node, search for a picture element and convert its data-srcset and
// data-src attributes to srcset and src attributes
function loadPictureEl(pictureEl) {
  if (!pictureEl || !pictureEl.children) return;

  // see if we can find a picture child
  if (pictureEl.nodeName !== "PICTURE") {
    pictureEl = pictureEl.querySelector("picture");

    // picture not found
    if (!pictureEl) return;
  }

  const children = pictureEl.children;

  for (let i = 0; i < children.length; i++) {
    let child = children[i];

    if (child.dataset.srcset) {
      child.setAttribute("srcset", child.dataset.srcset);
      delete child.dataset.srcset;
    }

    if (child.dataset.src) {
      child.setAttribute("src", child.dataset.src);
      delete child.dataset.src;
    }
  }
}
