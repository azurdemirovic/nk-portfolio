let bottomNav = document.getElementById("bottom-nav");
let numProjects = bottomNav ? bottomNav.dataset.numProjects : 0;
let currentPage = 0;
let isMobile = false;
let isTablet = false;
let isDesktop = true;
let pageLength = isMobile ? 3 : isTablet && !isDesktop ? 5 : 10;
let isScrollingToProject = false;

const setIsMobile = () => {
  const w = window.innerWidth;

  isMobile = w < 800;
  isTablet = w >= 800 && w < 1024;
  isDesktop = w >= 1024;

  // Set page length based on window width
  pageLength = isMobile ? 3 : isTablet && !isDesktop ? 5 : 10;

  // Clamp currentPage within valid range
  const maxPage = Math.floor(numProjects / pageLength);
  currentPage = Math.min(maxPage, Math.max(0, currentPage));
};

const resetBottomNavState = () => {
  bottomNav = document.getElementById("bottom-nav");
  numProjects = bottomNav ? bottomNav.dataset.numProjects : 0;
  currentPage = 0;
  setIsMobile();
};

const setButtonClickHandlers = () => {
  const buttons = Array.from(document.querySelectorAll("#bottom-nav ul li"));
  const projects = Array.from(document.querySelectorAll(".project"));

  buttons.map((button, i) => {
    button.addEventListener("click", () => {
      const targetProject = projects[i];
      const targetProjectY =
        targetProject.getBoundingClientRect().top + window.scrollY - 14; // 14px top margin
      isScrollingToProject = true;

      window.scrollTo({
        top: targetProjectY,
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrollingToProject = false;
      }, 1000);
    });
  });
};

const setVisibleNavButtons = () => {
  const prevButton = document.querySelector("#bottom-nav #prev");
  const nextButton = document.querySelector("#bottom-nav #next");

  if (!prevButton || !nextButton) return;

  // show/hide prev/next buttons
  prevButton.style.display = currentPage == 0 ? "none" : "block";
  nextButton.style.display =
    currentPage == Math.floor(numProjects / pageLength) ? "none" : "block";

  const buttons = Array.from(document.querySelectorAll("#bottom-nav ul li"));

  buttons.map((button, i) => {
    // only shows the buttons for the current page
    if (i >= currentPage * pageLength && i < (currentPage + 1) * pageLength) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
};

const incrementButtonPage = () => {
  currentPage++;
  setVisibleNavButtons();
};

const decrementButtonPage = () => {
  currentPage--;
  setVisibleNavButtons();
};

const handleBottomNavScroll = () => {
  const bottomNav = document.getElementById("project-buttons");

  if (!bottomNav) return;

  const TOP_THRESHOLD = 100;
  const BOTTOM_THRESHOLD =
    document.documentElement.scrollHeight - window.innerHeight - 80;
  const pastTopThreshold = window.scrollY > TOP_THRESHOLD;
  const pastBottomThreshold = window.scrollY > BOTTOM_THRESHOLD;

  if (pastTopThreshold && !pastBottomThreshold) {
    bottomNav.classList.add("visible");
  } else {
    bottomNav.classList.remove("visible");
  }
};

const initBottomNavScroll = () => {
  window.addEventListener("scroll", handleBottomNavScroll);
};

const uninitBottomNavScroll = () => {
  window.removeEventListener("scroll", handleBottomNavScroll);
};

/**
 * Attach resize event listener, only needs to be done once per session
 */
const throttledSetIsMobile = throttle(() => {
  setIsMobile();
  setVisibleNavButtons();
}, 800);

window.addEventListener("resize", throttledSetIsMobile);

setIsMobile();
setVisibleNavButtons();

/**
 * Initialization fn, called in app.js
 */
const initBottomNav = () => {
  document
    .querySelector("#bottom-nav #prev")
    .addEventListener("click", decrementButtonPage);
  document
    .querySelector("#bottom-nav #next")
    .addEventListener("click", incrementButtonPage);
  initBottomNavScroll();
  setButtonClickHandlers();
  setVisibleNavButtons();
};

const resetBottomNav = () => {
  uninitBottomNavScroll();
};

/**
 * Back to top button
 */
function initBTTButton(container) {
  const bttButton = container.querySelector("#btt-button");

  if (!bttButton) return;

  bttButton.addEventListener("click", handleBTTClick);
  window.addEventListener("scroll", handleBTTScroll);
}

function resetBTTButton() {
  const bttButton = document.querySelector("#btt-button");
  bttButton.removeEventListener("click", handleBTTClick);
  window.removeEventListener("scroll", handleBTTScroll);
}

function handleBTTClick() {
  document.documentElement.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function handleBTTScroll() {
  const bottomNav = document.getElementById("btt-button");

  if (!bottomNav) return;

  const TOP_THRESHOLD = 100;
  const BOTTOM_THRESHOLD =
    document.documentElement.scrollHeight - window.innerHeight - 80;
  const pastTopThreshold = window.scrollY > TOP_THRESHOLD;
  const pastBottomThreshold = window.scrollY > BOTTOM_THRESHOLD;

  if (pastTopThreshold && !pastBottomThreshold) {
    bottomNav.classList.add("visible");
  } else {
    bottomNav.classList.remove("visible");
  }
}
