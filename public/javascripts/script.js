// let cross = document.querySelector(".cross");
// let account = document.querySelector(".account");
// let container = document.querySelector(".container")

// account.addEventListener("click", function(){
//   container.style.transform =  "translateY(-0%)" 
// })


var swiper = new Swiper(".mySwiper", {
  spaceBetween: 30,
  centeredSlides: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
