// IIFE with jQuery Wrapper
(function ($) {
  /*
   *----------------------------------
   * Document Ready
   *----------------------------------
   */

  $(document).ready(function () {
    AOS.init();
    // console.log(AOS);
    const elems = [...document.getElementsByClassName("opacity-0")];
    const secondStart = 25;
    const svg1 = elems.filter((elem, index) => index < secondStart);
    const svg2 = elems.filter((elem, index) => index >= secondStart);
    const entireSvg1 = document.querySelector(".svg1");
    const entireSvg2 = document.querySelector(".svg2");

    elems.forEach((x, index) => {
      x.addEventListener("webkitAnimationEnd", () => {
        if (index < secondStart) myEndFunction1(index);
        else myEndFunction2(index - secondStart);
      });
    });

    function swapElements(obj1, obj2) {
      var temp = document.createElement("div");
      obj1.parentNode.insertBefore(temp, obj1);
      obj2.parentNode.insertBefore(obj1, obj2);
      temp.parentNode.insertBefore(obj2, temp);
      temp.parentNode.removeChild(temp);
    }

    function myEndFunction1(index) {
      try {
        if (
          index === 1 ||
          index === 4 ||
          index === 7 ||
          index === 16 ||
          index === 22
        ) {
          setTimeout(() => {
            svg1[++index].classList.add("animate1");
            svg1[index].classList.remove("opacity-0");
          }, 75);
        } else {
          svg1[++index].classList.add("animate1");
          svg1[index].classList.remove("opacity-0");
        }
      } catch (e) {
        console.log(svg1);
        svg1.forEach((elem) => {
          elem.classList.remove("animate1");
          elem.classList.add("opacity-0");
        });

        swapElements(entireSvg1, entireSvg2);

        svg2[0].classList.add("animate");
        svg2[0].classList.remove("opacity-0");
      }
    }

    function myEndFunction2(index) {
      try {
        if (index === 6 || index === 8 || index === 11 || index === 15) {
          setTimeout(() => {
            svg2[++index].classList.add("animate");
            svg2[index].classList.remove("opacity-0");
          }, 75);
        } else {
          svg2[++index].classList.add("animate");
          svg2[index].classList.remove("opacity-0");
        }
      } catch (e) {
        console.log(svg2);
        svg2.forEach((elem) => {
          elem.classList.remove("animate");
          elem.classList.add("opacity-0");
        });

        swapElements(entireSvg2, entireSvg1);

        svg1[0].classList.add("animate1");
        svg1[0].classList.remove("opacity-0");
      }
    }

    function next() {
      var i = 0;
      elems[i].classList.add("animate1");
      elems[i].classList.remove("opacity-0");
    }

    window.addEventListener("load", next);

    //SCROLL animations
    $(window).scroll(function () {
      var scroll = $(window).scrollTop();
      // console.log(scroll);

      if (scroll == 0)
        document.querySelector(".navbar").style.backgroundColor = "";
      if (scroll > 0) {
        //console.log('a');
        $(".navigation").addClass("sticky-header");
      } else {
        //console.log('a');
        $(".navigation").removeClass("sticky-header");
      }
    });

    var init = 1;

    const call = () => {
      console.log("Hovering");
      var scroll = $(window).scrollTop();

      if (scroll === 0) {
        if (init) {
          init = 0;
          $(".navigation").addClass("sticky-header");
        } else {
          init = 1;
          $(".navigation").removeClass("sticky-header");
        }
      }
    };

    $(".navbar").hover(call);

    $(window).load(function () {
      $("div.loading").remove();
      $("body").removeClass("loading");
    });
  }); // DOM Ready
})(jQuery); // IIFE
