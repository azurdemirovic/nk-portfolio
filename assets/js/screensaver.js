const SS_WAIT_TIME = 60000;
const SS_TRANSITION_TIME = 2000;
const SS_THROTTLE_TIME = 300;
let ssVisible = false;
let ssAnimating = false;
let throttledInteractHandler = null;
let ssTimer = null;

function initScreensaver() {
  // Keep a reference to the timer so we can clear it on interaction
  ssTimer = setTimeout(enterSS, SS_WAIT_TIME);

  /**
   * `instant` param is used to skip the transition animation
   */
  function enterSS(instant = false) {
    console.log("entering screensaver, instant? ", instant);

    const ss = document.getElementById("screensaver");
    const ssEntering = ss.classList.length > 0;
    const loaderPresent = document.getElementsByClassName("loader")[0];

    // Only enter the screensaver if it's not visible
    if (ssVisible || ssEntering || loaderPresent) return;

    ssVisible = true;
    ssAnimating = true;
    removeInteractHandlers();

    if (instant) {
      ss.classList.add("instant");
      ssAnimating = false;
      attachSSInteractHandlers();
    } else {
      ss.classList.add("visible");
      lockSite();

      // Wait for the transition to finish entering
      setTimeout(() => {
        ssAnimating = false;
        attachSSInteractHandlers();
      }, SS_TRANSITION_TIME + 100);
    }
  }

  function exitSS() {
    const ss = document.getElementById("screensaver");
    const ssExiting = ss.classList.contains("visible") && ss.classList.contains("exiting");

    // Only exit the screensaver if it's visible
    if (!ssVisible || ssExiting) return;

    ssAnimating = true;
    ss.classList.add("exiting");
    removeSSInteractHandlers();
    lockSite();

    // Wait for the transition to finish before resetting state
    setTimeout(() => {
      ssVisible = false;
      ssAnimating = false;
      ss.classList.remove("exiting", "visible", "instant");
      unlockSite();
      attachInteractHandlers();

      // Init a new timer
      clearTimeout(ssTimer);
      ssTimer = setTimeout(enterSS, SS_WAIT_TIME);

      // Load the next screen saver image while the screensaver is hidden
      incrementSSImage();
    }, SS_TRANSITION_TIME + 100); // Slight delay the exit animation to settle before removing classes
  }

  function handleInteract() {
    if (ssVisible && !ssAnimating) {
      exitSS();
    } else {
      // Reset the timer on an interaction while in all other states
      clearTimeout(ssTimer);
      ssTimer = setTimeout(enterSS, SS_WAIT_TIME);
    }
  }

  throttledInteractHandler = throttle(handleInteract, SS_THROTTLE_TIME);

  /**
   * Attach event listeners
   */
  const attachInteractHandlers = () => {
    document.addEventListener("scroll", throttledInteractHandler);
    document.addEventListener("mousemove", throttledInteractHandler);
    document.addEventListener("click", throttledInteractHandler);
    document.addEventListener("touchstart", throttledInteractHandler);
  };

  const removeInteractHandlers = () => {
    document.removeEventListener("scroll", throttledInteractHandler);
    document.removeEventListener("mousemove", throttledInteractHandler);
    document.removeEventListener("click", throttledInteractHandler);
    document.removeEventListener("touchstart", throttledInteractHandler);
  };

  /**
   * SS-specific event listeners, to call exitSS *only* on click or touchstart
   */
  const exitSSAndAttachInteractHandlers = () => {
    exitSS();
    attachInteractHandlers();
  };

  const attachSSInteractHandlers = () => {
    document.addEventListener("click", exitSSAndAttachInteractHandlers);
    document.addEventListener("touchstart", exitSSAndAttachInteractHandlers);
  };

  const removeSSInteractHandlers = () => {
    document.removeEventListener("click", exitSSAndAttachInteractHandlers);
    document.removeEventListener("touchstart", exitSSAndAttachInteractHandlers);
  };

  document.addEventListener("visibilitychange", () => {
    clearTimeout(ssTimer);

    // Hiding tab
    if (document.hidden) {
      if (!ssVisible) {
        ssTimer = setTimeout(() => enterSS(true), SS_WAIT_TIME);
      }
    }
    // Refocusing tab
    else {
      if (!ssVisible) {
        ssTimer = setTimeout(enterSS, SS_WAIT_TIME);
      }
    }
  });

  attachInteractHandlers();
}

let currentSSImageIndex = 0;

function incrementSSImage() {
  const ss = document.getElementById("screensaver");
  const numImages = parseInt(ss.dataset.numImages);

  // hide the current image and caption
  ss.querySelectorAll(".ss-container")[currentSSImageIndex].classList.add("hidden");
  ss.querySelectorAll(".ss-caption")[currentSSImageIndex].classList.add("hidden");

  // advance the index
  currentSSImageIndex = (currentSSImageIndex + 1) % numImages;

  let el = ss.querySelectorAll(".ss-container")[currentSSImageIndex];

  const imageNotLoaded = !el.querySelector("source").srcset;
  if (imageNotLoaded) {
    el.querySelector("source").srcset = el.querySelector("source").dataset.srcset;
    el.querySelector("img").srcset = el.querySelector("img").dataset.srcset;
    el.querySelector("img").src = el.querySelector("img").dataset.src;
  }

  // show the new image and caption
  el.classList.remove("hidden");
  ss.querySelectorAll(".ss-caption")[currentSSImageIndex].classList.remove("hidden");
}

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last, deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date(),
      args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}
