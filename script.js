/* =========================================================
   Kurayoshi Kita HS LP - script.js (Final with Loop)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // --- Initialize all site functions ---
  sectionTitleReveal();
  initBackToTop();
  initDraggableCarousels();
  initMobileHeroSlider();
  initPerspectiveCarousel(); 
  initClubSliders(); // ★ この行を追加
});


/* ------------------------------------------
 * 1) Section title: fade-up on enter
 * ---------------------------------------- */
function sectionTitleReveal() {
  const titles = document.querySelectorAll(".section-title");
  if (!titles.length) return;

  const show = (el) => el.classList.add("is-visible");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
  );

  titles.forEach((title) => observer.observe(title));
}


/* ------------------------------------------
 * 2) Back-to-top button
 * ---------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle("is-visible", window.scrollY > 400);
  };
  
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}


/* ------------------------------------------
 * 3) Draggable carousels (.facilities-slider)
 * ---------------------------------------- */
function initDraggableCarousels() {
  const carousels = document.querySelectorAll('.facilities-slider');
  if (!carousels.length) return;

  carousels.forEach(block => {
    const track = block.querySelector('.facilities-track');
    const prevBtn = block.querySelector('.facilities-nav.prev');
    const nextBtn = block.querySelector('.facilities-nav.next');
    if (!track || !prevBtn || !nextBtn) return;

    let isDragging = false;
    let startX, scrollLeft;

    const getStep = () => {
      const firstSlide = track.querySelector('.facility-slide');
      if (!firstSlide) return track.clientWidth * 0.8;
      const gap = parseFloat(getComputedStyle(track).gap) || 18;
      return firstSlide.offsetWidth + gap;
    };

    const updateButtons = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = track.scrollLeft < 1;
      nextBtn.disabled = track.scrollLeft >= maxScroll - 1;
    };

    prevBtn.addEventListener('click', () => track.scrollBy({ left: -getStep(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left: getStep(), behavior: 'smooth' }));

    track.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    });

    const stopDragging = () => {
      isDragging = false;
      track.style.cursor = 'grab';
    };

    track.addEventListener('pointerleave', stopDragging);
    track.addEventListener('pointerup', stopDragging);

    track.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 2;
      track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons, { passive: true });
    updateButtons();
  });
}


/* ------------------------------------------
 * 4) Mobile Hero Image Fade Slider (.fade-slider)
 * ---------------------------------------- */
function initMobileHeroSlider() {
  if (window.innerWidth > 768) return;
  const slides = document.querySelectorAll(".fade-slider .slide");
  if (slides.length <= 1) return;
  
  let current = 0;
  const showSlide = (index) => {
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  }
  const nextSlide = () => {
      current = (current + 1) % slides.length;
      showSlide(current);
  }
  showSlide(current);
  setInterval(nextSlide, 5000);
}


/* ------------------------------------------
 * 5) Cover Flow Photo Gallery Carousel (with Loop)
 * ---------------------------------------- */
function initPerspectiveCarousel() {
  const carousel = document.querySelector(".perspective-carousel");
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const originalSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const prevBtn = carousel.querySelector('.carousel-button.prev');
  const nextBtn = carousel.querySelector('.carousel-button.next');
  if (originalSlides.length === 0) return;

  // ★ ループ用のクローンを作成
  const cloneCount = 2; // 左右に作成するクローンの数
  for (let i = 0; i < cloneCount; i++) {
    const firstClone = originalSlides[i].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1 - i].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);
  }

  const allSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  let currentIndex = cloneCount; // ★ 初期位置を最初の本物スライドに設定
  let isTransitioning = false;

  // Create dots for original slides
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    originalSlides.forEach((_, i) => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', `Go to slide ${i + 1}`);
      button.addEventListener('click', () => updateCarousel(i + cloneCount));
      dotsContainer.appendChild(button);
    });
  }
  const dots = dotsContainer ? Array.from(dotsContainer.children) : [];

  const updateCarousel = (newIndex, instant = false) => {
    if (isTransitioning) return;
    isTransitioning = !instant;
    currentIndex = newIndex;

    const currentSlide = allSlides[currentIndex];
    const trackContainer = carousel.querySelector('.carousel-track-container');
    if (!currentSlide || !trackContainer) return;

    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    }

    const offset = (trackContainer.offsetWidth / 2) - (currentSlide.offsetLeft + currentSlide.offsetWidth / 2);
    track.style.transform = `translateX(${offset}px)`;

    allSlides.forEach((slide, i) => {
      const diff = i - currentIndex;
      let transform, zIndex = allSlides.length - Math.abs(diff);
      if (diff === 0) {
        transform = `rotateY(0) scale(1)`;
        zIndex = allSlides.length + 1;
      } else {
        const scale = 1 - Math.abs(diff) * 0.15;
        const rotateY = -diff * 15;
        transform = `scale(${scale}) rotateY(${rotateY}deg)`;
      }
      slide.style.transform = transform;
      slide.style.zIndex = zIndex;
    });

    if (dots.length > 0) {
      const dotIndex = (currentIndex - cloneCount + originalSlides.length) % originalSlides.length;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === dotIndex));
    }
  };
  
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    // ★ ループのつなぎ目処理
    if (currentIndex < cloneCount) {
      currentIndex += originalSlides.length;
      updateCarousel(currentIndex, true);
    } else if (currentIndex >= cloneCount + originalSlides.length) {
      currentIndex -= originalSlides.length;
      updateCarousel(currentIndex, true);
    }
  });

  prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
  nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));
  
  allSlides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
        if (i >= cloneCount && i < cloneCount + originalSlides.length) {
            updateCarousel(i);
        }
    });
  });
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => updateCarousel(currentIndex, true), 200);
  });
  
  window.addEventListener('load', () => {
    updateCarousel(currentIndex, true);
    carousel.style.opacity = 1;
  });
  
  carousel.style.opacity = 0;
  carousel.style.transition = 'opacity 0.3s ease';
}

/* ------------------------------------------
 * 6) Club Sliders (.club-slider-wrap)
 * ---------------------------------------- */
function initClubSliders() {
  const sliders = document.querySelectorAll('.club-slider-wrap');
  if (!sliders.length) return;

  sliders.forEach(slider => {
    const track = slider.querySelector('.club-slider');
    const prevBtn = slider.querySelector('.club-prev');
    const nextBtn = slider.querySelector('.club-next');
    if (!track || !prevBtn || !nextBtn) return;

    const updateButtons = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = track.scrollLeft < 10; // 少し余裕を持たせる
      nextBtn.disabled = track.scrollLeft >= maxScroll - 10;
    };

    const scrollByStep = () => {
      // 1ステップのスクロール量を、表示領域の80%に設定
      return track.clientWidth * 0.8;
    };

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollByStep(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollByStep(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons, { passive: true });
    
    // 初期状態のボタン表示を確定
    updateButtons(); 
  });
}