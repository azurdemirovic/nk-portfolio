function startMarquee(selector) {
  if (!selector || !document.querySelector(selector)) return;

  var mqr = [];

  // 1000ms delay to get accurate widths after the font has loaded
  setTimeout(
    () => {
      mq(selector);
      mqRotate(mqr);
    },
    fontLoaded ? 0 : 1000
  );

  function objWidth(obj) {
    if (obj.offsetWidth) return obj.offsetWidth;
    if (obj.clip) return obj.clip.width;
    return 0;
  }

  function mq(selector) {
    this.mqo = document.querySelector(selector);
    this.mqText = document.querySelector("#mqr-text");
    if (!this.mqo || !this.mqText) return;

    var wid = objWidth(document.querySelector("#mqr-text")) + 5;
    var fulwid = objWidth(this.mqo);
    var txt = this.mqo.getElementsByTagName("span")[0].innerHTML;
    this.mqo.innerHTML = "";
    var heit = this.mqo.style.height;
    this.mqo.onmouseout = function () {
      mqRotate(mqr);
    };
    this.mqo.onmouseover = function () {
      clearTimeout(mqr[0].TO);
    };
    this.mqo.ary = [];
    var maxw = Math.ceil(fulwid / wid) * 6; // multiplying by 6 prevents the marquee from being too narrow in lieu of a resize event listener
    for (var i = 0; i < maxw; i++) {
      this.mqo.ary[i] = document.createElement("div");
      this.mqo.ary[i].innerHTML = txt;
      this.mqo.ary[i].style.position = "absolute";
      this.mqo.ary[i].style.left = wid * i + "px";
      this.mqo.ary[i].style.width = wid + "px";
      this.mqo.ary[i].style.height = heit;
      this.mqo.appendChild(this.mqo.ary[i]);
    }
    mqr.push(this.mqo);
  }

  function mqRotate(mqr) {
    if (!mqr || !mqr[0]) return;
    for (var j = mqr.length - 1; j > -1; j--) {
      maxa = mqr[j].ary.length;
      for (var i = 0; i < maxa; i++) {
        var x = mqr[j].ary[i].style;
        x.left = parseInt(x.left, 10) - 1 + "px";
      }
      var y = mqr[j].ary[0].style;
      if (parseInt(y.left, 10) + parseInt(y.width, 10) < 0) {
        var z = mqr[j].ary.shift();
        z.style.left = parseInt(z.style.left) + parseInt(z.style.width) * maxa + "px";
        mqr[j].ary.push(z);
      }
    }
    mqr[0].TO = setTimeout(() => {
      mqRotate(mqr);
    }, 20);
  }
}
