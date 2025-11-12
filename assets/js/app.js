/**
 * Font
 * Using system font (Helvetica), so no need to wait for font loading
 */
let fontLoaded = true;

// System fonts are immediately available, so start marquees if they exist
if (document.querySelector("#mqr")) {
  startMarquee("#mqr");
}
if (document.querySelector("#lb-mqr")) {
  startMarquee("#lb-mqr");
}

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
          initLoader();
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
          // Hide loader and homepage when entering project page
          $(".loader").css({
            visibility: "hidden",
            display: "none",
            "z-index": "-1",
          });
          $("#homepage").css("visibility", "hidden");

          startMarquee("div[data-barba-namespace='project'] #mqr");
          startMarquee("div[data-barba-namespace='project'] #lb-mqr");

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
            });
            $("#homepage").css("visibility", "hidden");
            // Ensure exiting homepage container will be hidden
            if (data.current.namespace === "homepage") {
              data.current.container.style.zIndex = "1";
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
            initLoader();
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
