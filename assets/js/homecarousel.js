function initInfoButton() {
  $("#infoButton").click((e) => {
    const el = document.getElementById("info");
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 14;
      const bottomNav = document.getElementById("bottom-nav");
      if (bottomNav) {
        bottomNav.style.display = "none";
      }
      window.scrollTo({ top: y, behavior: "smooth" });

      setTimeout(() => {
        if (bottomNav) {
          bottomNav.style.display = "";
        }
      }, 1500);
    }
  });
}

function initHomeCarousels() {
  let projectCount = document.querySelectorAll(".project").length;
  counters = Array(projectCount + 1).fill(0);

  // carousel functionality
  var turning = false;
  for (let i = 0; i <= projectCount; i++) {
    // Helper function to handle carousel navigation
    function handleRightClick() {
      if (!turning) {
        turning = true;
        let carousel = $(`.carouselContainer.${i}`);
        let length = carousel[0].children.length;

        // load adjacent picture elements in the direction the
        // carousel is being advanced, counters[i] uses 1-based numbering
        loadPictureEl(carousel[0].children[getWrappedIndex(counters[i] + 1, length)]);
        loadPictureEl(carousel[0].children[getWrappedIndex(counters[i] + 2, length)]);

        // outgoing el
        let prev = carousel[0].children[counters[i]];
        prev.style.transition = "clip-path linear 1050ms";
        prev.style.clipPath = "inset(0% 100% 0% 0%)";
        prev.style.zIndex = "3";

        // set index
        counters[i]++;
        if (counters[i] >= carousel[0].children.length) {
          counters[i] = 0;
        }

        // incoming el
        let curr = carousel[0].children[counters[i]];
        curr.style.zIndex = "2";

        // set slide number
        $(`.project.${i}`)
          .find(".slidenum")
          .html(pad(counters[i] + 1) + "/" + pad(carousel[0].children.length));

        // unset styles
        setTimeout(function () {
          prev.style.zIndex = "1";
          prev.style.transition = "";
          prev.style.clipPath = "";
          curr.style.zIndex = "2";
          turning = false;
        }, 1050);
      }
    }

    function handleLeftClick() {
      if (!turning) {
        turning = true;
        let carousel = $(`.carouselContainer.${i}`);
        let length = carousel[0].children.length;

        // load adjacent picture elements in the direction the
        // carousel is being advanced, counters[i] uses 1-based numbering
        loadPictureEl(carousel[0].children[getWrappedIndex(counters[i] - 1, length)]);
        loadPictureEl(carousel[0].children[getWrappedIndex(counters[i] - 2, length)]);

        // outgoing el
        let prev = carousel[0].children[counters[i]];
        prev.style.transition = "clip-path linear 1050ms";
        prev.style.clipPath = "inset(0% 0% 0% 100%)";
        prev.style.zIndex = "3";

        // set index
        counters[i]--;
        if (counters[i] < 0) {
          counters[i] = carousel[0].children.length - 1;
        }

        // incoming el
        let curr = carousel[0].children[counters[i]];
        curr.style.zIndex = "2";

        // set slide number
        $(`.project.${i}`)
          .find(".slidenum")
          .html(pad(counters[i] + 1) + "/" + pad(carousel[0].children.length));

        // unset styles
        setTimeout(function () {
          prev.style.zIndex = "1";
          prev.style.transition = "";
          prev.style.clipPath = "";
          curr.style.zIndex = "2";
          turning = false;
        }, 1050);
      }
    }

    // right button - support both click and touch for mobile
    $(`.rightButton.${i}`)
      .off("click touchstart")
      .on("touchstart", function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleRightClick();
      })
      .on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleRightClick();
      });

    // left button - support both click and touch for mobile
    $(`.leftButton.${i}`)
      .off("click touchstart")
      .on("touchstart", function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleLeftClick();
      })
      .on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleLeftClick();
      });
  }
}
