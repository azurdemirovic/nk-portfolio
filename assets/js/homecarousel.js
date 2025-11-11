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
    // right button
    $(`.rightButton.${i}`).click(function () {
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
    });

    // left button
    $(`.leftButton.${i}`).click(function () {
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
    });
  }
}
